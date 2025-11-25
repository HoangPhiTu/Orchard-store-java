package com.orchard.orchard_store_backend.modules.catalog.brand.service;

import com.github.slugify.Slugify;
import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandDTO;
import com.orchard.orchard_store_backend.modules.catalog.brand.dto.BrandUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import com.orchard.orchard_store_backend.modules.catalog.brand.mapper.BrandAdminMapper;
import com.orchard.orchard_store_backend.modules.catalog.brand.repository.BrandRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BrandAdminServiceImpl implements BrandAdminService {

    private final BrandRepository brandRepository;
    private final BrandAdminMapper brandAdminMapper;
    private final ImageUploadService imageUploadService;

    /**
     * Slugify instance để tạo slug từ tên
     */
    private static final Slugify slugify = Slugify.builder()
            .lowerCase(true)
            .underscoreSeparator(false)
            .build();

    @Override
    @Transactional(readOnly = true)
    public Page<BrandDTO> getBrands(String keyword, String status, Pageable pageable) {
        Specification<Brand> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by keyword (search in name or slug)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("slug")), searchPattern)
                ));
            }

            // Filter by status
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                try {
                    Brand.Status brandStatus = Brand.Status.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), brandStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status filter: {}", status);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return brandRepository.findAll(spec, pageable)
                .map(brandAdminMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));
        return brandAdminMapper.toDTO(brand);
    }

    @Override
    public BrandDTO createBrand(BrandCreateRequest request) {
        // Kiểm tra name trùng lặp
        if (brandRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Brand", "name", request.getName());
        }

        // Tạo slug tự động từ name nếu không được cung cấp
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = generateUniqueSlug(request.getName());
        } else {
            // Nếu có slug từ request, kiểm tra trùng lặp
            if (brandRepository.existsBySlug(slug)) {
                throw new ResourceAlreadyExistsException("Brand", "slug", slug);
            }
        }

        // Map request sang entity
        Brand brand = brandAdminMapper.toEntity(request);
        brand.setSlug(slug);
        brand.setStatus(Brand.Status.ACTIVE); // Mặc định ACTIVE

        Brand saved = brandRepository.save(brand);
        log.info("Created brand: {} with slug: {}", saved.getName(), saved.getSlug());
        return brandAdminMapper.toDTO(saved);
    }

    @Override
    public BrandDTO updateBrand(Long id, BrandUpdateRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));

        // Lưu logo cũ để xóa sau nếu có thay đổi
        String oldLogoUrl = brand.getLogoUrl();
        String newLogoUrl = request.getLogoUrl();
        boolean isLogoChanged = (newLogoUrl == null && oldLogoUrl != null)
                || (newLogoUrl != null && !newLogoUrl.equals(oldLogoUrl));

        boolean isSuperAdmin = isCurrentUserSuperAdmin();

        boolean nameChanged = request.getName() != null
                && !request.getName().trim().isEmpty()
                && !request.getName().equals(brand.getName());

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            if (nameChanged
                    && brandRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new ResourceAlreadyExistsException("Brand", "name", request.getName());
            }
            brand.setName(request.getName());
        }

        boolean slugProvided = request.getSlug() != null && !request.getSlug().trim().isEmpty();
        boolean slugChanged = slugProvided && !request.getSlug().equals(brand.getSlug());

        if (slugChanged && !isSuperAdmin) {
            throw new OperationNotPermittedException("Chỉ Super Admin mới được thay đổi Slug");
        }

        if (slugChanged) {
            if (brandRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
                throw new ResourceAlreadyExistsException("Brand", "slug", request.getSlug());
            }
            brand.setSlug(request.getSlug());
        } else if (nameChanged && isSuperAdmin) {
            String newSlug = generateUniqueSlug(request.getName(), id);
            brand.setSlug(newSlug);
        }

        // Cập nhật các field khác
        if (request.getDescription() != null) {
            brand.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            brand.setLogoUrl(request.getLogoUrl());
        }
        if (request.getCountry() != null) {
            brand.setCountry(request.getCountry());
        }
        if (request.getWebsite() != null) {
            brand.setWebsiteUrl(request.getWebsite());
        }
        if (request.getDisplayOrder() != null) {
            brand.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getStatus() != null) {
            brand.setStatus(Brand.Status.valueOf(request.getStatus()));
        }

        Brand updated = brandRepository.save(brand);

        // Xóa logo cũ nếu có thay đổi
        if (isLogoChanged && oldLogoUrl != null) {
            try {
                imageUploadService.deleteImage(oldLogoUrl);
                log.info("Deleted old logo for brand {}: {}", id, oldLogoUrl);
            } catch (Exception e) {
                log.warn("Không thể xóa logo cũ của brand {}: {}", id, e.getMessage());
            }
        }

        log.info("Updated brand: {} with slug: {}", updated.getName(), updated.getSlug());
        return brandAdminMapper.toDTO(updated);
    }

    @Override
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));

        // Lưu logoUrl trước khi xóa
        String logoUrl = brand.getLogoUrl();

        // Xóa brand khỏi database
        brandRepository.delete(brand);

        // Xóa logo trên MinIO nếu có
        if (logoUrl != null && !logoUrl.trim().isEmpty()) {
            try {
                imageUploadService.deleteImage(logoUrl);
                log.info("Deleted logo for brand {}: {}", id, logoUrl);
            } catch (Exception e) {
                log.warn("Không thể xóa logo của brand {} sau khi xóa: {}", id, e.getMessage());
            }
        }

        log.info("Deleted brand: {}", id);
    }

    /**
     * Generate slug tự động từ tên và đảm bảo unique.
     * 
     * @param name Tên để tạo slug
     * @return Slug unique
     */
    private String generateUniqueSlug(String name) {
        String baseSlug = slugify.slugify(name);
        String slug = baseSlug;
        int counter = 1;

        // Kiểm tra và tạo slug unique
        while (brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        log.debug("Generated unique slug: {} from name: {}", slug, name);
        return slug;
    }

    /**
     * Generate slug tự động từ tên và đảm bảo unique (trừ brand hiện tại).
     * 
     * @param name Tên để tạo slug
     * @param excludeId ID của brand cần loại trừ (khi update)
     * @return Slug unique
     */
    private String generateUniqueSlug(String name, Long excludeId) {
        String baseSlug = slugify.slugify(name);
        String slug = baseSlug;
        int counter = 1;

        // Kiểm tra và tạo slug unique (trừ brand hiện tại)
        while (brandRepository.existsBySlugAndIdNot(slug, excludeId)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        log.debug("Generated unique slug: {} from name: {} (excluding id: {})", slug, name, excludeId);
        return slug;
    }

    private boolean isCurrentUserSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role -> "ROLE_SUPER_ADMIN".equals(role) || "SUPER_ADMIN".equals(role));
    }
}


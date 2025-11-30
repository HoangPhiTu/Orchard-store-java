package com.orchard.orchard_store_backend.modules.catalog.category.service;

import com.github.slugify.Slugify;
import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryCreateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryDTO;
import com.orchard.orchard_store_backend.modules.catalog.category.dto.CategoryUpdateRequest;
import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import com.orchard.orchard_store_backend.modules.catalog.category.mapper.CategoryAdminMapper;
import com.orchard.orchard_store_backend.modules.catalog.category.repository.CategoryRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.service.ImageUploadService;
import com.orchard.orchard_store_backend.modules.customer.service.CacheService;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryAdminServiceImpl implements CategoryAdminService {

    private final CategoryRepository categoryRepository;
    private final CategoryAdminMapper categoryAdminMapper;
    private final ImageUploadService imageUploadService;
    private final CacheService cacheService;
    
    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String CATEGORY_LIST_CACHE_KEY_PREFIX = "category:list:";
    private static final long CACHE_TTL_SECONDS = 1800; // 30 minutes

    /**
     * Slugify instance để tạo slug từ tên
     */
    private static final Slugify slugify = Slugify.builder()
            .lowerCase(true)
            .underscoreSeparator(false)
            .build();

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryDTO> getCategories(String keyword, String status, Pageable pageable) {
        // Build cache key from filters
        String cacheKey = CATEGORY_LIST_CACHE_KEY_PREFIX + 
            (keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : "") + ":" + 
            (status != null && !status.equalsIgnoreCase("ALL") ? status : "ALL") + ":" +
            pageable.getPageNumber() + ":" + pageable.getPageSize();
        
        // Try to get from cache (only for first page without filters for simplicity)
        if ((keyword == null || keyword.trim().isEmpty()) && 
            (status == null || status.equalsIgnoreCase("ALL")) && 
            pageable.getPageNumber() == 0) {
            Optional<Page<CategoryDTO>> cached = cacheService.getCachedPage(
                cacheKey, 
                pageable, 
                CategoryDTO.class
            );
            if (cached.isPresent()) {
                log.debug("Category list cache hit for key: {}", cacheKey);
                return cached.get();
            }
        }
        
        // Normalize keyword: null or empty string
        String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) 
                ? keyword.trim() 
                : null;

        // Convert status string to enum, or null if not provided or "ALL"
        Category.Status statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                statusEnum = Category.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", status);
            }
        }

        // Sort is already included in the query (ORDER BY clause)
        // But we still need to respect pageable sorting if provided
        // For now, we'll use the default sorting from query (level, displayOrder, name)
        Pageable sortedPageable = pageable;
        
        // Call searchCategories method from repository
        Page<Category> categories = categoryRepository.searchCategories(
                normalizedKeyword,
                statusEnum,
                sortedPageable
        );
        
        Page<CategoryDTO> result = categories.map(categoryAdminMapper::toDTO);
        
        // Cache first page without filters
        if ((keyword == null || keyword.trim().isEmpty()) && 
            (status == null || status.equalsIgnoreCase("ALL")) && 
            pageable.getPageNumber() == 0) {
            cacheService.cachePage(cacheKey, result, CACHE_TTL_SECONDS);
        }
        
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesTree() {
        // Try to get from cache first
        Optional<List<CategoryDTO>> cached = cacheService.getCached(
            CATEGORY_TREE_CACHE_KEY,
            new TypeReference<List<CategoryDTO>>() {}
        );
        if (cached.isPresent()) {
            log.debug("Category tree loaded from cache");
            return cached.get();
        }
        
        // Cache miss - build tree from database
        List<Category> allCategories = categoryRepository.findAllWithParent();
        
        // Build tree structure
        List<CategoryDTO> rootCategories = allCategories.stream()
                .filter(cat -> cat.getParentId() == null)
                .sorted((a, b) -> {
                    int orderCompare = Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0
                    );
                    if (orderCompare != 0) return orderCompare;
                    return a.getName().compareToIgnoreCase(b.getName());
                })
                .map(categoryAdminMapper::toDTO)
                .collect(Collectors.toList());

        // Recursively add children
        for (CategoryDTO root : rootCategories) {
            addChildren(root, allCategories);
        }

        // Cache the result
        cacheService.cache(CATEGORY_TREE_CACHE_KEY, rootCategories, CACHE_TTL_SECONDS);

        return rootCategories;
    }

    private void addChildren(CategoryDTO parent, List<Category> allCategories) {
        List<CategoryDTO> children = allCategories.stream()
                .filter(cat -> parent.getId().equals(cat.getParentId()))
                .sorted((a, b) -> {
                    int orderCompare = Integer.compare(
                            a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                            b.getDisplayOrder() != null ? b.getDisplayOrder() : 0
                    );
                    if (orderCompare != 0) return orderCompare;
                    return a.getName().compareToIgnoreCase(b.getName());
                })
                .map(categoryAdminMapper::toDTO)
                .collect(Collectors.toList());

        parent.setChildren(children);

        // Recursively add children's children
        for (CategoryDTO child : children) {
            addChildren(child, allCategories);
        }
    }

    /**
     * Helper method để clear children từ CategoryDTO để tránh circular reference khi serialize
     * Category detail không cần children, chỉ tree structure mới cần
     * Đảm bảo children luôn null trước khi cache để tránh serialization issues
     */
    private CategoryDTO clearChildren(CategoryDTO dto) {
        if (dto != null) {
            dto.setChildren(null);
            // Đảm bảo children list được clear hoàn toàn
            if (dto.getChildren() != null) {
                dto.getChildren().clear();
            }
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    // Tạm thời disable cache để test - sẽ enable lại sau khi fix cache issue
    // @Cacheable(value = "categories", key = "#id", unless = "#result == null")
    public CategoryDTO getCategoryById(Long id) {
        log.info("Getting category by ID: {} (no cache)", id);
        try {
            Category category = categoryRepository.findByIdWithParent(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", id));
            CategoryDTO dto = categoryAdminMapper.toDTO(category);
            // Clear children để tránh circular reference khi serialize
            // getCategoryById chỉ trả về category detail, không cần children
            // Children chỉ cần khi get tree structure
            CategoryDTO result = clearChildren(dto);
            log.debug("Category DTO after clearing children: id={}, name={}, children={}", 
                    result.getId(), result.getName(), result.getChildren());
            return result;
        } catch (ResourceNotFoundException e) {
            log.error("Category not found: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Error getting category by ID: {}", id, e);
            // Clear cache nếu có lỗi để tránh cache corrupted data
            evictCategoryDetailCache(id);
            throw new RuntimeException("Failed to get category: " + e.getMessage(), e);
        }
    }
    
    /**
     * Evict category detail cache
     */
    private void evictCategoryDetailCache(Long id) {
        // Spring Cache sẽ tự động evict với @CacheEvict
        // Nhưng có thể cần evict thủ công nếu có vấn đề
        try {
            // Force evict bằng cách gọi cache manager nếu cần
            // Hiện tại Spring Cache sẽ tự động evict với annotation
        } catch (Exception e) {
            log.warn("Error evicting category detail cache for ID: {}", id, e);
        }
    }

    /**
     * Evict category tree cache
     */
    private void evictCategoryTreeCache() {
        cacheService.evict(CATEGORY_TREE_CACHE_KEY);
    }
    
    /**
     * Evict category list cache
     */
    private void evictCategoryListCache() {
        // Delete common category list cache keys
        cacheService.evict(CATEGORY_LIST_CACHE_KEY_PREFIX + ":ALL:0:10");
        cacheService.evict(CATEGORY_LIST_CACHE_KEY_PREFIX + ":ALL:0:15");
        cacheService.evict(CATEGORY_LIST_CACHE_KEY_PREFIX + ":ALL:0:20");
        cacheService.evict(CATEGORY_LIST_CACHE_KEY_PREFIX + ":ALL:0:30");
    }

    @Override
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        // Kiểm tra name trùng lặp
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category", "name", request.getName());
        }

        // Tạo slug tự động từ name nếu không được cung cấp
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = generateUniqueSlug(request.getName());
        } else {
            // Nếu có slug từ request, kiểm tra trùng lặp
            if (categoryRepository.existsBySlug(slug)) {
                throw new ResourceAlreadyExistsException("Category", "slug", slug);
            }
        }

        // Xử lý parent và tính level, path
        Category parent = null;
        Integer level = 0;
        String path = null;

        Long requestParentId = request.getParentId();
        if (requestParentId != null) {
            parent = categoryRepository.findById(requestParentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", requestParentId));
            level = parent.getLevel() + 1;
            // Path sẽ được tính sau khi lưu category (cần ID)
        }

        // Map request sang entity
        Category category = categoryAdminMapper.toEntity(request);
        category.setSlug(slug);
        category.setStatus(Category.Status.ACTIVE); // Mặc định ACTIVE
        category.setParent(parent);
        category.setLevel(level);

        // Lưu category để có ID
        Category saved = categoryRepository.save(category);

        // Tính path sau khi có ID
        if (parent != null) {
            String parentPath = parent.getPath() != null ? parent.getPath() : String.valueOf(parent.getId());
            path = parentPath + "/" + saved.getId();
        } else {
            path = String.valueOf(saved.getId());
        }
        saved.setPath(path);
        saved = categoryRepository.save(saved);

        log.info("Created category: {} with slug: {}, level: {}, path: {}", 
                saved.getName(), saved.getSlug(), saved.getLevel(), saved.getPath());
        
        // Evict caches
        evictCategoryTreeCache();
        evictCategoryListCache();
        
        CategoryDTO dto = categoryAdminMapper.toDTO(saved);
        // Clear children để tránh circular reference khi serialize
        return clearChildren(dto);
    }

    @Override
    @CacheEvict(value = "categories", key = "#id")
    public CategoryDTO updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findByIdWithParent(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Lưu image cũ để xóa sau nếu có thay đổi
        String oldImageUrl = category.getImageUrl();
        String newImageUrl = request.getImageUrl();
        boolean isImageChanged = (newImageUrl == null && oldImageUrl != null)
                || (newImageUrl != null && !newImageUrl.equals(oldImageUrl));

        boolean isSuperAdmin = isCurrentUserSuperAdmin();

        boolean nameChanged = request.getName() != null
                && !request.getName().trim().isEmpty()
                && !request.getName().equals(category.getName());

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            if (nameChanged
                    && categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new ResourceAlreadyExistsException("Category", "name", request.getName());
            }
            category.setName(request.getName());
        }

        boolean slugProvided = request.getSlug() != null && !request.getSlug().trim().isEmpty();
        boolean slugChanged = slugProvided && !request.getSlug().equals(category.getSlug());

        if (slugChanged && !isSuperAdmin) {
            throw new OperationNotPermittedException("Chỉ Super Admin mới được thay đổi Slug");
        }

        if (slugChanged) {
            if (categoryRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
                throw new ResourceAlreadyExistsException("Category", "slug", request.getSlug());
            }
            category.setSlug(request.getSlug());
        } else if (nameChanged && isSuperAdmin) {
            String newSlug = generateUniqueSlug(request.getName(), id);
            category.setSlug(newSlug);
        }

        // Xử lý parent change
        Long newParentId = request.getParentId();
        Long currentParentId = category.getParentId();
        boolean parentChanged = (newParentId == null && currentParentId != null) 
                || (newParentId != null && !newParentId.equals(currentParentId));
        
        if (parentChanged) {
            // Validate Loop: Không cho phép chọn chính mình hoặc con cháu của mình làm cha
            if (newParentId != null) {
                // 1. Không cho phép set parent là chính nó
                if (newParentId.equals(id)) {
                    throw new IllegalArgumentException("Cannot set category as its own parent");
                }
                
                // 2. Không cho phép set parent là con cháu của nó (tránh circular reference)
                if (isDescendantOf(category, newParentId)) {
                    throw new IllegalArgumentException("Cannot set descendant category as parent (would create circular reference)");
                }
            }
            
            // Nếu set parentId = null (trở thành root)
            if (newParentId == null) {
                category.setParent(null);
                category.setLevel(0);
                category.setPath(String.valueOf(category.getId()));
                // Update children's level and path recursively
                updateChildrenLevelAndPath(category, 0);
            } else {
                // Set parent mới
                Category newParent = categoryRepository.findById(newParentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Parent Category", newParentId));
                
                category.setParent(newParent);
                Integer newLevel = newParent.getLevel() + 1;
                category.setLevel(newLevel);
                
                // Update path
                String parentPath = newParent.getPath() != null ? newParent.getPath() : String.valueOf(newParent.getId());
                category.setPath(parentPath + "/" + category.getId());
                
                // Update children's level and path recursively
                updateChildrenLevelAndPath(category, newLevel);
            }
        }

        // Cập nhật các field khác
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }

        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                Category.Status categoryStatus = Category.Status.valueOf(request.getStatus().toUpperCase());
                category.setStatus(categoryStatus);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", request.getStatus());
            }
        }

        Category updated = categoryRepository.save(category);

        // Xóa image cũ trên MinIO nếu có thay đổi
        if (isImageChanged && oldImageUrl != null && !oldImageUrl.trim().isEmpty()) {
            try {
                imageUploadService.deleteImage(oldImageUrl);
                log.info("Deleted image for category {}: {}", id, oldImageUrl);
            } catch (Exception e) {
                log.warn("Không thể xóa image của category {} sau khi cập nhật: {}", id, e.getMessage());
            }
        }

        log.info("Updated category: {}", id);
        
        // Evict caches
        evictCategoryTreeCache();
        evictCategoryListCache();
        
        CategoryDTO dto = categoryAdminMapper.toDTO(updated);
        // Clear children để tránh circular reference khi serialize
        return clearChildren(dto);
    }

    @Override
    @CacheEvict(value = "categories", key = "#id")
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findByIdWithParent(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Kiểm tra ràng buộc: Không được xóa nếu đang có Category con
        // Sử dụng repository để kiểm tra (đảm bảo load từ DB)
        long childrenCount = categoryRepository.countByParentId(id);
        if (childrenCount > 0) {
            throw new IllegalStateException("Category has children. Cannot delete category with children.");
        }

        // Kiểm tra ràng buộc: Không được xóa nếu đang có Sản phẩm thuộc về nó
        if (categoryRepository.hasProducts(id)) {
            throw new IllegalStateException("Không thể xóa category vì đang có sản phẩm thuộc về nó");
        }

        // Lưu imageUrl trước khi xóa
        String imageUrl = category.getImageUrl();

        // Xóa category khỏi database
        categoryRepository.delete(category);

        // Xóa image trên MinIO nếu có
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            try {
                imageUploadService.deleteImage(imageUrl);
                log.info("Deleted image for category {}: {}", id, imageUrl);
            } catch (Exception e) {
                log.warn("Không thể xóa image của category {} sau khi xóa: {}", id, e.getMessage());
            }
        }
        
        // Evict caches
        evictCategoryTreeCache();
        evictCategoryListCache();
        
        log.info("Deleted category: {}", id);
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
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    /**
     * Generate slug tự động từ tên và đảm bảo unique (trừ category hiện tại).
     * 
     * @param name Tên để tạo slug
     * @param excludeId ID của category cần loại trừ (khi update)
     * @return Slug unique
     */
    private String generateUniqueSlug(String name, Long excludeId) {
        String baseSlug = slugify.slugify(name);
        String slug = baseSlug;
        int counter = 1;

        // Kiểm tra và tạo slug unique (trừ category hiện tại)
        while (categoryRepository.existsBySlugAndIdNot(slug, excludeId)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        log.debug("Generated unique slug: {} from name: {} (excluding id: {})", slug, name, excludeId);
        return slug;
    }

    /**
     * Kiểm tra xem category có phải là con cháu của parentId không (tránh circular reference)
     */
    private boolean isDescendantOf(Category category, Long parentId) {
        if (parentId == null) {
            return false;
        }
        if (category.getParentId() == null) {
            return false;
        }
        Long catParentId = category.getParentId();
        if (catParentId != null && catParentId.equals(parentId)) {
            return true;
        }
        Category potentialParent = categoryRepository.findById(parentId)
                .orElse(null);
        if (potentialParent == null) {
            return false;
        }
        String currentPath = category.getPath();
        String parentPath = potentialParent.getPath();
        if (currentPath == null || parentPath == null) {
            return false;
        }
        String normalizedCurrentPath = currentPath.endsWith("/")
                ? currentPath
                : currentPath + "/";
        return parentPath.startsWith(normalizedCurrentPath);
    }

    /**
     * Cập nhật level và path cho tất cả các category con khi parent thay đổi
     */
    private void updateChildrenLevelAndPath(Category parent, Integer parentLevel) {
        Long parentId = parent.getId();
        if (parentId == null) {
            return;
        }
        List<Category> children = categoryRepository.findByParentId(parentId);
        for (Category child : children) {
            Integer newLevel = parentLevel + 1;
            child.setLevel(newLevel);
            String parentPath = parent.getPath() != null ? parent.getPath() : String.valueOf(parentId);
            Long childId = child.getId();
            if (childId != null) {
                child.setPath(parentPath + "/" + childId);
            }
            categoryRepository.save(child);
            
            // Recursively update grandchildren
            updateChildrenLevelAndPath(child, newLevel);
        }
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


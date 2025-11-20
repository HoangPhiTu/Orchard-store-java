package com.orchard.orchard_store_backend.modules.catalog.bundle.service;

import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.BundleItemDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.dto.ProductBundleDTO;
import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.BundleItem;
import com.orchard.orchard_store_backend.modules.catalog.bundle.entity.ProductBundle;
import com.orchard.orchard_store_backend.modules.catalog.bundle.mapper.BundleItemMapper;
import com.orchard.orchard_store_backend.modules.catalog.bundle.mapper.ProductBundleMapper;
import com.orchard.orchard_store_backend.modules.catalog.bundle.repository.BundleItemRepository;
import com.orchard.orchard_store_backend.modules.catalog.bundle.repository.ProductBundleRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.ProductVariant;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductRepository;
import com.orchard.orchard_store_backend.modules.catalog.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductBundleServiceImpl implements ProductBundleService {

    private final ProductBundleRepository bundleRepository;
    private final BundleItemRepository bundleItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductBundleMapper bundleMapper;
    private final BundleItemMapper bundleItemMapper;

    @Override
    @Transactional
    public ProductBundleDTO createBundle(ProductBundleDTO dto) {
        // Kiểm tra slug đã tồn tại chưa
        if (bundleRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Bundle with slug already exists: " + dto.getSlug());
        }

        ProductBundle bundle = bundleMapper.toEntity(dto);

        // Xử lý items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (BundleItemDTO itemDTO : dto.getItems()) {
                Product product = productRepository.findById(itemDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemDTO.getProductId()));

                BundleItem item = bundleItemMapper.toEntity(itemDTO);
                item.setBundle(bundle);
                item.setProduct(product);

                if (itemDTO.getProductVariantId() != null) {
                    ProductVariant variant = variantRepository.findById(itemDTO.getProductVariantId())
                            .orElseThrow(() -> new RuntimeException("Product Variant not found: " + itemDTO.getProductVariantId()));
                    item.setProductVariant(variant);
                }

                bundle.addItem(item);
            }
        }

        // Tính toán giá nếu chưa có
        if (dto.getOriginalTotalPrice() == null && !bundle.getItems().isEmpty()) {
            calculateBundlePrices(bundle);
        }

        ProductBundle saved = bundleRepository.save(bundle);
        return bundleMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductBundleDTO getBundleById(Long id) {
        ProductBundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found: " + id));
        return bundleMapper.toDTO(bundle);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductBundleDTO getBundleBySlug(String slug) {
        ProductBundle bundle = bundleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Bundle not found with slug: " + slug));
        return bundleMapper.toDTO(bundle);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductBundleDTO> getAllBundles(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            ProductBundle.Status bundleStatus = ProductBundle.Status.valueOf(status.toUpperCase());
            return bundleRepository.findByStatusOrderByDisplayOrderAsc(bundleStatus, pageable)
                    .map(bundleMapper::toDTO);
        }
        return bundleRepository.findAll(pageable).map(bundleMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBundleDTO> getBundlesByType(String bundleType, String status) {
        ProductBundle.BundleType type = ProductBundle.BundleType.valueOf(bundleType.toUpperCase());
        ProductBundle.Status bundleStatus = (status != null && !status.isEmpty())
                ? ProductBundle.Status.valueOf(status.toUpperCase())
                : ProductBundle.Status.ACTIVE;
        return bundleRepository.findByStatusAndBundleTypeOrderByDisplayOrderAsc(bundleStatus, type)
                .stream()
                .map(bundleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBundleDTO> getActiveBundles(String status) {
        ProductBundle.Status bundleStatus = (status != null && !status.isEmpty())
                ? ProductBundle.Status.valueOf(status.toUpperCase())
                : ProductBundle.Status.ACTIVE;
        return bundleRepository.findActiveBundles(bundleStatus, LocalDateTime.now())
                .stream()
                .map(bundleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductBundleDTO> getActiveBundlesByType(String bundleType, String status) {
        ProductBundle.BundleType type = ProductBundle.BundleType.valueOf(bundleType.toUpperCase());
        ProductBundle.Status bundleStatus = (status != null && !status.isEmpty())
                ? ProductBundle.Status.valueOf(status.toUpperCase())
                : ProductBundle.Status.ACTIVE;
        return bundleRepository.findActiveBundlesByType(bundleStatus, type, LocalDateTime.now())
                .stream()
                .map(bundleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductBundleDTO> getTopDiscountBundles(Pageable pageable) {
        return bundleRepository.findTopDiscountBundles(LocalDateTime.now(), pageable)
                .map(bundleMapper::toDTO);
    }

    @Override
    @Transactional
    public ProductBundleDTO updateBundle(Long id, ProductBundleDTO dto) {
        ProductBundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found: " + id));

        // Kiểm tra slug nếu thay đổi
        if (!bundle.getSlug().equals(dto.getSlug()) && bundleRepository.existsBySlugAndIdNot(dto.getSlug(), id)) {
            throw new RuntimeException("Bundle with slug already exists: " + dto.getSlug());
        }

        bundleMapper.updateEntityFromDto(dto, bundle);

        // Xử lý items
        if (dto.getItems() != null) {
            // Xóa items cũ
            bundle.getItems().clear();

            // Thêm items mới
            for (BundleItemDTO itemDTO : dto.getItems()) {
                Product product = productRepository.findById(itemDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemDTO.getProductId()));

                BundleItem item = bundleItemMapper.toEntity(itemDTO);
                item.setBundle(bundle);
                item.setProduct(product);

                if (itemDTO.getProductVariantId() != null) {
                    ProductVariant variant = variantRepository.findById(itemDTO.getProductVariantId())
                            .orElseThrow(() -> new RuntimeException("Product Variant not found: " + itemDTO.getProductVariantId()));
                    item.setProductVariant(variant);
                }

                bundle.addItem(item);
            }
        }

        // Tính toán lại giá nếu items thay đổi
        if (dto.getItems() != null && !bundle.getItems().isEmpty()) {
            calculateBundlePrices(bundle);
        }

        ProductBundle updated = bundleRepository.save(bundle);
        return bundleMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteBundle(Long id) {
        if (!bundleRepository.existsById(id)) {
            throw new RuntimeException("Bundle not found: " + id);
        }
        bundleRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProductBundleDTO calculateBundlePrice(Long bundleId) {
        ProductBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new RuntimeException("Bundle not found: " + bundleId));

        calculateBundlePrices(bundle);

        ProductBundle saved = bundleRepository.save(bundle);
        return bundleMapper.toDTO(saved);
    }

    /**
     * Tính toán giá bundle dựa trên items
     */
    private void calculateBundlePrices(ProductBundle bundle) {
        BigDecimal originalTotal = BigDecimal.ZERO;

        for (BundleItem item : bundle.getItems()) {
            BigDecimal itemPrice = BigDecimal.ZERO;

            if (item.getProductVariant() != null) {
                // Lấy giá từ variant (ưu tiên salePrice nếu có)
                itemPrice = item.getProductVariant().getSalePrice() != null
                        ? item.getProductVariant().getSalePrice()
                        : item.getProductVariant().getPrice();
            }

            // Tính tổng: giá * số lượng
            originalTotal = originalTotal.add(itemPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        bundle.setOriginalTotalPrice(originalTotal);

        // Tính discount
        if (bundle.getBundlePrice() != null && originalTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = originalTotal.subtract(bundle.getBundlePrice());
            bundle.setDiscountAmount(discountAmount);

            // Tính phần trăm giảm giá
            BigDecimal discountPercentage = discountAmount
                    .divide(originalTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
            bundle.setDiscountPercentage(discountPercentage);
        }
    }
}


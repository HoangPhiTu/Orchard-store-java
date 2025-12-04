package com.orchard.orchard_store_backend.modules.catalog.attribute.repository;

import com.orchard.orchard_store_backend.modules.catalog.attribute.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {
    List<CategoryAttribute> findByCategoryId(Long categoryId);
    List<CategoryAttribute> findByCategoryIdIn(List<Long> categoryIds);
    boolean existsByCategoryIdAndAttributeId(Long categoryId, Long attributeId);
    Optional<CategoryAttribute> findByCategoryIdAndAttributeId(Long categoryId, Long attributeId);
    void deleteByCategoryIdAndAttributeId(Long categoryId, Long attributeId);
}


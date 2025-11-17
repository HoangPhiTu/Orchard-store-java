package com.orchard.orchard_store_backend.modules.catalog.category.repository;

import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIdOrderByDisplayOrderAsc(Long parentId);

    List<Category> findByParentIsNullOrderByDisplayOrderAsc();

    List<Category> findByStatusOrderByDisplayOrderAsc(Category.Status status);

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' AND c.parent IS NULL ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findAllActiveRootCategories();

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' AND c.parent.id = :parentId ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findActiveChildrenByParentId(Long parentId);

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' AND c.level = :level ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findActiveCategoriesByLevel(Integer level);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}


package com.orchard.orchard_store_backend.modules.catalog.category.repository;

import com.orchard.orchard_store_backend.modules.catalog.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByStatusOrderByDisplayOrderAsc(Category.Status status);

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' ORDER BY c.level ASC, c.displayOrder ASC, c.name ASC")
    List<Category> findAllActiveCategories();

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' AND c.parent IS NULL ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findAllActiveRootCategories();

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' AND c.parent.id = :parentId ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findActiveChildrenByParentId(@Param("parentId") Long parentId);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    // Hierarchy queries
    List<Category> findByParentId(Long parentId);

    List<Category> findByParentIdOrderByDisplayOrderAsc(Long parentId);

    boolean existsByParentId(Long parentId);

    long countByParentId(Long parentId);

    // Check if category has products
    // Note: This query will be implemented when Product entity has categoryId field
    // For now, return false (no products check)
    default boolean hasProducts(Long categoryId) {
        // TODO: Implement when Product entity has categoryId field
        return false;
    }

    // Find all root categories (level 0)
    List<Category> findByParentIdIsNullOrderByDisplayOrderAsc();

    // Find categories by level
    List<Category> findByLevelOrderByDisplayOrderAsc(Integer level);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parent WHERE c.id = :id")
    Optional<Category> findByIdWithParent(@Param("id") Long id);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.parent")
    List<Category> findAllWithParent();

    /**
     * Search categories with keyword and status filter
     * Supports pagination and sorting
     */
    @EntityGraph(attributePaths = {"parent"})
    @Query("SELECT c FROM Category c WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR c.status = :status) " +
           "ORDER BY c.level ASC, c.displayOrder ASC, c.name ASC")
    Page<Category> searchCategories(@Param("keyword") String keyword,
                                    @Param("status") Category.Status status,
                                    Pageable pageable);
}

package com.orchard.orchard_store_backend.modules.catalog.concentration.repository;

import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcentrationRepository extends JpaRepository<Concentration, Long>, JpaSpecificationExecutor<Concentration> {

    Optional<Concentration> findBySlug(String slug);

    @Query("SELECT c FROM Concentration c WHERE c.status = 'ACTIVE' ORDER BY c.displayOrder ASC, c.name ASC")
    List<Concentration> findAllActiveConcentrations();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * Kiểm tra xem concentration có đang được sử dụng bởi product_variants không
     */
    @Query("SELECT COUNT(pv) > 0 FROM ProductVariant pv WHERE pv.concentration.id = :concentrationId")
    boolean isUsedByProductVariants(@Param("concentrationId") Long concentrationId);
}


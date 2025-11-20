package com.orchard.orchard_store_backend.modules.catalog.concentration.repository;

import com.orchard.orchard_store_backend.modules.catalog.concentration.entity.Concentration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcentrationRepository extends JpaRepository<Concentration, Long> {

    Optional<Concentration> findBySlug(String slug);

    @Query("SELECT c FROM Concentration c WHERE c.status = 'ACTIVE' ORDER BY c.displayOrder ASC, c.name ASC")
    List<Concentration> findAllActiveConcentrations();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}


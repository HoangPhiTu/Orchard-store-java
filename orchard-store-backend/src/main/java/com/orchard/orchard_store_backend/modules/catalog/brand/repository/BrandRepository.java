package com.orchard.orchard_store_backend.modules.catalog.brand.repository;

import com.orchard.orchard_store_backend.modules.catalog.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long>, JpaSpecificationExecutor<Brand> {

    Optional<Brand> findBySlug(String slug);

    List<Brand> findByStatusOrderByDisplayOrderAsc(Brand.Status status);

    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE' ORDER BY b.displayOrder ASC, b.name ASC")
    List<Brand> findAllActiveBrands();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    @NonNull
    Page<Brand> findAll(@NonNull Pageable pageable);
}


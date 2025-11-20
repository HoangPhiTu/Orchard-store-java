package com.orchard.orchard_store_backend.modules.catalog.search.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.catalog.product.entity.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "search_queries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_text", nullable = false, length = 500)
    private String queryText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", length = 255)
    private String sessionId;

    // Results
    @Column(name = "results_count", nullable = false)
    @Builder.Default
    private Integer resultsCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clicked_product_id")
    private Product clickedProduct;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    // Filters applied
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters_applied", columnDefinition = "jsonb")
    private Map<String, Object> filtersApplied; // {brand: [1,2], price_range: {min: 1000000, max: 5000000}}

    // Device & source
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}


package com.orchard.orchard_store_backend.modules.catalog.product.entity;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product_comparisons", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_ids"}),
    @UniqueConstraint(columnNames = {"session_id", "product_ids"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", length = 255)
    private String sessionId;

    // Array of product IDs
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "product_ids", columnDefinition = "bigint[]")
    private List<Long> productIds;

    @Column(name = "compared_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime comparedAt;
}


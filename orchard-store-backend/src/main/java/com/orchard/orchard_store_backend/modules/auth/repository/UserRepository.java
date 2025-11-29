package com.orchard.orchard_store_backend.modules.auth.repository;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    /**
     * Find user by email (basic query without EntityGraph)
     * Used by Spring Security for authentication
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by email with eager fetching of roles and permissions
     * This prevents LazyInitializationException when accessing userRoles and role.permissions
     * Using @Query to avoid Spring Data JPA trying to parse "WithRolesAndPermissions" as a property
     */
    @EntityGraph(attributePaths = {"userRoles", "userRoles.role", "primaryRole"})
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);
    
    /**
     * Find user by email with roles (for use in services that need hierarchy level)
     * Using @Query to avoid Spring Data JPA trying to parse "WithRoles" as a property
     */
    @EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
    
    /**
     * Find user by ID with roles (for use in services that need hierarchy level)
     * Using @Query to avoid Spring Data JPA trying to parse "WithRoles" as a property
     */
    @EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    boolean existsByEmail(String email);
    
    /**
     * Check if phone number exists for any user (excluding the specified user ID)
     * @param phone Phone number to check
     * @param excludeUserId User ID to exclude from the check
     * @return true if phone exists for another user
     */
    boolean existsByPhoneAndIdNot(String phone, Long excludeUserId);
    
    /**
     * Check if phone number exists for any user
     * @param phone Phone number to check
     * @return true if phone exists
     */
    boolean existsByPhone(String phone);
    
    /**
     * Search users using PostgreSQL full-text search
     * This method uses native SQL to leverage GIN indexes for better performance
     * 
     * @param keyword Search keyword (will be converted to tsquery)
     * @param status User status filter (optional)
     * @param pageable Pagination and sorting
     * @return Page of users matching the search criteria
     */
    @Query(value = """
        SELECT DISTINCT u.* FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE 
            (:keyword IS NULL OR :keyword = '' OR 
             to_tsvector('english', 
                 COALESCE(u.email, '') || ' ' || 
                 COALESCE(u.full_name, '') || ' ' || 
                 COALESCE(u.phone, '')
             ) @@ plainto_tsquery('english', :keyword))
            AND (:status IS NULL OR u.status::text = :status)
        ORDER BY 
            CASE WHEN :keyword IS NOT NULL AND :keyword != '' THEN
                ts_rank(to_tsvector('english', 
                    COALESCE(u.email, '') || ' ' || 
                    COALESCE(u.full_name, '') || ' ' || 
                    COALESCE(u.phone, '')
                ), plainto_tsquery('english', :keyword))
            ELSE 0 END DESC,
            u.created_at DESC
        """,
        countQuery = """
        SELECT COUNT(DISTINCT u.id) FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE 
            (:keyword IS NULL OR :keyword = '' OR 
             to_tsvector('english', 
                 COALESCE(u.email, '') || ' ' || 
                 COALESCE(u.full_name, '') || ' ' || 
                 COALESCE(u.phone, '')
             ) @@ plainto_tsquery('english', :keyword))
            AND (:status IS NULL OR u.status::text = :status)
        """,
        nativeQuery = true)
    org.springframework.data.domain.Page<User> searchUsersFullText(
        @Param("keyword") String keyword,
        @Param("status") String status,
        org.springframework.data.domain.Pageable pageable
    );
}


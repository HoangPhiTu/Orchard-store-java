package com.orchard.orchard_store_backend.modules.auth.repository;

import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    /**
     * Find user by email with eager fetching of roles and permissions
     * This prevents LazyInitializationException when accessing userRoles and role.permissions
     */
    @EntityGraph(attributePaths = {"userRoles", "userRoles.role", "primaryRole"})
    Optional<User> findByEmail(String email);

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
}


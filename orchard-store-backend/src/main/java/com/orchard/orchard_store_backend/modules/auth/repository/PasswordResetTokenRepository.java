package com.orchard.orchard_store_backend.modules.auth.repository;

import com.orchard.orchard_store_backend.modules.auth.entity.PasswordResetToken;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.token = :token " +
           "AND prt.used = false AND prt.expiresAt > :now")
    Optional<PasswordResetToken> findValidToken(@Param("token") String token, @Param("now") LocalDateTime now);

    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.user = :user " +
           "AND prt.used = false AND prt.expiresAt > :now " +
           "ORDER BY prt.createdAt DESC")
    Optional<PasswordResetToken> findValidTokenByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE PasswordResetToken prt SET prt.used = true, prt.usedAt = :usedAt WHERE prt.token = :token")
    void markTokenAsUsed(@Param("token") String token, @Param("usedAt") LocalDateTime usedAt);

    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiresAt < :now OR prt.used = true")
    void deleteExpiredOrUsedTokens(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(prt) FROM PasswordResetToken prt WHERE prt.user = :user " +
           "AND prt.used = false AND prt.createdAt > :since")
    long countUnusedTokensByUserSince(@Param("user") User user, @Param("since") LocalDateTime since);
}


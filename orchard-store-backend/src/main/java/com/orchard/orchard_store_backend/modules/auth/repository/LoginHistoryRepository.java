package com.orchard.orchard_store_backend.modules.auth.repository;

import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    Page<LoginHistory> findByUserOrderByLoginAtDesc(User user, Pageable pageable);

    List<LoginHistory> findTop10ByUserOrderByLoginAtDesc(User user);

    Page<LoginHistory> findByUserAndLoginStatusOrderByLoginAtDesc(
            User user,
            LoginHistory.LoginStatus status,
            Pageable pageable
    );

    @Query("SELECT lh FROM LoginHistory lh WHERE lh.user = :user " +
           "AND lh.loginAt BETWEEN :startDate AND :endDate " +
           "ORDER BY lh.loginAt DESC")
    Page<LoginHistory> findByUserAndLoginAtBetween(
            @Param("user") User user,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    long countByUserAndLoginStatus(User user, LoginHistory.LoginStatus status);

    LoginHistory findFirstByUserAndLoginStatusOrderByLoginAtDesc(
            User user,
            LoginHistory.LoginStatus status
    );

    /**
     * Lấy lịch sử đăng nhập theo User ID, sắp xếp giảm dần theo thời gian
     * @param userId ID của user
     * @param pageable Pagination và sorting
     * @return Page<LoginHistory>
     */
    @Query("SELECT lh FROM LoginHistory lh WHERE lh.user.id = :userId ORDER BY lh.loginAt DESC")
    Page<LoginHistory> findByUserId(@Param("userId") Long userId, Pageable pageable);
}


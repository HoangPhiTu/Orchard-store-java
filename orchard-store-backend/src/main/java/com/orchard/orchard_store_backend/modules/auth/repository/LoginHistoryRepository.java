package com.orchard.orchard_store_backend.modules.auth.repository;

import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    Page<LoginHistory> findByUserAndLoginAtBetween(
            User user,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    long countByUserAndLoginStatus(User user, LoginHistory.LoginStatus status);

    LoginHistory findFirstByUserAndLoginStatusOrderByLoginAtDesc(
            User user,
            LoginHistory.LoginStatus status
    );

    /**
     * Lấy lịch sử đăng nhập theo User ID, sắp xếp giảm dần theo thời gian
     */
    Page<LoginHistory> findByUserIdOrderByLoginAtDesc(Long userId, Pageable pageable);
}


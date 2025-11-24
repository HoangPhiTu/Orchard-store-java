package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface LoginHistoryService {

    void logLogin(User user, HttpServletRequest request, LoginHistory.LoginStatus status, String failureReason);

    default void saveLoginHistory(
            User user,
            HttpServletRequest request,
            LoginHistory.LoginStatus status,
            String failureReason
    ) {
        logLogin(user, request, status, failureReason);
    }

    Page<LoginHistoryDTO> getLoginHistory(User user, Pageable pageable);

    Page<LoginHistoryDTO> getLoginHistoryByStatus(User user, LoginHistory.LoginStatus status, Pageable pageable);

    List<LoginHistoryDTO> getRecentLoginHistory(User user, int limit);

    Page<LoginHistoryDTO> getLoginHistoryByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    long getSuccessfulLoginCount(User user);

    long getFailedLoginCount(User user);

    LoginHistoryDTO getLastSuccessfulLogin(User user);
}


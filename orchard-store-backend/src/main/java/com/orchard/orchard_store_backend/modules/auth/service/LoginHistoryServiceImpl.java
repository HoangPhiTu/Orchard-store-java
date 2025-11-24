package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.mapper.LoginHistoryMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.LoginHistoryRepository;
import com.orchard.orchard_store_backend.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginHistoryServiceImpl implements LoginHistoryService {

    private static final String UNKNOWN_LOCATION = "Unknown";

    private final LoginHistoryRepository loginHistoryRepository;
    private final UserAgentParser userAgentParser;
    private final LoginHistoryMapper loginHistoryMapper;

    @Override
    @Transactional
    public void logLogin(
            User user,
            HttpServletRequest request,
            LoginHistory.LoginStatus status,
            String failureReason
    ) {
        if (user == null) {
            log.warn("Skip login history logging because user is null");
            return;
        }

        try {
            String userAgent = request != null ? request.getHeader("User-Agent") : null;
            String ipAddress = request != null ? userAgentParser.getClientIP(request) : "0.0.0.0";
            String browser = userAgentParser.parseBrowser(userAgent);
            String os = userAgentParser.parseOS(userAgent);
            String deviceType = userAgentParser.parseDeviceType(userAgent);
            LoginHistory.LoginStatus resolvedStatus =
                    status != null ? status : LoginHistory.LoginStatus.FAILED;

            final LoginHistory loginHistory = LoginHistory.builder()
                    .user(user)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .deviceType(deviceType)
                    .browser(browser)
                    .os(os)
                    .location(UNKNOWN_LOCATION)
                    .loginStatus(resolvedStatus)
                    .failureReason(failureReason)
                    .build();

            loginHistoryRepository.save(Objects.requireNonNull(loginHistory));
        } catch (Exception ex) {
            log.error("Failed to log login history for user {}: {}", user.getEmail(), ex.getMessage(), ex);
        }
    }

    @Override
    public Page<LoginHistoryDTO> getLoginHistory(User user, Pageable pageable) {
        Page<LoginHistory> history = loginHistoryRepository.findByUserOrderByLoginAtDesc(user, pageable);
        return history.map(loginHistoryMapper::toDTO);
    }

    @Override
    public Page<LoginHistoryDTO> getLoginHistoryByStatus(User user, LoginHistory.LoginStatus status, Pageable pageable) {
        Page<LoginHistory> history = loginHistoryRepository.findByUserAndLoginStatusOrderByLoginAtDesc(user, status, pageable);
        return history.map(loginHistoryMapper::toDTO);
    }

    @Override
    public List<LoginHistoryDTO> getRecentLoginHistory(User user, int limit) {
        List<LoginHistory> history = loginHistoryRepository.findTop10ByUserOrderByLoginAtDesc(user);
        return history.stream()
                .map(loginHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<LoginHistoryDTO> getLoginHistoryByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<LoginHistory> history = loginHistoryRepository.findByUserAndLoginAtBetween(user, startDate, endDate, pageable);
        return history.map(loginHistoryMapper::toDTO);
    }

    @Override
    public long getSuccessfulLoginCount(User user) {
        return loginHistoryRepository.countByUserAndLoginStatus(user, LoginHistory.LoginStatus.SUCCESS);
    }

    @Override
    public long getFailedLoginCount(User user) {
        return loginHistoryRepository.countByUserAndLoginStatus(user, LoginHistory.LoginStatus.FAILED);
    }

    @Override
    public LoginHistoryDTO getLastSuccessfulLogin(User user) {
        LoginHistory history = loginHistoryRepository.findFirstByUserAndLoginStatusOrderByLoginAtDesc(
                user,
                LoginHistory.LoginStatus.SUCCESS
        );
        return history != null ? loginHistoryMapper.toDTO(history) : null;
    }
}


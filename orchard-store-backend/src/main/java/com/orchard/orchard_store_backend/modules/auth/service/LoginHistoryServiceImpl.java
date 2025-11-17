package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.mapper.LoginHistoryMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.LoginHistoryRepository;
import com.orchard.orchard_store_backend.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoginHistoryServiceImpl implements LoginHistoryService {

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Autowired
    private UserAgentParser userAgentParser;

    @Autowired
    private LoginHistoryMapper loginHistoryMapper;

    @Override
    @Transactional
    public void saveLoginHistory(User user, HttpServletRequest request, LoginHistory.LoginStatus status, String failureReason) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = userAgentParser.getClientIP(request);
        String browser = userAgentParser.parseBrowser(userAgent);
        String os = userAgentParser.parseOS(userAgent);
        String deviceType = userAgentParser.parseDeviceType(userAgent);

        LoginHistory loginHistory = LoginHistory.builder()
                .user(user)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .browser(browser)
                .os(os)
                .location(null)
                .loginStatus(status)
                .failureReason(failureReason)
                .build();

        loginHistoryRepository.save(loginHistory);
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


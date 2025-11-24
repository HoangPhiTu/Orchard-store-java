package com.orchard.orchard_store_backend.modules.auth.mapper;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.util.UserAgentParser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserAdminMapper {

    UserAgentParser UA_PARSER = new UserAgentParser();

    @Mapping(target = "roles", expression = "java(mapRolesToRoleCodes(user))")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().name() : null)")
    UserResponseDTO toResponseDTO(User user);

    default LoginHistoryResponseDTO toLoginHistoryResponseDTO(LoginHistory loginHistory) {
        if (loginHistory == null) {
            return null;
        }

        String userAgent = loginHistory.getUserAgent();

        return LoginHistoryResponseDTO.builder()
                .id(loginHistory.getId())
                .loginTime(loginHistory.getLoginAt())
                .ipAddress(loginHistory.getIpAddress())
                .userAgent(userAgent)
                .status(loginHistory.getLoginStatus() != null
                        ? loginHistory.getLoginStatus().name()
                        : null)
                .browser(UA_PARSER.parseBrowser(userAgent))
                .os(UA_PARSER.parseOS(userAgent))
                .deviceType(UA_PARSER.parseDeviceType(userAgent))
                .failureReason(loginHistory.getFailureReason())
                .build();
    }

    default Set<String> mapRolesToRoleCodes(User user) {
        if (user.getUserRoles() == null || user.getUserRoles().isEmpty()) {
            return Set.of();
        }
        return user.getUserRoles().stream()
                .filter(ur -> ur.getIsActive() != null && ur.getIsActive())
                .map(ur -> ur.getRole().getRoleCode())
                .collect(Collectors.toSet());
    }
}


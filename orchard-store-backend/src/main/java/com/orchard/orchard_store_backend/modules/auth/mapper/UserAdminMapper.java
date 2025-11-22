package com.orchard.orchard_store_backend.modules.auth.mapper;

import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserAdminMapper {
    
    @Mapping(target = "roles", expression = "java(mapRolesToRoleCodes(user))")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().name() : null)")
    UserResponseDTO toResponseDTO(User user);

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


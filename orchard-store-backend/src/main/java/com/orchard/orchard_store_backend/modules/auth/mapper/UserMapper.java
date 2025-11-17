package com.orchard.orchard_store_backend.modules.auth.mapper;

import com.orchard.orchard_store_backend.modules.auth.dto.UserDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);
}


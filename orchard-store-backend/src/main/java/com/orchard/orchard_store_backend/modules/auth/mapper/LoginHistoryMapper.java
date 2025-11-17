package com.orchard.orchard_store_backend.modules.auth.mapper;

import com.orchard.orchard_store_backend.modules.auth.dto.LoginHistoryDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.LoginHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LoginHistoryMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "loginStatus", expression = "java(history.getLoginStatus().name())")
    LoginHistoryDTO toDTO(LoginHistory history);
}


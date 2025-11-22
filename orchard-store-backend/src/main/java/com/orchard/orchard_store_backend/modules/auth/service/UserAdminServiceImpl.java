package com.orchard.orchard_store_backend.modules.auth.service;

import com.orchard.orchard_store_backend.modules.auth.dto.UserCreateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserResponseDTO;
import com.orchard.orchard_store_backend.modules.auth.dto.UserUpdateRequestDTO;
import com.orchard.orchard_store_backend.modules.auth.entity.Role;
import com.orchard.orchard_store_backend.modules.auth.entity.User;
import com.orchard.orchard_store_backend.modules.auth.entity.UserRole;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.auth.mapper.UserAdminMapper;
import com.orchard.orchard_store_backend.modules.auth.repository.RoleRepository;
import com.orchard.orchard_store_backend.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAdminServiceImpl implements UserAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserAdminMapper userAdminMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsers(String keyword, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate fullNamePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern);
                Predicate phonePredicate = cb.like(cb.lower(root.get("phone")), searchPattern);
                predicates.add(cb.or(emailPredicate, fullNamePredicate, phonePredicate));
            }

            // Eagerly fetch userRoles and roles to avoid LazyInitializationException
            root.fetch("userRoles", jakarta.persistence.criteria.JoinType.LEFT)
                .fetch("role", jakarta.persistence.criteria.JoinType.LEFT);
            query.distinct(true); // Avoid duplicate results from joins

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(userAdminMapper::toResponseDTO);
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        // Check email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại: " + request.getEmail());
        }

        // Find roles
        Set<Long> roleIds = request.getRoleIds();
        List<Role> roles = roleRepository.findByIdIn(roleIds);
        if (roles.size() != roleIds.size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều quyền không tồn tại");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .status(request.getStatus() != null 
                    ? User.Status.valueOf(request.getStatus().toUpperCase()) 
                    : User.Status.ACTIVE)
                .build();

        // Assign roles
        List<UserRole> userRoles = roles.stream()
                .map(role -> UserRole.builder()
                        .user(user)
                        .role(role)
                        .isActive(true)
                        .build())
                .collect(Collectors.toList());
        user.setUserRoles(userRoles);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("Created user: {} with email: {}", savedUser.getId(), savedUser.getEmail());

        return userAdminMapper.toResponseDTO(savedUser);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        // Update basic info
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getStatus() != null) {
            try {
                user.setStatus(User.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
            }
        }

        // Update roles if provided
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<Role> roles = roleRepository.findByIdIn(request.getRoleIds());
            if (roles.size() != request.getRoleIds().size()) {
                throw new ResourceNotFoundException("Một hoặc nhiều quyền không tồn tại");
            }

            // Remove old roles
            user.getUserRoles().clear();

            // Add new roles
            List<UserRole> userRoles = roles.stream()
                    .map(role -> UserRole.builder()
                            .user(user)
                            .role(role)
                            .isActive(true)
                            .build())
                    .collect(Collectors.toList());
            user.setUserRoles(userRoles);
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user: {} with email: {}", updatedUser.getId(), updatedUser.getEmail());

        return userAdminMapper.toResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserResponseDTO toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        // Toggle status: ACTIVE -> INACTIVE, others -> ACTIVE
        if (user.getStatus() == User.Status.ACTIVE) {
            user.setStatus(User.Status.INACTIVE);
            log.info("Deactivated user: {} with email: {}", user.getId(), user.getEmail());
        } else {
            user.setStatus(User.Status.ACTIVE);
            log.info("Activated user: {} with email: {}", user.getId(), user.getEmail());
        }

        User updatedUser = userRepository.save(user);
        return userAdminMapper.toResponseDTO(updatedUser);
    }
}


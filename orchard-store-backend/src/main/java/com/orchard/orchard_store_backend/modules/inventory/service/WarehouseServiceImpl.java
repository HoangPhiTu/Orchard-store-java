package com.orchard.orchard_store_backend.modules.inventory.service;

import com.github.slugify.Slugify;
import com.orchard.orchard_store_backend.exception.OperationNotPermittedException;
import com.orchard.orchard_store_backend.exception.ResourceAlreadyExistsException;
import com.orchard.orchard_store_backend.exception.ResourceNotFoundException;
import com.orchard.orchard_store_backend.modules.inventory.dto.WarehouseDTO;
import com.orchard.orchard_store_backend.modules.inventory.entity.Warehouse;
import com.orchard.orchard_store_backend.modules.inventory.mapper.WarehouseMapper;
import com.orchard.orchard_store_backend.modules.inventory.repository.WarehouseRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    /**
     * Slugify instance để tạo code từ name
     */
    private static final Slugify slugify = Slugify.builder()
            .lowerCase(false)
            .underscoreSeparator(false)
            .build();

    @Override
    @Transactional(readOnly = true)
    public Page<WarehouseDTO> getWarehouses(String keyword, String status, Pageable pageable) {
        Specification<Warehouse> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by keyword (search in name or code)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("code")), searchPattern)
                ));
            }

            // Filter by status
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                try {
                    Warehouse.Status warehouseStatus = Warehouse.Status.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), warehouseStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status filter: {}", status);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return warehouseRepository.findAll(spec, pageable)
                .map(warehouseMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getActiveWarehouses() {
        return warehouseRepository.findAll().stream()
                .filter(w -> w.getStatus() == Warehouse.Status.ACTIVE)
                .map(warehouseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));
        return warehouseMapper.toDTO(warehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseByCode(String code) {
        Warehouse warehouse = warehouseRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", code));
        return warehouseMapper.toDTO(warehouse);
    }

    @Override
    public WarehouseDTO createWarehouse(WarehouseDTO warehouseDTO) {
        // Tạo code tự động từ name nếu không được cung cấp
        String code = warehouseDTO.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateUniqueCode(warehouseDTO.getName());
        } else {
            // Nếu có code từ request, kiểm tra trùng lặp
            if (warehouseRepository.existsByCode(code)) {
                throw new ResourceAlreadyExistsException("Warehouse", "code", code);
            }
        }

        // Kiểm tra trùng name
        // Note: Name không nhất thiết phải unique, nhưng có thể thêm validation nếu cần

        Warehouse warehouse = warehouseMapper.toEntity(warehouseDTO);
        warehouse.setCode(code);
        warehouse.setStatus(Warehouse.Status.ACTIVE); // Mặc định ACTIVE

        // Nếu đây là warehouse đầu tiên hoặc được đánh dấu là default, đặt làm mặc định
        if (warehouseDTO.getIsDefault() != null && warehouseDTO.getIsDefault()) {
            setAsDefaultWarehouse(warehouse);
        } else {
            // Nếu chưa có warehouse nào, tự động đặt làm mặc định
            if (warehouseRepository.findDefaultWarehouse().isEmpty()) {
                warehouse.setIsDefault(true);
            }
        }

        Warehouse saved = warehouseRepository.save(warehouse);
        log.info("Created warehouse: {} with code: {}", saved.getName(), saved.getCode());
        return warehouseMapper.toDTO(saved);
    }

    @Override
    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));

        // Cập nhật name
        if (warehouseDTO.getName() != null && !warehouseDTO.getName().trim().isEmpty()) {
            warehouse.setName(warehouseDTO.getName());
        }

        // Cập nhật code (nếu có thay đổi)
        if (warehouseDTO.getCode() != null && !warehouseDTO.getCode().trim().isEmpty()) {
            if (!warehouseDTO.getCode().equals(warehouse.getCode())) {
                if (warehouseRepository.existsByCodeAndIdNot(warehouseDTO.getCode(), id)) {
                    throw new ResourceAlreadyExistsException("Warehouse", "code", warehouseDTO.getCode());
                }
                warehouse.setCode(warehouseDTO.getCode());
            }
        }

        // Cập nhật các field khác
        if (warehouseDTO.getAddress() != null) {
            warehouse.setAddress(warehouseDTO.getAddress());
        }
        if (warehouseDTO.getContactPhone() != null) {
            warehouse.setContactPhone(warehouseDTO.getContactPhone());
        }
        if (warehouseDTO.getStatus() != null) {
            warehouse.setStatus(Warehouse.Status.valueOf(warehouseDTO.getStatus().toUpperCase()));
        }

        // Xử lý isDefault: nếu được set thành true, cần đặt các warehouse khác thành false
        if (warehouseDTO.getIsDefault() != null && warehouseDTO.getIsDefault() && !warehouse.getIsDefault()) {
            setAsDefaultWarehouse(warehouse);
        }

        Warehouse updated = warehouseRepository.save(warehouse);
        log.info("Updated warehouse: {} with code: {}", updated.getName(), updated.getCode());
        return warehouseMapper.toDTO(updated);
    }

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));

        // Kiểm tra ràng buộc: nếu đã được sử dụng thì không cho xóa cứng
        boolean isUsed = warehouseRepository.isUsedByInventoryTransactions(id) ||
                warehouseRepository.isUsedByWarehouseStock(id);

        if (isUsed) {
            // Chỉ cho phép soft delete (set status = INACTIVE)
            if (warehouse.getIsDefault()) {
                // Nếu là warehouse mặc định, cần chuyển quyền default sang warehouse khác trước
                Warehouse newDefault = warehouseRepository.findAll().stream()
                        .filter(w -> !w.getId().equals(id) && w.getStatus() == Warehouse.Status.ACTIVE)
                        .findFirst()
                        .orElseThrow(() -> new OperationNotPermittedException(
                                "Không thể vô hiệu hóa kho mặc định này vì không còn kho nào khác. Vui lòng tạo kho mới trước."
                        ));

                newDefault.setIsDefault(true);
                warehouseRepository.save(newDefault);
            }

            warehouse.setStatus(Warehouse.Status.INACTIVE);
            warehouse.setIsDefault(false);
            warehouseRepository.save(warehouse);
            log.info("Soft deleted warehouse: {} (id: {}) - set to INACTIVE", warehouse.getName(), id);
        } else {
            // Nếu không được sử dụng, có thể xóa cứng
            if (warehouse.getIsDefault()) {
                // Nếu là warehouse mặc định, cần chuyển quyền default sang warehouse khác trước
                Warehouse newDefault = warehouseRepository.findAll().stream()
                        .filter(w -> !w.getId().equals(id) && w.getStatus() == Warehouse.Status.ACTIVE)
                        .findFirst()
                        .orElseThrow(() -> new OperationNotPermittedException(
                                "Không thể xóa kho mặc định này vì không còn kho nào khác. Vui lòng tạo kho mới trước."
                        ));

                newDefault.setIsDefault(true);
                warehouseRepository.save(newDefault);
            }

            warehouseRepository.delete(warehouse);
            log.info("Hard deleted warehouse: {} (id: {})", warehouse.getName(), id);
        }
    }

    @Override
    public WarehouseDTO setDefaultWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", id));

        if (warehouse.getStatus() != Warehouse.Status.ACTIVE) {
            throw new OperationNotPermittedException("Chỉ có thể đặt kho đang hoạt động làm mặc định");
        }

        setAsDefaultWarehouse(warehouse);
        Warehouse updated = warehouseRepository.save(warehouse);
        log.info("Set default warehouse: {} (id: {})", updated.getName(), id);
        return warehouseMapper.toDTO(updated);
    }

    /**
     * Đặt warehouse làm mặc định và bỏ default của các warehouse khác
     */
    private void setAsDefaultWarehouse(Warehouse warehouse) {
        // Tìm và bỏ default của các warehouse khác
        List<Warehouse> otherDefaultWarehouses = warehouseRepository.findAll().stream()
                .filter(w -> !w.getId().equals(warehouse.getId()) && Boolean.TRUE.equals(w.getIsDefault()))
                .collect(Collectors.toList());

        for (Warehouse other : otherDefaultWarehouses) {
            other.setIsDefault(false);
            warehouseRepository.save(other);
        }

        warehouse.setIsDefault(true);
    }

    /**
     * Generate code tự động từ tên và đảm bảo unique
     */
    private String generateUniqueCode(String name) {
        String baseCode = slugify.slugify(name).toUpperCase().replace("-", "_");
        String code = baseCode;
        int counter = 1;

        // Kiểm tra và tạo code unique
        while (warehouseRepository.existsByCode(code)) {
            code = baseCode + "_" + counter;
            counter++;
        }

        log.debug("Generated unique code: {} from name: {}", code, name);
        return code;
    }
}


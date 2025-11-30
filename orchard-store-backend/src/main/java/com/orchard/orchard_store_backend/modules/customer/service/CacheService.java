package com.orchard.orchard_store_backend.modules.customer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service để quản lý cache với JSON serialization/deserialization
 * Hỗ trợ caching cho các DTO và Page objects
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedisService redisService;
    private final ObjectMapper objectMapper;

    /**
     * Cache một object với TTL
     *
     * @param key Cache key
     * @param value Object cần cache
     * @param ttlSeconds TTL (seconds)
     * @param <T> Type of object
     */
    public <T> void cache(String key, T value, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(value);
            redisService.setValue(key, json, ttlSeconds);
            log.debug("Cached value for key: {} (TTL: {}s)", key, ttlSeconds);
        } catch (Exception e) {
            log.warn("Failed to cache value for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * Lấy cached object
     *
     * @param key Cache key
     * @param type Class type
     * @return Optional của cached object
     * @param <T> Type of object
     */
    public <T> Optional<T> getCached(String key, Class<T> type) {
        try {
            String cached = redisService.getValue(key);
            if (cached != null && !cached.isEmpty()) {
                T value = objectMapper.readValue(cached, type);
                log.debug("Cache hit for key: {}", key);
                return Optional.of(value);
            }
        } catch (Exception e) {
            log.warn("Failed to get cached value for key {}: {}", key, e.getMessage());
        }
        log.debug("Cache miss for key: {}", key);
        return Optional.empty();
    }

    /**
     * Lấy cached object với TypeReference (cho generic types)
     *
     * @param key Cache key
     * @param typeReference TypeReference
     * @return Optional của cached object
     * @param <T> Type of object
     */
    public <T> Optional<T> getCached(String key, TypeReference<T> typeReference) {
        try {
            String cached = redisService.getValue(key);
            if (cached != null && !cached.isEmpty()) {
                T value = objectMapper.readValue(cached, typeReference);
                log.debug("Cache hit for key: {}", key);
                return Optional.of(value);
            }
        } catch (Exception e) {
            log.warn("Failed to get cached value for key {}: {}", key, e.getMessage());
        }
        log.debug("Cache miss for key: {}", key);
        return Optional.empty();
    }

    /**
     * Cache một Page object
     *
     * @param key Cache key
     * @param page Page object
     * @param ttlSeconds TTL (seconds)
     * @param <T> Type of content
     */
    public <T> void cachePage(String key, Page<T> page, long ttlSeconds) {
        try {
            // Create a serializable wrapper for Page with metadata
            PageWrapper<T> wrapper = new PageWrapper<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
            );
            String json = objectMapper.writeValueAsString(wrapper);
            redisService.setValue(key, json, ttlSeconds);
            log.debug("Cached page for key: {} (TTL: {}s)", key, ttlSeconds);
        } catch (Exception e) {
            log.warn("Failed to cache page for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * Lấy cached Page object
     *
     * @param key Cache key
     * @param pageable Pageable để reconstruct Page
     * @param contentType Class type của content
     * @return Optional của cached Page
     * @param <T> Type of content
     */
    public <T> Optional<Page<T>> getCachedPage(String key, Pageable pageable, Class<T> contentType) {
        try {
            String cached = redisService.getValue(key);
            if (cached != null && !cached.isEmpty()) {
                // Parse JSON to get wrapper with content and metadata
                com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(cached);
                
                // Get content list
                com.fasterxml.jackson.databind.JsonNode contentNode = jsonNode.get("content");
                List<T> content = objectMapper.convertValue(
                    contentNode,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, contentType)
                );
                
                // Get metadata
                long totalElements = jsonNode.has("totalElements") ? jsonNode.get("totalElements").asLong() : content.size();
                
                // Reconstruct Page from content and metadata
                Page<T> page = new PageImpl<>(
                    content,
                    pageable,
                    totalElements
                );
                log.debug("Cache hit for page key: {}", key);
                return Optional.of(page);
            }
        } catch (Exception e) {
            log.warn("Failed to get cached page for key {}: {}", key, e.getMessage());
        }
        log.debug("Cache miss for page key: {}", key);
        return Optional.empty();
    }

    /**
     * Xóa cache theo key
     *
     * @param key Cache key
     */
    public void evict(String key) {
        try {
            redisService.deleteKey(key);
            log.debug("Evicted cache for key: {}", key);
        } catch (Exception e) {
            log.warn("Failed to evict cache for key {}: {}", key, e.getMessage());
        }
    }

    /**
     * Xóa tất cả cache matching pattern (sử dụng wildcard)
     * Note: Redis không hỗ trợ wildcard delete trực tiếp, cần scan keys
     *
     * @param pattern Pattern (ví dụ: "category:list:*")
     */
    public void evictPattern(String pattern) {
        try {
            // Note: This is a simplified implementation
            // For production, consider using Redis SCAN command for better performance
            log.debug("Evicting cache pattern: {}", pattern);
            // Implementation would require RedisTemplate with keys() method
            // For now, we'll log and let individual services handle pattern eviction
        } catch (Exception e) {
            log.warn("Failed to evict cache pattern {}: {}", pattern, e.getMessage());
        }
    }

    /**
     * Wrapper class để serialize/deserialize Page objects
     */
    private static class PageWrapper<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int number;
        private int size;

        public PageWrapper() {
        }

        public PageWrapper(List<T> content, long totalElements, int totalPages, int number, int size) {
            this.content = content;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.number = number;
            this.size = size;
        }

        public List<T> getContent() {
            return content;
        }

        public void setContent(List<T> content) {
            this.content = content;
        }

        public long getTotalElements() {
            return totalElements;
        }

        public void setTotalElements(long totalElements) {
            this.totalElements = totalElements;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }

        public int getNumber() {
            return number;
        }

        public void setNumber(int number) {
            this.number = number;
        }

        public int getSize() {
            return size;
        }

        public void setSize(int size) {
            this.size = size;
        }
    }
}


package com.orchard.orchard_store_backend.modules.customer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Wrapper service để thao tác với Redis (String key/value).
 */
@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * Set key-value với TTL (seconds).
     */
    public void setValue(String key, String value, long ttlSeconds) {
        if (ttlSeconds > 0) {
            stringRedisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
        } else {
            stringRedisTemplate.opsForValue().set(key, value);
        }
    }

    /**
     * Get value theo key.
     */
    public String getValue(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    /**
     * Delete key.
     */
    public void deleteKey(String key) {
        stringRedisTemplate.delete(key);
    }

    /**
     * Increment counter cho key. Nếu key mới -> set TTL.
     *
     * @param key Key cần increment
     * @param ttlSeconds TTL cần set nếu key mới
     * @return Giá trị sau khi increment
     */
    public Long increment(String key, long ttlSeconds) {
        Long value = stringRedisTemplate.opsForValue().increment(key);
        if (value != null && value == 1L && ttlSeconds > 0) {
            stringRedisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);
        }
        return value;
    }

    /**
     * Ping Redis server.
     *
     * @return "PONG" nếu thành công
     */
    public String ping() {
        return stringRedisTemplate.getConnectionFactory() != null
                ? stringRedisTemplate.getConnectionFactory().getConnection().ping()
                : "DOWN";
    }
}


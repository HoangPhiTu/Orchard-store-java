package com.orchard.orchard_store_backend.modules.shopping.aspect;

import com.orchard.orchard_store_backend.modules.customer.service.RedisService;
import com.orchard.orchard_store_backend.modules.shopping.exception.CartRateLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class CartRateLimitAspect {

    private final RedisService redisService;

    private static final String CART_RATE_KEY_PREFIX = "rate:cart:";
    private static final long RATE_LIMIT_TTL_SECONDS = 60;
    private static final long MAX_REQUESTS_PER_WINDOW = 10;

    @Before("execution(* com.orchard.orchard_store_backend.modules.shopping.service.CartService.addToCart(..))")
    public void checkRateLimit(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length < 3) {
            return;
        }

        String sessionId = args[0] != null ? args[0].toString() : null;
        Long customerId = args[1] instanceof Long ? (Long) args[1] : null;

        String rateKey = buildRateKey(sessionId, customerId);
        Long requestCount = redisService.increment(rateKey, RATE_LIMIT_TTL_SECONDS);

        if (requestCount != null && requestCount > MAX_REQUESTS_PER_WINDOW) {
            log.warn("Cart rate limit exceeded for key {}", rateKey);
            throw new CartRateLimitException("Thao tác quá nhanh. Vui lòng thử lại sau ít phút.");
        }
    }

    private String buildRateKey(String sessionId, Long customerId) {
        if (customerId != null) {
            return CART_RATE_KEY_PREFIX + "customer:" + customerId;
        }
        if (StringUtils.hasText(sessionId)) {
            return CART_RATE_KEY_PREFIX + "session:" + sessionId;
        }
        return CART_RATE_KEY_PREFIX + "anonymous";
    }
}


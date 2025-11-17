package com.orchard.orchard_store_backend.util;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class UserAgentParser {
    
    private static final Pattern BROWSER_PATTERN = Pattern.compile(
            "(Chrome|Firefox|Safari|Edge|Opera|IE|MSIE|Trident|OPR)/([\\d.]+)"
    );
    
    private static final Pattern OS_PATTERN = Pattern.compile(
            "(Windows|Mac OS X|Linux|Android|iOS|iPad|iPhone|Windows Phone)"
    );
    
    public String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown";
        }
        
        Matcher matcher = BROWSER_PATTERN.matcher(userAgent);
        if (matcher.find()) {
            String browser = matcher.group(1);
            // Normalize browser names
            if (browser.contains("Chrome") && !userAgent.contains("Edg")) {
                return "Chrome";
            } else if (browser.contains("Edg") || browser.contains("Edge")) {
                return "Edge";
            } else if (browser.contains("Firefox")) {
                return "Firefox";
            } else if (browser.contains("Safari") && !userAgent.contains("Chrome")) {
                return "Safari";
            } else if (browser.contains("Opera") || browser.contains("OPR")) {
                return "Opera";
            } else if (browser.contains("IE") || browser.contains("Trident")) {
                return "Internet Explorer";
            }
        }
        
        return "Unknown";
    }
    
    public String parseOS(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown";
        }
        
        Matcher matcher = OS_PATTERN.matcher(userAgent);
        if (matcher.find()) {
            String os = matcher.group(1);
            // Normalize OS names
            if (os.contains("Windows")) {
                return "Windows";
            } else if (os.contains("Mac OS X")) {
                return "macOS";
            } else if (os.contains("Linux")) {
                return "Linux";
            } else if (os.contains("Android")) {
                return "Android";
            } else if (os.contains("iOS") || os.contains("iPhone") || os.contains("iPad")) {
                return "iOS";
            } else if (os.contains("Windows Phone")) {
                return "Windows Phone";
            }
        }
        
        return "Unknown";
    }
    
    public String parseDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "UNKNOWN";
        }
        
        String ua = userAgent.toLowerCase();
        
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return "MOBILE";
        } else if (ua.contains("tablet") || ua.contains("ipad")) {
            return "TABLET";
        } else {
            return "DESKTOP";
        }
    }
    
    public String getClientIP(jakarta.servlet.http.HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("X-Real-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Handle multiple IPs (X-Forwarded-For can contain multiple IPs)
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }
}


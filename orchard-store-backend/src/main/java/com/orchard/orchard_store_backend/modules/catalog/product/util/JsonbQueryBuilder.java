package com.orchard.orchard_store_backend.modules.catalog.product.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Utility class to build JSONB query strings for PostgreSQL JSONB queries
 */
@Slf4j
public class JsonbQueryBuilder {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Build JSON string for single attribute value query
     * Example: {"gender": {"value": "MALE"}}
     */
    public static String buildAttributeQuery(String attributeKey, String attributeValue) {
        Map<String, Object> query = new HashMap<>();
        Map<String, Object> attrData = new HashMap<>();
        attrData.put("value", attributeValue);
        query.put(attributeKey, attrData);
        return toJsonString(query);
    }

    /**
     * Build JSON string for multiple attributes query (AND condition)
     * Example: {"gender": {"value": "MALE"}, "fragrance_group": {"value": "woody"}}
     */
    public static String buildMultipleAttributesQuery(Map<String, String> attributes) {
        Map<String, Object> query = new HashMap<>();
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            Map<String, Object> attrData = new HashMap<>();
            attrData.put("value", entry.getValue());
            query.put(entry.getKey(), attrData);
        }
        return toJsonString(query);
    }

    /**
     * Build JSON string for attribute with display value
     */
    public static String buildAttributeWithDisplayQuery(String attributeKey, String value, String display) {
        Map<String, Object> query = new HashMap<>();
        Map<String, Object> attrData = new HashMap<>();
        attrData.put("value", value);
        attrData.put("display", display);
        query.put(attributeKey, attrData);
        return toJsonString(query);
    }

    /**
     * Build JSON string for numeric attribute query
     */
    public static String buildNumericAttributeQuery(String attributeKey, Number numericValue) {
        Map<String, Object> query = new HashMap<>();
        Map<String, Object> attrData = new HashMap<>();
        attrData.put("numericValue", numericValue);
        query.put(attributeKey, attrData);
        return toJsonString(query);
    }

    /**
     * Convert Map to JSON string
     */
    private static String toJsonString(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            log.error("Error converting map to JSON string", e);
            throw new RuntimeException("Failed to build JSON query", e);
        }
    }

    /**
     * Build comma-separated string for IN clause
     */
    public static String buildInClauseString(List<String> values) {
        return String.join(",", values);
    }
}


# 📊 JSONB Best Practices - PostgreSQL + Hibernate

> **How to use JSONB effectively in Orchard Store**

---

## 🎯 What is JSONB?

**JSONB** = Binary JSON format trong PostgreSQL

**Benefits:**

- ✅ Store flexible/dynamic data
- ✅ Fast queries với GIN indexes
- ✅ No ALTER TABLE needed for new fields
- ✅ Native PostgreSQL operators (@>, ?, #>, etc.)
- ✅ Can be indexed and queried like regular columns

**When to use:**

- ✅ Permissions (varies by role)
- ✅ Dynamic attributes (color, size, origin...)
- ✅ Settings/configurations
- ✅ Metadata
- ✅ Flexible data that changes often

**When NOT to use:**

- ❌ Fixed schema data (use regular columns)
- ❌ Data that needs frequent updates (write-heavy)
- ❌ Data that needs complex JOINs
- ❌ Financial data (use DECIMAL columns)

---

## 🛠️ Setup in Hibernate 6

### 1. Add Dependency (pom.xml)

```xml
<dependency>
    <groupId>io.hypersistence</groupId>
    <artifactId>hypersistence-utils-hibernate-63</artifactId>
    <version>3.7.2</version>
</dependency>
```

### 2. Entity Mapping

```java
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ JSONB Column
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions", columnDefinition = "jsonb")
    private Map<String, Object> permissions;

    // Getters/Setters
}
```

### 3. Database Migration (Flyway)

```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,       -- Default: empty object
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ⭐ GIN Index for fast queries
CREATE INDEX idx_roles_permissions ON roles USING GIN (permissions);
```

---

## 📝 JSONB Data Structure Examples

### 1. Permissions (roles table)

```json
{
  "products": ["create", "read", "update", "delete"],
  "orders": ["read", "update"],
  "customers": ["read"],
  "analytics": ["read"],
  "settings": ["read"]
}
```

**Java Code:**

```java
role.setPermissions(Map.of(
    "products", List.of("create", "read", "update", "delete"),
    "orders", List.of("read", "update"),
    "customers", List.of("read")
));
```

### 2. Cached Attributes (product_variants table)

```json
{
  "color": "red",
  "origin": "USA",
  "organic": true,
  "sweetness": 8,
  "harvest_year": 2024,
  "certifications": ["USDA", "EU Organic"]
}
```

**Java Code:**

```java
variant.setCachedAttributes(Map.of(
    "color", "red",
    "origin", "USA",
    "organic", true,
    "sweetness", 8,
    "harvest_year", 2024,
    "certifications", List.of("USDA", "EU Organic")
));
```

### 3. Additional Permissions (users table)

```json
{
  "special_feature_access": true,
  "override_price": ["read", "update"],
  "export_data": ["execute"]
}
```

---

## 🔍 JSONB Query Operators

### PostgreSQL Operators

| Operator | Description                    | Example                                        |
| -------- | ------------------------------ | ---------------------------------------------- | -------------- | ---------------------------- |
| `@>`     | Contains (left contains right) | `permissions @> '{"products": ["read"]}'`      |
| `<@`     | Contained by (left in right)   | `'{"read"}'::jsonb <@ permissions->'products'` |
| `?`      | Has key                        | `permissions ? 'products'`                     |
| `?       | `                              | Has any key                                    | `permissions ? | array['products', 'orders']` |
| `?&`     | Has all keys                   | `permissions ?& array['products', 'orders']`   |
| `->`     | Get JSON value (as JSON)       | `permissions -> 'products'`                    |
| `->>`    | Get JSON value (as text)       | `permissions ->> 'products'`                   |
| `#>`     | Get JSON at path (as JSON)     | `permissions #> '{products,0}'`                |
| `#>>`    | Get JSON at path (as text)     | `permissions #>> '{products,0}'`               |

### Query Examples

#### 1. Containment (@>)

```sql
-- Find roles that have "create" permission on "products"
SELECT * FROM roles
WHERE permissions @> '{"products": ["create"]}'::jsonb;

-- Find variants with specific attributes
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red", "organic": true}'::jsonb;

-- Complex containment
SELECT * FROM product_variants
WHERE cached_attributes @> '{"certifications": ["USDA"]}'::jsonb;
```

#### 2. Key Existence (?)

```sql
-- Find products that have "color" attribute
SELECT * FROM product_variants
WHERE cached_attributes ? 'color';

-- Find roles that define "products" permissions
SELECT * FROM roles
WHERE permissions ? 'products';
```

#### 3. Extract Value (-> and ->>)

```sql
-- Get color as JSON
SELECT sku, cached_attributes -> 'color' as color
FROM product_variants;

-- Get color as TEXT
SELECT sku, cached_attributes ->> 'color' as color
FROM product_variants;

-- Use in WHERE
SELECT * FROM product_variants
WHERE cached_attributes ->> 'color' = 'red';
```

#### 4. Path Queries (#> and #>>)

```sql
-- Get nested value
SELECT permissions #> '{products,0}' as first_permission
FROM roles;

-- Get array element as text
SELECT permissions #>> '{products,0}' as first_permission_text
FROM roles;
```

#### 5. Combine with Regular Columns

```sql
-- JSONB + regular WHERE
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red"}'::jsonb
AND status = 'ACTIVE'
AND price BETWEEN 10000 AND 50000;

-- JSONB + JOIN
SELECT pv.*, c.name as category_name
FROM product_variants pv
INNER JOIN categories c ON c.id = pv.category_id
WHERE pv.cached_attributes @> '{"organic": true}'::jsonb
AND c.slug = 'fruits';
```

---

## 🚀 Performance Optimization

### 1. Always Create GIN Index

```sql
-- ⭐ MUST HAVE for JSONB columns you query often
CREATE INDEX idx_variants_cached_attributes_gin
    ON product_variants USING GIN (cached_attributes);

CREATE INDEX idx_roles_permissions_gin
    ON roles USING GIN (permissions);
```

**Without index:** Full table scan (slow)  
**With GIN index:** Index scan (fast)

### 2. Use @> for Containment Queries

```sql
-- ✅ GOOD - Uses GIN index
WHERE cached_attributes @> '{"color": "red"}'::jsonb

-- ❌ BAD - Cannot use index efficiently
WHERE cached_attributes ->> 'color' = 'red'
```

**Performance difference:**

- @> with GIN index: **~5ms** for 1M rows
- ->> without index: **~500ms** for 1M rows

### 3. Limit JSONB Size

**Recommended:** < 100KB per JSONB value

```json
// ✅ GOOD - Small, focused data
{
  "color": "red",
  "origin": "USA",
  "organic": true
}

// ❌ BAD - Too large, should use separate table
{
  "reviews": [...1000 reviews...],
  "orders": [...500 orders...],
  "huge_data": "..."
}
```

### 4. Denormalize Strategically

**Only denormalize read-heavy data:**

```java
// ✅ GOOD - Read often, write rarely
private Map<String, Object> cachedAttributes; // From EAV tables

// ❌ BAD - Changes frequently
private Map<String, Object> cachedOrders; // Should be separate table
```

---

## 🎨 Java Code Patterns

### 1. Define JSONB Field

```java
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ JSONB field
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cached_attributes", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> cachedAttributes = new HashMap<>();

    // Regular fields...
}
```

### 2. Set JSONB Value

```java
// Create new map
Map<String, Object> attributes = new HashMap<>();
attributes.put("color", "red");
attributes.put("origin", "USA");
attributes.put("organic", true);
attributes.put("sweetness", 8);

variant.setCachedAttributes(attributes);

// Or use builder
ProductVariant variant = ProductVariant.builder()
    .name("Táo đỏ hữu cơ")
    .cachedAttributes(Map.of(
        "color", "red",
        "organic", true
    ))
    .build();
```

### 3. Query with JSONB

```java
// Using native query
@Query(value = """
    SELECT * FROM product_variants
    WHERE cached_attributes @> CAST(:attrs AS jsonb)
    AND status = :status
    """, nativeQuery = true)
List<ProductVariant> findByAttributes(
    @Param("attrs") String attrs,  // Pass as JSON string: '{"color": "red"}'
    @Param("status") String status
);

// Usage:
String attrs = "{\"color\": \"red\", \"organic\": true}";
List<ProductVariant> variants = repo.findByAttributes(attrs, "ACTIVE");
```

### 4. Update JSONB Field

```java
// Update entire map
variant.setCachedAttributes(Map.of("color", "blue"));

// Or using PostgreSQL function (native query)
@Modifying
@Query(value = """
    UPDATE product_variants
    SET cached_attributes = jsonb_set(
        cached_attributes,
        '{color}',
        to_jsonb(:color::text)
    )
    WHERE id = :variantId
    """, nativeQuery = true)
void updateColor(@Param("variantId") Long variantId, @Param("color") String color);
```

---

## ⚠️ Common Pitfalls

### ❌ Mistake 1: Querying without GIN Index

```sql
-- ❌ BAD - Full table scan
SELECT * FROM product_variants
WHERE cached_attributes ->> 'color' = 'red';

-- ✅ GOOD - Uses GIN index
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red"}'::jsonb;
```

### ❌ Mistake 2: Storing Too Much Data

```json
// ❌ BAD - 10MB JSONB value
{
  "all_orders": [...10000 orders...],
  "full_inventory_history": [...],
  "huge_nested_data": {...}
}
```

**Solution:** Use separate tables for large datasets

### ❌ Mistake 3: Not Validating JSONB Structure

```java
// ❌ BAD - No validation
variant.setCachedAttributes(anyMap);

// ✅ GOOD - Validate structure
public void setCachedAttributes(Map<String, Object> attrs) {
    // Validate required keys
    if (!attrs.containsKey("color")) {
        throw new IllegalArgumentException("Color is required");
    }
    this.cachedAttributes = attrs;
}
```

### ❌ Mistake 4: Using JSONB for Everything

```sql
-- ❌ BAD - Should use regular columns
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    data JSONB  -- Everything in JSONB { "email": "", "name": "", ... }
);

-- ✅ GOOD - Regular columns + JSONB for flexible data
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,         -- Fixed schema
    full_name VARCHAR(255),                      -- Fixed schema
    additional_permissions JSONB DEFAULT '{}'::jsonb  -- Flexible data only
);
```

---

## 🎓 Best Practices Summary

### ✅ DO

1. **Use GIN indexes** for JSONB columns you query
2. **Use @> operator** for containment queries (fast)
3. **Keep JSONB size small** (< 100KB)
4. **Validate JSONB structure** in application code
5. **Denormalize strategically** (read-heavy data only)
6. **Document JSONB schema** (what keys are expected)
7. **Use regular columns** for fixed schema data

### ❌ DON'T

1. **Don't query without GIN index** (slow)
2. **Don't use ->> in WHERE** if you can use @> (slower)
3. **Don't store huge data** in JSONB (>1MB)
4. **Don't use JSONB** for write-heavy data
5. **Don't use JSONB** for relational data (use FK)
6. **Don't forget to validate** JSONB structure
7. **Don't over-denormalize** (data consistency issues)

---

## 📊 Use Cases in Orchard Store

### Use Case 1: Role Permissions

**Table:** `roles`  
**Column:** `permissions` JSONB

**Structure:**

```json
{
  "products": ["create", "read", "update", "delete"],
  "orders": ["read", "update"],
  "customers": ["read"],
  "analytics": ["read"]
}
```

**Query:**

```sql
-- Find roles that can create products
SELECT * FROM roles
WHERE permissions @> '{"products": ["create"]}'::jsonb;

-- Check if role has permission
SELECT EXISTS (
    SELECT 1 FROM roles
    WHERE id = 2
    AND permissions @> '{"products": ["delete"]}'::jsonb
);
```

**Java Code:**

```java
@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "permissions", columnDefinition = "jsonb")
private Map<String, Object> permissions;

// Set permissions
role.setPermissions(Map.of(
    "products", List.of("create", "read", "update"),
    "orders", List.of("read")
));
```

---

### Use Case 2: Product Cached Attributes

**Table:** `product_variants`  
**Column:** `cached_attributes` JSONB

**Structure:**

```json
{
  "color": "red",
  "origin": "USA",
  "organic": true,
  "sweetness": 8,
  "harvest_year": 2024,
  "certifications": ["USDA", "EU Organic"]
}
```

**Query:**

```sql
-- Find red organic products
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red", "organic": true}'::jsonb
AND status = 'ACTIVE';

-- Find products from USA
SELECT * FROM product_variants
WHERE cached_attributes @> '{"origin": "USA"}'::jsonb;

-- Find products with USDA certification
SELECT * FROM product_variants
WHERE cached_attributes @> '{"certifications": ["USDA"]}'::jsonb;

-- Complex filter
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red"}'::jsonb
AND (cached_attributes -> 'sweetness')::int >= 7
AND price BETWEEN 10000 AND 50000;
```

**Why cache?**

- ✅ Fast queries (no JOINs)
- ✅ GIN index support
- ✅ Simple code

**How to update cache:**

```java
// When attributes change:
public void updateCachedAttributes(ProductVariant variant) {
    // 1. Load all attributes from EAV tables
    Map<String, Object> attrs = loadAttributesFromEAV(variant.getId());

    // 2. Update cached_attributes
    variant.setCachedAttributes(attrs);

    // 3. Save
    variantRepository.save(variant);
}
```

---

### Use Case 3: User Additional Permissions

**Table:** `users`  
**Column:** `additional_permissions` JSONB

**Structure:**

```json
{
  "override_price": true,
  "access_beta_features": true,
  "special_discount": 10
}
```

**Query:**

```sql
-- Find users with override_price permission
SELECT * FROM users
WHERE additional_permissions @> '{"override_price": true}'::jsonb;
```

**Java Code:**

```java
// Check permission
public boolean hasPermission(User user, String permission) {
    // Check in additional_permissions first
    if (user.getAdditionalPermissions().containsKey(permission)) {
        return (Boolean) user.getAdditionalPermissions().get(permission);
    }

    // Check in role permissions
    // ...
}
```

---

## 🎯 Migration Patterns

### Pattern 1: Add JSONB Column to Existing Table

```sql
-- Add column
ALTER TABLE products
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Add GIN index
CREATE INDEX idx_products_metadata
    ON products USING GIN (metadata);

-- Populate with default data
UPDATE products
SET metadata = '{
  "featured": false,
  "trending": false
}'::jsonb;
```

### Pattern 2: Migrate from Regular Columns to JSONB

```sql
-- Before: Multiple columns
ALTER TABLE products
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN is_trending BOOLEAN DEFAULT FALSE,
ADD COLUMN is_new_arrival BOOLEAN DEFAULT FALSE;

-- After: Single JSONB column
ALTER TABLE products
ADD COLUMN flags JSONB DEFAULT '{}'::jsonb;

-- Migrate data
UPDATE products
SET flags = jsonb_build_object(
    'featured', is_featured,
    'trending', is_trending,
    'new_arrival', is_new_arrival
);

-- Drop old columns
ALTER TABLE products
DROP COLUMN is_featured,
DROP COLUMN is_trending,
DROP COLUMN is_new_arrival;
```

### Pattern 3: Add New Key to Existing JSONB

```sql
-- Update all rows - add new key
UPDATE product_variants
SET cached_attributes = jsonb_set(
    COALESCE(cached_attributes, '{}'::jsonb),
    '{premium}',
    'false'::jsonb,
    true  -- create if not exists
)
WHERE cached_attributes IS NULL
   OR NOT cached_attributes ? 'premium';
```

---

## 📚 Advanced Techniques

### 1. JSONB Functions

```sql
-- Build JSONB from columns
SELECT jsonb_build_object(
    'color', 'red',
    'origin', 'USA',
    'organic', true
) as attributes;

-- Merge JSONB objects
SELECT permissions || '{"new_key": "new_value"}'::jsonb
FROM roles;

-- Remove key
SELECT permissions - 'old_key'
FROM roles;

-- Set nested value
UPDATE product_variants
SET cached_attributes = jsonb_set(
    cached_attributes,
    '{certifications}',
    '["USDA", "EU Organic"]'::jsonb
)
WHERE id = 123;
```

### 2. Aggregate JSONB

```sql
-- Collect all colors
SELECT jsonb_agg(DISTINCT cached_attributes ->> 'color') as colors
FROM product_variants
WHERE cached_attributes ? 'color';

-- Build object from rows
SELECT jsonb_object_agg(role_code, permissions) as all_permissions
FROM roles;
```

### 3. Validate JSONB Structure

```sql
-- Check if valid JSON
SELECT jsonb_typeof(permissions) as type
FROM roles;

-- Ensure required keys exist
ALTER TABLE product_variants
ADD CONSTRAINT check_cached_attrs_color
CHECK (cached_attributes ? 'color');
```

---

## 🔬 Monitoring & Debugging

### 1. Check Index Usage

```sql
EXPLAIN ANALYZE
SELECT * FROM product_variants
WHERE cached_attributes @> '{"color": "red"}'::jsonb;

-- Should see:
-- Index Scan using idx_variants_cached_attributes_gin
```

### 2. JSONB Statistics

```sql
-- Count keys in JSONB
SELECT jsonb_object_keys(cached_attributes) as key, COUNT(*)
FROM product_variants
GROUP BY key;

-- Average JSONB size
SELECT AVG(octet_length(cached_attributes::text)) as avg_size_bytes
FROM product_variants;

-- Find large JSONB values
SELECT id, sku, octet_length(cached_attributes::text) as size_bytes
FROM product_variants
WHERE octet_length(cached_attributes::text) > 10000
ORDER BY size_bytes DESC;
```

### 3. Validate JSONB Data

```sql
-- Find variants with invalid cached_attributes
SELECT id, sku, cached_attributes
FROM product_variants
WHERE cached_attributes IS NULL
   OR jsonb_typeof(cached_attributes) != 'object';
```

---

## 📖 Resources

### Official Documentation

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/16/datatype-json.html)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/16/functions-json.html)
- [Hypersistence Utils](https://github.com/vladmihalcea/hypersistence-utils)

### Tutorials

- [JSONB Indexing Best Practices](https://www.postgresql.org/docs/16/indexes-types.html#INDEXES-TYPES-GIN)
- [JSONB Performance Tips](https://www.postgresql.org/docs/16/datatype-json.html#JSON-INDEXING)

---

## ✨ Summary

**JSONB is powerful when used correctly:**

✅ **Do use for:**

- Dynamic/flexible data (permissions, attributes)
- Metadata
- Configurations
- Fast queries with GIN indexes

❌ **Don't use for:**

- Fixed schema data
- Relational data (use FK)
- Large datasets (>100KB)
- Write-heavy data

**Golden Rule:**

> "Use JSONB for read-heavy, flexible data. Use regular columns for fixed schema."

---

**Last Updated:** December 2024  
**Version:** 0.2.0  
**Related:** [BE_DATABASE_SCHEMA.md](./BE_DATABASE_SCHEMA.md), [BE_ARCHITECTURE.md](./BE_ARCHITECTURE.md)

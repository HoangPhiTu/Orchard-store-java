# 🔄 Database Migration Guide - Flyway

> **How to manage database schema changes with Flyway**

---

## 🎯 Overview

**Migration Tool:** Flyway (via Spring Boot)

**Location:** `src/main/resources/db/migration/`

**Naming Convention:** `V{version}__{description}.sql`

**Examples:**

- `V1__init_schema.sql` - Initial schema
- `V2__add_user_avatar.sql` - Add avatar column
- `V3__update_role_hierarchy.sql` - Update hierarchy levels

---

## 📝 Naming Rules

### Version Format

```
V{MAJOR}_{MINOR}_{PATCH}__{description}.sql

Examples:
✅ V1__init_schema.sql
✅ V2__add_user_avatar.sql
✅ V2_1__add_user_phone_index.sql
✅ V3__create_products_table.sql

❌ v1__init.sql                    (lowercase v)
❌ V1_init_schema.sql              (single underscore)
❌ V1__Init Schema.sql             (space in description)
❌ V1__init-schema.sql             (hyphen instead of underscore)
```

### Description Guidelines

**✅ Good Descriptions:**

- `add_user_avatar` - Clear action + target
- `create_products_table` - What you're creating
- `update_role_hierarchy_levels` - What you're updating
- `remove_legacy_role_column` - What you're removing

**❌ Bad Descriptions:**

- `update` - Too vague
- `fix` - Not descriptive
- `changes` - What changes?
- `new_stuff` - Not professional

---

## 🛠️ Migration Types

### 1. Schema Creation

**File:** `V1__init_schema.sql`

```sql
-- Create table
CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);

-- Insert default data
INSERT INTO brands (name, slug) VALUES
('Apple Inc', 'apple-inc'),
('Samsung', 'samsung');
```

### 2. Add Column

**File:** `V2__add_user_avatar.sql`

```sql
-- Add column
ALTER TABLE users
ADD COLUMN avatar_url VARCHAR(500);

-- Add index (if needed)
CREATE INDEX idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;

-- Set default values (optional)
UPDATE users
SET avatar_url = 'https://default-avatar.com/user.png'
WHERE avatar_url IS NULL;
```

### 3. Modify Column

**File:** `V3__increase_user_phone_length.sql`

```sql
-- Modify column type
ALTER TABLE users
ALTER COLUMN phone TYPE VARCHAR(30);

-- Add constraint
ALTER TABLE users
ADD CONSTRAINT check_phone_format
CHECK (phone ~ '^[0-9]{10,15}$');
```

### 4. Add JSONB Column

**File:** `V4__add_product_metadata.sql`

```sql
-- Add JSONB column
ALTER TABLE products
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- ⭐ Add GIN index (important!)
CREATE INDEX idx_products_metadata_gin
    ON products USING GIN (metadata);

-- Populate with default data
UPDATE products
SET metadata = jsonb_build_object(
    'featured', false,
    'trending', false,
    'new_arrival', false
);
```

### 5. Create Index

**File:** `V5__add_composite_index.sql`

```sql
-- Composite index
CREATE INDEX idx_variants_category_status_price
    ON product_variants(category_id, status, price)
    WHERE status = 'ACTIVE';

-- Partial index
CREATE INDEX idx_users_locked
    ON users(locked_until)
    WHERE locked_until IS NOT NULL;

-- GIN index for JSONB
CREATE INDEX idx_variants_attrs_gin
    ON product_variants USING GIN (cached_attributes);
```

### 6. Add Foreign Key

**File:** `V6__add_product_brand_fk.sql`

```sql
-- Add FK constraint
ALTER TABLE products
ADD CONSTRAINT fk_products_brand
FOREIGN KEY (brand_id) REFERENCES brands(id)
ON DELETE RESTRICT;

-- Add index for FK (performance)
CREATE INDEX idx_products_brand ON products(brand_id);
```

### 7. Data Migration

**File:** `V7__migrate_legacy_roles.sql`

```sql
-- Migrate from old structure to new
INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
SELECT
    u.id,
    r.id,
    NULL,  -- No assigned_by for legacy data
    true
FROM users u
INNER JOIN roles r ON r.role_code = u.role  -- Old column: u.role
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Update statistics
ANALYZE user_roles;
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not Adding Indexes

```sql
-- ❌ BAD - Add column without index
ALTER TABLE products
ADD COLUMN brand_id BIGINT;

-- ✅ GOOD - Add index for FK
ALTER TABLE products
ADD COLUMN brand_id BIGINT;

CREATE INDEX idx_products_brand ON products(brand_id);
```

### ❌ Mistake 2: Forgetting GIN Index for JSONB

```sql
-- ❌ BAD - JSONB without index (slow queries)
ALTER TABLE products
ADD COLUMN metadata JSONB;

-- ✅ GOOD - Always add GIN index for JSONB you query
ALTER TABLE products
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_products_metadata_gin
    ON products USING GIN (metadata);
```

### ❌ Mistake 3: Breaking Changes Without Plan

```sql
-- ❌ BAD - Drop column immediately (data loss!)
ALTER TABLE users
DROP COLUMN old_column;

-- ✅ GOOD - Gradual migration
-- V1: Add new column
ALTER TABLE users ADD COLUMN new_column VARCHAR(255);

-- V2: Copy data
UPDATE users SET new_column = old_column;

-- V3: Update application code to use new_column

-- V4 (later): Drop old column
ALTER TABLE users DROP COLUMN old_column;
```

### ❌ Mistake 4: Not Testing Migration

```bash
# ❌ BAD - Run migration directly on production

# ✅ GOOD - Test on local/staging first
# 1. Run locally
./mvnw flyway:migrate

# 2. Check if successful
./mvnw flyway:info

# 3. Test application
./mvnw spring-boot:run

# 4. If OK, deploy to staging/production
```

---

## 🚀 Best Practices

### 1. Always Test Migrations

```bash
# Test migration locally
./mvnw clean flyway:clean flyway:migrate

# Check migration status
./mvnw flyway:info

# Validate
./mvnw flyway:validate
```

### 2. One Migration Per Feature

```sql
-- ✅ GOOD - Focused migration
-- V5__add_user_avatar.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- ❌ BAD - Multiple unrelated changes
-- V5__various_changes.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE products ADD COLUMN featured BOOLEAN;
ALTER TABLE orders ADD COLUMN notes TEXT;
```

### 3. Always Add Indexes

```sql
-- When adding FK
ALTER TABLE products ADD COLUMN brand_id BIGINT;
CREATE INDEX idx_products_brand ON products(brand_id);  -- ✅ Must have!

-- When adding JSONB
ALTER TABLE products ADD COLUMN metadata JSONB;
CREATE INDEX idx_products_metadata_gin ON products USING GIN (metadata);  -- ✅ Must have!

-- When adding frequently queried column
ALTER TABLE users ADD COLUMN status VARCHAR(20);
CREATE INDEX idx_users_status ON users(status);  -- ✅ Good to have
```

### 4. Document Complex Migrations

```sql
-- ============================================================================
-- Migration: V10__migrate_product_attributes.sql
-- Purpose: Migrate from old attribute system to new EAV + JSONB hybrid
-- Author: [Your Name]
-- Date: 2024-12-23
--
-- Steps:
-- 1. Create new EAV tables
-- 2. Migrate data from old structure
-- 3. Add cached_attributes JSONB column
-- 4. Populate cached_attributes from EAV
-- 5. Add GIN index
-- 6. Verify data integrity
-- ============================================================================

-- Step 1: Create tables
CREATE TABLE product_attributes (...);

-- Step 2: Migrate data
INSERT INTO product_attributes (...);

-- ... more steps
```

### 5. Use Transactions (Implicit)

```sql
-- Flyway wraps each migration in a transaction
-- If any statement fails → entire migration rolls back

-- Example:
CREATE TABLE new_table (...);  -- Success
INSERT INTO new_table (...);   -- Success
CREATE INDEX idx_new (...);    -- Fails → Rollback ALL
```

### 6. Backup Before Major Migrations

```bash
# Backup database before migration
pg_dump -U postgres -d orchard_store > backup_$(date +%Y%m%d).sql

# Run migration
./mvnw flyway:migrate

# If failed, restore
psql -U postgres -d orchard_store < backup_20241223.sql
```

---

## 🧪 Migration Workflow

### Development

```bash
# 1. Create migration file
touch src/main/resources/db/migration/V5__add_product_images.sql

# 2. Write SQL
vim V5__add_product_images.sql

# 3. Test migration locally
./mvnw flyway:clean  # Clean DB (dev only!)
./mvnw flyway:migrate

# 4. Verify
./mvnw flyway:info
./mvnw spring-boot:run

# 5. Commit to git
git add src/main/resources/db/migration/V5__add_product_images.sql
git commit -m "feat: Add product images table"
```

### Staging/Production

```bash
# 1. Backup database
pg_dump -U postgres -d orchard_store > backup.sql

# 2. Check pending migrations
./mvnw flyway:info

# 3. Run migrations
./mvnw flyway:migrate

# 4. Verify
./mvnw flyway:validate

# 5. Start application
./mvnw spring-boot:run

# 6. Smoke test
curl http://localhost:8080/actuator/health
```

---

## 📊 Flyway Commands

```bash
# Info - Show migration status
./mvnw flyway:info

# Migrate - Run pending migrations
./mvnw flyway:migrate

# Validate - Check if migrations match DB
./mvnw flyway:validate

# Clean - Drop all objects (DEV ONLY!)
./mvnw flyway:clean

# Repair - Fix failed migration
./mvnw flyway:repair

# Baseline - Mark existing DB as baseline
./mvnw flyway:baseline
```

---

## 🎓 Advanced Patterns

### Pattern 1: Repeatable Migrations

**File:** `R__update_view.sql` (R instead of V)

```sql
-- Repeatable migration - runs every time checksum changes
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM product_variants
WHERE status = 'ACTIVE';
```

### Pattern 2: Conditional Migration

```sql
-- Only add column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
    END IF;
END $$;
```

### Pattern 3: Safe Enum Extension

```sql
-- Add new enum value safely
ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_status;

ALTER TABLE products
ADD CONSTRAINT check_status
CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'DISCONTINUED'));
-- Added: 'DISCONTINUED'
```

---

## ✅ Checklist

Before committing migration:

- [ ] Naming follows convention `V{n}__{description}.sql`
- [ ] SQL syntax is valid
- [ ] Indexes added for new columns (FK, frequently queried)
- [ ] GIN indexes added for JSONB columns
- [ ] Constraints added (NOT NULL, CHECK, UNIQUE)
- [ ] Foreign keys added with proper ON DELETE
- [ ] Default values set where appropriate
- [ ] Documentation/comments included
- [ ] Tested locally
- [ ] Backup plan ready

---

## 🔗 Related Documentation

- [BE_DATABASE_SCHEMA.md](./BE_DATABASE_SCHEMA.md) - Complete schema
- [JSONB_BEST_PRACTICES.md](./JSONB_BEST_PRACTICES.md) - JSONB usage
- [Flyway Documentation](https://flywaydb.org/documentation/)

---

**Last Updated:** December 2024  
**Version:** 0.2.0

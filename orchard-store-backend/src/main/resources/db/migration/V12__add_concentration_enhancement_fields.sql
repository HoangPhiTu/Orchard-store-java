-- Migration: Add enhancement fields to concentrations table
-- Created: 2025-12-03
-- Description: Adds acronym, color_code, min_oil_percentage, max_oil_percentage, and longevity fields
--              to support better UI/UX display and technical specifications for perfume concentrations

-- Add acronym column (Tên viết tắt: EDP, EDT, EDC)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'concentrations' 
        AND column_name = 'acronym'
    ) THEN
        ALTER TABLE concentrations 
        ADD COLUMN acronym VARCHAR(20) NULL;
        
        COMMENT ON COLUMN concentrations.acronym IS 'Tên viết tắt của nồng độ (ví dụ: EDP, EDT, EDC) - dùng để hiển thị trên Product Card';
    END IF;
END $$;

-- Add color_code column (Mã màu hex đại diện)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'concentrations' 
        AND column_name = 'color_code'
    ) THEN
        ALTER TABLE concentrations 
        ADD COLUMN color_code VARCHAR(7) NULL;
        
        COMMENT ON COLUMN concentrations.color_code IS 'Mã màu hex đại diện cho nồng độ (ví dụ: #FF5733) - dùng để phân biệt trực quan';
    END IF;
END $$;

-- Add min_oil_percentage column (Tỷ lệ tinh dầu tối thiểu)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'concentrations' 
        AND column_name = 'min_oil_percentage'
    ) THEN
        ALTER TABLE concentrations 
        ADD COLUMN min_oil_percentage INTEGER NULL 
        CHECK (min_oil_percentage IS NULL OR (min_oil_percentage >= 0 AND min_oil_percentage <= 100));
        
        COMMENT ON COLUMN concentrations.min_oil_percentage IS 'Tỷ lệ tinh dầu tối thiểu (0-100%) - dùng trong bảng thông số kỹ thuật';
    END IF;
END $$;

-- Add max_oil_percentage column (Tỷ lệ tinh dầu tối đa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'concentrations' 
        AND column_name = 'max_oil_percentage'
    ) THEN
        ALTER TABLE concentrations 
        ADD COLUMN max_oil_percentage INTEGER NULL 
        CHECK (max_oil_percentage IS NULL OR (max_oil_percentage >= 0 AND max_oil_percentage <= 100));
        
        COMMENT ON COLUMN concentrations.max_oil_percentage IS 'Tỷ lệ tinh dầu tối đa (0-100%) - dùng trong bảng thông số kỹ thuật';
    END IF;
END $$;

-- Add longevity column (Độ lưu hương ước tính)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'concentrations' 
        AND column_name = 'longevity'
    ) THEN
        ALTER TABLE concentrations 
        ADD COLUMN longevity VARCHAR(100) NULL;
        
        COMMENT ON COLUMN concentrations.longevity IS 'Độ lưu hương ước tính (ví dụ: "6 - 8 tiếng" hoặc "Trên 12 tiếng") - thông tin khách hàng quan tâm';
    END IF;
END $$;

-- Add check constraint to ensure min_oil_percentage <= max_oil_percentage when both are set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'concentrations' 
        AND constraint_name = 'chk_concentrations_oil_percentage_range'
    ) THEN
        ALTER TABLE concentrations 
        ADD CONSTRAINT chk_concentrations_oil_percentage_range 
        CHECK (
            min_oil_percentage IS NULL 
            OR max_oil_percentage IS NULL 
            OR min_oil_percentage <= max_oil_percentage
        );
    END IF;
END $$;

-- Add index on acronym for faster lookups
CREATE INDEX IF NOT EXISTS idx_concentrations_acronym ON concentrations(acronym) WHERE acronym IS NOT NULL;

-- Add index on color_code for filtering
CREATE INDEX IF NOT EXISTS idx_concentrations_color_code ON concentrations(color_code) WHERE color_code IS NOT NULL;


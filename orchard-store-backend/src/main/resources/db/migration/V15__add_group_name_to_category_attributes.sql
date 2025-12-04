-- Add group_name column to category_attributes table
-- This allows admin to group attributes when displaying in Product Form
-- Example: "Hương đầu", "Hương giữa", "Hương cuối" can be grouped as "Mùi hương"

ALTER TABLE category_attributes
ADD COLUMN IF NOT EXISTS group_name VARCHAR(100);

COMMENT ON COLUMN category_attributes.group_name IS 
'Tên nhóm để group các attributes khi hiển thị trong Product Form. 
Ví dụ: "Mùi hương", "Thông số", "Màu sắc". 
Nếu NULL, attributes sẽ được group theo domain (PERFUME/COSMETICS/COMMON).';

-- Create index for better query performance when grouping
CREATE INDEX IF NOT EXISTS idx_category_attributes_group_name 
ON category_attributes(category_id, group_name) 
WHERE group_name IS NOT NULL;


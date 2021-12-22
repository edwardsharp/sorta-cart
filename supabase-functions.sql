CREATE FUNCTION distinct_product_categories () RETURNS TABLE(category text) AS $$
SELECT DISTINCT category
FROM products;
$$ LANGUAGE SQL;
-- note: (category text) argument here:
CREATE FUNCTION distinct_product_sub_categories (category text) RETURNS TABLE(category text) AS $$
SELECT DISTINCT sub_category
FROM products
WHERE category = $1;
$$ LANGUAGE SQL;
-- 
CREATE FUNCTION distinct_product_vendors () RETURNS TABLE(vendor text) AS $$
SELECT DISTINCT vendor
FROM products;
$$ LANGUAGE SQL;
-- 
CREATE FUNCTION distinct_product_import_tags () RETURNS TABLE(import_tag text) AS $$
SELECT DISTINCT import_tag
FROM products;
$$ LANGUAGE SQL;
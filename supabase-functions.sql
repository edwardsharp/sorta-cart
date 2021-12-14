CREATE FUNCTION distinct_product_categories ()
RETURNS TABLE(category text) AS $$
    SELECT DISTINCT category FROM products;
$$ LANGUAGE SQL;




CREATE FUNCTION distinct_product_sub_categories (category text)
RETURNS TABLE(category text) AS $$
    SELECT DISTINCT sub_category FROM products WHERE category = $1;
$$ LANGUAGE SQL;

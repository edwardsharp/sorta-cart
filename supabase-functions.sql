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
-- 
-- so update products id if unf, upc_code, or plu is changed
-- fn
CREATE OR REPLACE FUNCTION products_update_id() RETURNS TRIGGER AS $$ BEGIN NEW.id = coalesce(NEW.unf, '') || '__' || coalesce(NEW.upc_code, '') || '__' || coalesce(NEW.plu, '');
RETURN NEW;
END;
$$ language 'plpgsql';
-- trigger
CREATE TRIGGER products_update_id_trigger BEFORE
UPDATE ON products FOR EACH ROW
    WHEN (
        (
            OLD.unf IS DISTINCT
            FROM NEW.unf
        )
        OR (
            OLD.upc_code IS DISTINCT
            FROM NEW.upc_code
        )
        OR (
            OLD.plu IS DISTINCT
            FROM NEW.plu
        )
    ) EXECUTE PROCEDURE products_update_id();
--
-- 
-- 
--  FTS stuff
alter table "Orders"
add column fts tsvector generated always as (
        to_tsvector(
            'english',
            coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(address, '') || ' ' || coalesce(notes, '')
        )
    ) stored;
create index orders_fts on "Orders" using gin (fts);
-- 
alter table products
add column fts tsvector generated always as (
        to_tsvector(
            'english',
            coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(sub_category, '') || ' ' || coalesce(vendor, '') || ' ' || coalesce(upc_code, '') || ' ' || coalesce(unf, '')
        )
    ) stored;
create index products_fts on products using gin (fts);
-- 
alter table "Members"
add column fts tsvector generated always as (
        to_tsvector(
            'english',
            coalesce(name, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(address, '') || ' ' || coalesce(registration_email, '')
        )
    ) stored;
create index members_fts on "Members" using gin (fts);
-- 
-- 
-- 
-- products description column
alter table products
add column description text generated always as (
        coalesce(description_edit, description_orig)
    ) stored;
--
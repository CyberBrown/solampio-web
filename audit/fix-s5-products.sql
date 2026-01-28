-- Fix S-5 product redirects with URL-encoded spaces
-- The SKUs have spaces but URLs need URL-encoding

-- S-5 Edge Grab (SKU has space between Edge and Grab)
UPDATE url_redirects SET new_url = '/S-5%20Edge%20Grab/' WHERE old_url = '/s-5-edge-grab/';

-- S-5 Mid Grab (SKU has space)
UPDATE url_redirects SET new_url = '/S-5%20Mid%20Grab/' WHERE old_url = '/s-5-mid-grab/';

-- S-5 B Clamp (SKU is S-5-B Clamp with space before Clamp)
UPDATE url_redirects SET new_url = '/S-5-B%20Clamp/' WHERE old_url = '/s-5-b-clamp/';

-- S-5-N Mini (SKU has space before Mini)
UPDATE url_redirects SET new_url = '/S-5-N%20Mini/' WHERE old_url = '/s-5-n-mini/';

-- S-5-S Mini (SKU has space before Mini)
UPDATE url_redirects SET new_url = '/S-5-S%20Mini/' WHERE old_url = '/s-5-s-mini/';

-- S-5-U Mini (SKU has space before Mini)
UPDATE url_redirects SET new_url = '/S-5-U%20Mini/' WHERE old_url = '/s-5-u-mini/';

-- S-5-Z Mini (SKU has space before Mini)
UPDATE url_redirects SET new_url = '/S-5-Z%20Mini/' WHERE old_url = '/s-5-z-mini/';

-- S-5-E Mini (SKU is S-5-E-Mini with hyphen, not space)
UPDATE url_redirects SET new_url = '/S-5-E-Mini/' WHERE old_url = '/s-5-e-mini/';

-- S-5-N 1.5 (SKU has space and dot)
UPDATE url_redirects SET new_url = '/S-5-N%201.5/' WHERE old_url = '/s-5-n-1-5/';

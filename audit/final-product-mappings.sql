-- Final Product URL Mappings for Discontinued Products
-- These products no longer exist in the catalog, redirect to relevant category

-- Solar panels → /solar-panels/
UPDATE url_redirects SET new_url = '/solar-panels/', status = 'mapped', notes = 'Discontinued product - redirected to solar-panels'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%solar-panel%' OR
  old_url LIKE '%-w-mono%' OR
  old_url LIKE '%bifacial%' OR
  old_url LIKE '%monocrystalline%' OR
  old_url LIKE '%390w%' OR
  old_url LIKE '%400w%' OR
  old_url LIKE '%410w%' OR
  old_url LIKE '%420w%' OR
  old_url LIKE '%430w%' OR
  old_url LIKE '%540w%' OR
  old_url LIKE '%545w%' OR
  old_url LIKE '%365w%' OR
  old_url LIKE '%380w%' OR
  old_url LIKE '%phenex%' OR
  old_url LIKE '%evervolt%solar%' OR
  old_url LIKE '%trina%' OR
  old_url LIKE '%ja-%' OR
  old_url LIKE '%talesun%' OR
  old_url LIKE '%silfab%' OR
  old_url LIKE '%phono%' OR
  old_url LIKE '%hyperion%' OR
  old_url LIKE '%byd%' OR
  old_url LIKE '%s-energy%'
);

-- Batteries → /batteries/
UPDATE url_redirects SET new_url = '/batteries/', status = 'mapped', notes = 'Discontinued product - redirected to batteries'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%battery%' OR
  old_url LIKE '%lithium%' OR
  old_url LIKE '%lifepo4%' OR
  old_url LIKE '%kwh%' OR
  old_url LIKE '%rack-mounted%' OR
  old_url LIKE '%wall-mounted%' OR
  old_url LIKE '%energy-storage%' OR
  old_url LIKE '%portable-power%' OR
  old_url LIKE '%kilovault%' OR
  old_url LIKE '%pytes%' OR
  old_url LIKE '%ebrick%' OR
  old_url LIKE '%xcellent%' OR
  old_url LIKE '%xtreme-home%' OR
  old_url LIKE '%relyez%' OR
  old_url LIKE '%powerflo%'
);

-- Inverters → /inverters/
UPDATE url_redirects SET new_url = '/inverters/', status = 'mapped', notes = 'Discontinued product - redirected to inverters'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%inverter%' OR
  old_url LIKE '%conext%' OR
  old_url LIKE '%radian%' OR
  old_url LIKE '%xw-pro%' OR
  old_url LIKE '%schneider%' OR
  old_url LIKE '%magnum%' OR
  old_url LIKE '%outback%' AND old_url NOT LIKE '%charge%' OR
  old_url LIKE '%samlex%' OR
  old_url LIKE '%flex-%kw%' OR
  old_url LIKE '%aio%' OR
  old_url LIKE '%off-grid-diy%' OR
  old_url LIKE '%srne-spi%'
);

-- Charge controllers → /charge-controllers/
UPDATE url_redirects SET new_url = '/charge-controllers/', status = 'mapped', notes = 'Discontinued product - redirected to charge-controllers'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%charge-controller%' OR
  old_url LIKE '%mppt%' OR
  old_url LIKE '%pwm%' OR
  old_url LIKE '%flexmax%' OR
  old_url LIKE '%morningstar%' OR
  old_url LIKE '%fangpusun%'
);

-- Balance of System → /balance-of-system/
UPDATE url_redirects SET new_url = '/balance-of-system/', status = 'mapped', notes = 'Discontinued product - redirected to balance-of-system'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%breaker%' OR
  old_url LIKE '%fuse%' OR
  old_url LIKE '%combiner%' OR
  old_url LIKE '%busbar%' OR
  old_url LIKE '%e-panel%' OR
  old_url LIKE '%wire%' OR
  old_url LIKE '%cable%' OR
  old_url LIKE '%lug%' OR
  old_url LIKE '%disconnect%' OR
  old_url LIKE '%rapid-shutdown%' OR
  old_url LIKE '%load-center%' OR
  old_url LIKE '%monitoring%' OR
  old_url LIKE '%shunt%' OR
  old_url LIKE '%conduit%' OR
  old_url LIKE '%sensor%'
);

-- Mounting and Racking → /mounting-and-racking/
UPDATE url_redirects SET new_url = '/mounting-and-racking/', status = 'mapped', notes = 'Discontinued product - redirected to mounting-and-racking'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%mount%' OR
  old_url LIKE '%rail%' OR
  old_url LIKE '%roof%' OR
  old_url LIKE '%solarfoot%' OR
  old_url LIKE '%clip%' OR
  old_url LIKE '%flashing%'
);

-- Solar Power Systems → /solar-power-systems/
UPDATE url_redirects SET new_url = '/solar-power-systems/', status = 'mapped', notes = 'Discontinued product - redirected to solar-power-systems'
WHERE status = 'manual_review' AND source_type = 'product' AND (
  old_url LIKE '%power-panel%' OR
  old_url LIKE '%pre-wired%' OR
  old_url LIKE '%kit%' OR
  old_url LIKE '%system%'
);

-- Remaining products → /products/
UPDATE url_redirects SET new_url = '/products/', status = 'mapped', notes = 'Discontinued/unknown product - redirected to products page'
WHERE status = 'manual_review' AND source_type = 'product';

-- Check how many are still unmatched
-- SELECT COUNT(*) FROM url_redirects WHERE status = 'manual_review';

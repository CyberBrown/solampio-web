-- Shorten summaries over 300 characters to under 250 characters
-- Target: Keep essential product info, remove filler words

-- 1. DELLA (379 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Delta Lightning Arrestor is a professional-grade surge protection device safeguarding solar inverters and electrical panels from lightning-induced voltage spikes. Features weatherproof NEMA 4 enclosure for residential and commercial systems.' WHERE sku = 'DELLA';

-- 2. Envy-Duo-21 (338 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Fortress Power Envy Duo 21 is a high-performance 48V hybrid inverter delivering 12kW continuous power with 240V split-phase and 208V three-phase support. Features 25kW PV input and integrated rapid shutdown.' WHERE sku = 'Envy-Duo-21';

-- 3. MNPV-DISCO (334 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Midnite Solar MNPV-DISCO series features lockable disconnect and rust-proof NEMA 3R aluminum enclosure. ETL listed for AC and DC applications, ideal for residential and commercial solar arrays.' WHERE sku = 'MNPV-DISCO';

-- 4. GS (333 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Morningstar GenStar MPPT is a fully integrated DC system controller for professional off-grid applications. Features ReadyRail expansion and 150% PV oversizing for telecom, industrial, and residential systems.' WHERE sku = 'GS';

-- 5. VIC-SS-250-85 (331 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Victron SmartSolar MPPT 250/85-Tr VE.Can features ultra-fast MPPT tracking and Bluetooth monitoring. Handles PV arrays up to 250V with 85A charging current and 98%+ efficiency for systems up to 48V.' WHERE sku = 'VIC-SS-250-85';

-- 6. MNPowerflo5 (329 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The MidNite Solar MNPowerflo5 is a 5.12kWh LiFePO4 server rack battery for off-grid and industrial systems. Features plug-and-play communication and UL 9540 certification for reliable, scalable energy storage.' WHERE sku = 'MNPowerflo5';

-- 7. 110000000000-A (325 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Pytes V5 is a 48V 5.12kWh LiFePO4 battery pack with integrated heating for cold-weather performance. Compatible with Sol-Ark and Victron inverters, ideal for scalable off-grid and backup power.' WHERE sku = '110000000000-A';

-- 8. S-5-T (320 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The S-5-T is a heavy-duty non-penetrating clamp for T-shaped seam metal roofs and architectural single-fold seams. Two-piece design allows installation anywhere along seams for solar, snow retention, and HVAC.' WHERE sku = 'S-5-T';

-- 9. SAEnvy8/10 (316 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Fortress Power Envy 8kW/10kW is an all-in-one hybrid inverter for whole-home backup and VPP participation. Features integrated AC/DC breakers and rapid shutdown for residential and commercial projects.' WHERE sku = 'SAEnvy8/10';

-- 10. UNI-TL1O (315 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Tamarack Solar UNI-TL1O Rail Tilt Kit adds 7-11 degrees of tilt to flush-mounted solar arrays on flat roofs. Features electrically bonded aluminum legs with simple single-tool installation.' WHERE sku = 'UNI-TL1O';

-- 11. SF.P12BLDC24 (314 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The 12" Brushless DC Snap-Fan by Fogco delivers up to 1414 CFM for solar-direct and battery systems. Features IP54 weather-resistant motor and aerodynamic blades for off-grid cabins and greenhouses.' WHERE sku = 'SF.P12BLDC24';

-- 12. MNPowerflo16 (312 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The MidNite MNPowerflo16 is a 16.1kWh LiFePO4 battery with Grade A+ Eve cells and integrated self-heating. Offers 8,000 cycles and plug-and-play integration with MidNite-compatible inverters.' WHERE sku = 'MNPowerflo16';

-- 13. RS485COMS (311 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'RS-485 Shielded 2-Pair 24AWG communication cable eliminates noise issues that cause system tech support calls. Fully compatible with Sol-Ark inverters and Tigo monitoring systems.' WHERE sku = 'RS485COMS';

-- 14. SF.P16BLDC24 (310 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Fogco 16" Brushless DC Snap-Fan features IP54 weather protection and advanced brushless motor technology. Provides efficient, sustainable cooling for greenhouses, barns, and off-grid properties.' WHERE sku = 'SF.P16BLDC24';

-- 15. PTB-ALPHA-ONE (309 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Solamp Custom Passthrough Box provides weatherproof, code-compliant wire management for roof penetrations. Custom-engineered with pre-wired MC4 connections and integrated surge protection.' WHERE sku = 'PTB-ALPHA-ONE';

-- 16. RT-MINI-DMS (308 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Roof Tech RT-MINI-DMS is a 5x60mm stainless steel screw for direct-to-decking solar mount installation. Corrosion-resistant with code-compliant, watertight performance on asphalt and metal roofs.' WHERE sku = 'RT-MINI-DMS';

-- 17. MNROSIEPW (307 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Midnite Solar Rosie Pre-wired System is a 7kW inverter with MNPowerflo batteries for 16-20kWh storage. Provides reliable 120/240V pure sine wave power for off-grid and backup applications.' WHERE sku = 'MNROSIEPW';

-- 18. MNWB (306 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The MidNite Solar MNWB White Box mounts directly to Classic charge controllers. Houses circuit breakers and organizes DC wiring in a durable powder-coated steel enclosure for a clean finish.' WHERE sku = 'MNWB';

-- 19. MNROSIE7048PW (305 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The MidNite Solar MNROSIE7048PW Rosie is a pre-wired 7000W inverter system at 120/240V. Includes integrated circuit breakers and simplified wiring interface for off-grid and backup applications.' WHERE sku = 'MNROSIE7048PW';

-- 20. PowerRack-1000 (304 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The PowerField PowerRack 1000 is a no-dig, tool-free solar ground mount for rapid deployment. Ballasted design eliminates concrete or ground penetration. 100% American-made and recyclable.' WHERE sku = 'PowerRack-1000';

-- 21. SOLARK (304 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Sol-Ark Hybrid Inverter combines grid-tied, off-grid, and battery charging in one smart system. Offers seamless power source transitions for maximum efficiency and total energy independence.' WHERE sku = 'SOLARK';

-- 22. JB (303 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The EZ Solar Ultimate PV Junction Box provides weatherproof wire management for rooftop solar. Multiple configurations including rail-mount and tile-roof options with patented leak-free design.' WHERE sku = 'JB';

-- 23. S-5-B Clamp (303 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The S-5-B Mini is a high-strength brass clamp for double-folded copper standing seam roofs. Non-penetrating, metallurgically compatible attachment for solar racking while preserving roof integrity.' WHERE sku = 'S-5-B Clamp';

-- 24. SF.P20BLDC30 (301 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The Fogco 20" HP DC Brushless Snap-Fan delivers 5027 CFM for 24V solar and battery systems. Industrial-grade brushless motor provides reliable, quiet cooling for greenhouses and off-grid properties.' WHERE sku = 'SF.P20BLDC30';

-- 25. MNHAWKSBAYBB125 (300 -> ~240)
UPDATE storefront_products SET seo_description_summary = 'The MidNite Solar Hawks Bay BB 125 breaker box integrates with Hawke''s Bay MPPT controllers. Features 125A battery breaker and 30A PV shunt trip for residential and commercial solar protection.' WHERE sku = 'MNHAWKSBAYBB125';

import { describe, it, expect } from 'vitest';
import {
	migrateWardCode,
	reverseMigrateWardCode,
	batchMigrateWardCodes,
	getWardMappings,
	getMergedProvince,
	getAllMergedProvinces,
	isProvinceMerged,
} from '../migration';

describe('Migration Module — NQ 202/2025/QH15', () => {
	// ==================== WARD MIGRATION ====================
	describe('Ward Code Migration', () => {
		it('should migrate old ward code to new', async () => {
			const mappings = await migrateWardCode('26881');
			expect(mappings.length).toBeGreaterThan(0);
			expect(mappings[0].oldWardCode).toBe('26881');
			expect(mappings[0].newWardCode).toBeDefined();
			expect(mappings[0].newWardName).toBeDefined();
		});

		it('should return empty array for unknown ward code', async () => {
			const mappings = await migrateWardCode('99999');
			expect(mappings).toHaveLength(0);
		});

		it('should reverse migrate new ward code to old', async () => {
			const forward = await migrateWardCode('26881');
			expect(forward.length).toBeGreaterThan(0);
			const newCode = forward[0].newWardCode;
			const reverse = await reverseMigrateWardCode(newCode);
			expect(reverse.length).toBeGreaterThan(0);
			expect(reverse.some((m) => m.oldWardCode === '26881')).toBe(true);
		});

		it('should handle PARTIAL migration (single old ward splitting into multiple new wards)', async () => {
			// Old ward 00016 (Phường Ngọc Hà) was partitioned into Ba Đình (00004) and Ngọc Hà (00008)
			const mappings = await migrateWardCode('00016');
			expect(mappings.length).toBe(2);
			const newCodes = mappings.map((m) => m.newWardCode);
			expect(newCodes).toContain('00004');
			expect(newCodes).toContain('00008');
			mappings.forEach((m) => expect(m.relation).toBe('PARTIAL'));
		});

		it('should handle reverse migration for communes merged from multiple old wards', async () => {
			// Commune 00382 (Xã Kim Anh) was merged from 00382, 00397, 00415
			const reverse = await reverseMigrateWardCode('00382');
			expect(reverse).toHaveLength(3);
			const oldCodes = reverse.map((m) => m.oldWardCode);
			expect(oldCodes).toContain('00382');
			expect(oldCodes).toContain('00397');
			expect(oldCodes).toContain('00415');
			reverse.forEach((m) => expect(m.relation).toBe('MERGED'));
		});

		it('should handle RENAMED relation', async () => {
			// 14845 Thị trấn Mường Lát -> 14845 Xã Mường Lát
			const mappings = await migrateWardCode('14845');
			expect(mappings.length).toBeGreaterThan(0);
			expect(mappings[0].relation).toBe('RENAMED');
		});

		it('should support reverse lookup for converted island districts with null oldWardCode', async () => {
			// 11948 = Đặc khu Bạch Long Vĩ
			const mappings = await reverseMigrateWardCode('11948');
			expect(mappings).toHaveLength(1);
			expect(mappings[0].oldWardCode).toBeNull();
			expect(mappings[0].relation).toBe('DISTRICT_CONVERTED');
		});

		it('should batch migrate multiple ward codes', async () => {
			const results = await batchMigrateWardCodes(['26881', '99999', '00004']);
			expect(results).toHaveLength(3);

			// First should be mapped
			expect(results[0].oldWardCode).toBe('26881');
			expect(results[0].status).toBe('mapped');

			// Second should not be found
			expect(results[1].oldWardCode).toBe('99999');
			expect(results[1].status).toBe('not_found');
		});

		it('should load all ward mappings (10,571 from official NSO data)', async () => {
			const mappings = await getWardMappings();
			expect(mappings).toHaveLength(10571);
			// Check structure
			const first = mappings[0];
			expect(first).toHaveProperty('oldWardCode');
			expect(first).toHaveProperty('oldWardName');
			expect(first).toHaveProperty('oldDistrictName');
			expect(first).toHaveProperty('oldProvinceName');
			expect(first).toHaveProperty('newWardCode');
			expect(first).toHaveProperty('newWardName');
			expect(first).toHaveProperty('newProvinceName');
			expect(first).toHaveProperty('relation');
		});

		it('should handle special zones without oldWardCode (5 island districts + 1 uncoded area)', async () => {
			const mappings = await getWardMappings();
			const withoutOldCode = mappings.filter((m) => m.oldWardCode === null);
			expect(withoutOldCode).toHaveLength(6);

			const relations = withoutOldCode.map((m) => m.relation);
			expect(relations.filter((r) => r === 'DISTRICT_CONVERTED')).toHaveLength(
				5
			);
			expect(relations.filter((r) => r === 'UNCODED_AREA')).toHaveLength(1);

			// Bạch Long Vĩ, Côn Đảo, Cồn Cỏ, Hoàng Sa, Lý Sơn
			const islandNames = withoutOldCode
				.filter((m) => m.relation === 'DISTRICT_CONVERTED')
				.map((m) => m.newWardName);
			expect(islandNames).toContain('Đặc khu Bạch Long Vĩ');
			expect(islandNames).toContain('Đặc khu Côn Đảo');
			expect(islandNames).toContain('Đặc khu Cồn Cỏ');
			expect(islandNames).toContain('Đặc khu Hoàng Sa');
			expect(islandNames).toContain('Đặc khu Lý Sơn');
		});

		it('should correctly map Ia Mơ with official code 23938', async () => {
			const mappings = await migrateWardCode('23938');
			expect(mappings.length).toBeGreaterThan(0);
			expect(mappings[0].newWardCode).toBe('23938');
			expect(mappings[0].newWardName).toBe('Xã Ia Mơ');
			expect(mappings[0].relation).toBe('UNCHANGED');
		});

		it('should safely handle edge cases (empty string, null, undefined, invalid types)', async () => {
			expect(await migrateWardCode('')).toEqual([]);
			expect(await migrateWardCode(null as any)).toEqual([]);
			expect(await migrateWardCode(undefined as any)).toEqual([]);

			expect(await reverseMigrateWardCode('')).toEqual([]);
			expect(await reverseMigrateWardCode(null as any)).toEqual([]);
			expect(await reverseMigrateWardCode(undefined as any)).toEqual([]);

			expect(await batchMigrateWardCodes(null as any)).toEqual([]);
			expect(await batchMigrateWardCodes([])).toEqual([]);

			expect(await getMergedProvince('')).toBeUndefined();
			expect(await getMergedProvince(null as any)).toBeUndefined();
			expect(await isProvinceMerged('')).toBe(false);
			expect(await isProvinceMerged(null as any)).toBe(false);
		});
	});

	// ==================== PROVINCE MIGRATION ====================
	describe('Province Merge Info', () => {
		it('should find Hà Giang (02) merged into Tuyên Quang (08)', async () => {
			const result = await getMergedProvince('02');
			expect(result).toBeDefined();
			expect(result!.oldProvinceId).toBe('02');
			expect(result!.oldProvinceName).toBe('Tỉnh Hà Giang');
			expect(result!.newProvinceId).toBe('08');
			expect(result!.newProvinceName).toBe('Tuyên Quang');
		});

		it('should find Quảng Nam (49) merged into Đà Nẵng (48)', async () => {
			const result = await getMergedProvince('49');
			expect(result).toBeDefined();
			expect(result!.newProvinceId).toBe('48');
		});

		it('should find Hải Dương (30) merged into Hải Phòng (31)', async () => {
			const result = await getMergedProvince('30');
			expect(result).toBeDefined();
			expect(result!.newProvinceId).toBe('31');
		});

		it('should find 2026 merged provinces (Bắc Ninh, Đồng Nai, TP.HCM, Phú Thọ)', async () => {
			// Bắc Ninh cũ 27 -> Thành phố Bắc Ninh 24
			const bn = await getMergedProvince('27');
			expect(bn).toBeDefined();
			expect(bn!.newProvinceId).toBe('24');
			expect(bn!.newProvinceName).toBe('Thành phố Bắc Ninh');

			// Bình Phước 70 -> Thành phố Đồng Nai 75
			const bp = await getMergedProvince('70');
			expect(bp).toBeDefined();
			expect(bp!.newProvinceId).toBe('75');
			expect(bp!.newProvinceName).toBe('Thành phố Đồng Nai');

			// Bình Dương 74 and Bà Rịa - Vũng Tàu 77 -> Thành phố Hồ Chí Minh 79
			const bd = await getMergedProvince('74');
			expect(bd).toBeDefined();
			expect(bd!.newProvinceId).toBe('79');

			const brvt = await getMergedProvince('77');
			expect(brvt).toBeDefined();
			expect(brvt!.newProvinceId).toBe('79');

			// Vĩnh Phúc 26 and Hòa Bình 17 -> Phú Thọ 25
			const vp = await getMergedProvince('26');
			expect(vp).toBeDefined();
			expect(vp!.newProvinceId).toBe('25');

			const hb = await getMergedProvince('17');
			expect(hb).toBeDefined();
			expect(hb!.newProvinceId).toBe('25');
		});

		it('should return undefined for non-merged province', async () => {
			const result = await getMergedProvince('01'); // Hà Nội — not merged
			expect(result).toBeUndefined();
		});

		it('should check if province is merged', async () => {
			expect(await isProvinceMerged('02')).toBe(true); // Hà Giang
			expect(await isProvinceMerged('01')).toBe(false); // Hà Nội
			expect(await isProvinceMerged('49')).toBe(true); // Quảng Nam
		});

		it('should get all merged provinces', async () => {
			const merges = await getAllMergedProvinces();
			expect(merges.length).toBeGreaterThan(0);
			// Each merge should have newProvinceId and mergedFrom
			merges.forEach((m) => {
				expect(m.newProvinceId).toBeDefined();
				expect(m.newProvinceName).toBeDefined();
				expect(m.mergedFrom.length).toBeGreaterThan(0);
			});
		});
	});

	// ==================== V2 BACKWARD COMPATIBILITY ====================
	describe('v2 API backward compatibility', () => {
		it('v2 provinces should still return 63', async () => {
			const { getAllProvince } = await import('../provinces');
			const provinces = await getAllProvince();
			expect(provinces).toHaveLength(63);
		});

		it('v2 districts should still return 696', async () => {
			const { getAllDistricts } = await import('../districts');
			const districts = await getAllDistricts();
			expect(districts).toHaveLength(696);
		});

		it('v2 communes should still return 10051', async () => {
			const { getAllCommunes } = await import('../communes');
			const communes = await getAllCommunes();
			expect(communes).toHaveLength(10051);
		});
	});
});

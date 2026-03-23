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
			// First get a valid new code
			const forward = await migrateWardCode('26881');
			if (forward.length > 0) {
				const reverse = await reverseMigrateWardCode(forward[0].newWardCode);
				expect(reverse.length).toBeGreaterThan(0);
			}
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

		it('should load all ward mappings', async () => {
			const mappings = await getWardMappings();
			expect(mappings).toHaveLength(10977);
			// Check structure
			const first = mappings[0];
			expect(first).toHaveProperty('oldWardCode');
			expect(first).toHaveProperty('oldWardName');
			expect(first).toHaveProperty('oldDistrictName');
			expect(first).toHaveProperty('oldProvinceName');
			expect(first).toHaveProperty('newWardCode');
			expect(first).toHaveProperty('newWardName');
			expect(first).toHaveProperty('newProvinceName');
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

		it('should return undefined for non-merged province', async () => {
			const result = await getMergedProvince('01'); // Hà Nội — not merged
			expect(result).toBeUndefined();
		});

		it('should check if province is merged', async () => {
			expect(await isProvinceMerged('02')).toBe(true);  // Hà Giang
			expect(await isProvinceMerged('01')).toBe(false); // Hà Nội
			expect(await isProvinceMerged('49')).toBe(true);  // Quảng Nam
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


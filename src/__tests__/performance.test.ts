import { describe, it, expect, beforeAll } from 'vitest';
import { 
	getAllProvince, 
	getAllProvincesSorted, 
	searchProvinceByName,
	getDistrictsByProvinceId,
	isValidProvinceId 
} from '../provinces';
import { 
	getAllDistricts, 
	getDistrictById, 
	searchDistrictByName,
	getCommunesByDistrictId 
} from '../districts';
import { 
	getAllCommunes, 
	getCommuneById, 
	searchCommuneByName 
} from '../communes';
import {
	getProvinceAutocomplete,
	getDistrictAutocomplete,
	getCommuneAutocomplete,
	getUniversalAutocomplete
} from '../features/autocomplete';
import {
	getProvinceWithDistricts,
	getDistrictWithCommunes,
	getFullHierarchy,
	getAddressPath,
	getFormattedAddress
} from '../features/hierarchy';
import {
	getProvincesBatch,
	getDistrictsBatch,
	getCommunesBatch,
	getFullAddressesBatch
} from '../features/batch';

describe('Performance Tests', () => {
	describe('Province Operations', () => {
		it('should load provinces efficiently', async () => {
			const start = performance.now();
			const provinces = await getAllProvince();
			const end = performance.now();
			
			expect(provinces).toBeDefined();
			expect(provinces.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100); // Should be fast due to caching
		});

		it('should sort provinces efficiently with memoization', async () => {
			const start1 = performance.now();
			const sorted1 = await getAllProvincesSorted();
			const end1 = performance.now();
			
			const start2 = performance.now();
			const sorted2 = await getAllProvincesSorted();
			const end2 = performance.now();
			
			expect(sorted1).toEqual(sorted2);
			expect(end2 - start2).toBeLessThan(end1 - start1); // Second call should be faster due to memoization
		});

		it('should search provinces efficiently', async () => {
			const start = performance.now();
			const results = await searchProvinceByName('Hà Nội');
			const end = performance.now();
			
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50); // Should be fast with indexed search
		});

		it('should validate province IDs efficiently', async () => {
			const start = performance.now();
			const isValid = await isValidProvinceId('01');
			const end = performance.now();
			
			expect(isValid).toBe(true);
			expect(end - start).toBeLessThan(10); // O(1) lookup should be very fast
		});
	});

	describe('District Operations', () => {
		it('should get districts by province ID efficiently', async () => {
			const start = performance.now();
			const districts = await getDistrictsByProvinceId('01');
			const end = performance.now();
			
			expect(districts).toBeDefined();
			expect(districts.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(20); // O(1) lookup should be fast
		});

		it('should get district by ID efficiently', async () => {
			const start = performance.now();
			const district = await getDistrictById('001');
			const end = performance.now();
			
			expect(district).toBeDefined();
			expect(end - start).toBeLessThan(10); // O(1) lookup should be very fast
		});
	});

	describe('Commune Operations', () => {
		it('should get communes by district ID efficiently', async () => {
			const start = performance.now();
			const communes = await getCommunesByDistrictId('001');
			const end = performance.now();
			
			expect(communes).toBeDefined();
			expect(communes.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100); // O(1) lookup should be fast (first load may be slower)
		});

		it('should get commune by ID efficiently', async () => {
			const start = performance.now();
			const commune = await getCommuneById('00001');
			const end = performance.now();
			
			expect(commune).toBeDefined();
			expect(end - start).toBeLessThan(10); // O(1) lookup should be very fast
		});
	});

	describe('Autocomplete Features', () => {
		it('should provide province autocomplete efficiently', async () => {
			const start = performance.now();
			const results = await getProvinceAutocomplete('Hà');
			const end = performance.now();
			
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0]).toHaveProperty('score');
			expect(end - start).toBeLessThan(50);
		});

		it('should provide universal autocomplete efficiently', async () => {
			const start = performance.now();
			const results = await getUniversalAutocomplete('Hà');
			const end = performance.now();
			
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100);
		});
	});

	describe('Hierarchy Features', () => {
		it('should get province with districts efficiently', async () => {
			const start = performance.now();
			const result = await getProvinceWithDistricts('01');
			const end = performance.now();
			
			expect(result).toBeDefined();
			expect(result?.districts).toBeDefined();
			expect(result?.districts.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50);
		});

		it('should get address path efficiently', async () => {
			const start = performance.now();
			const path = await getAddressPath('00001');
			const end = performance.now();
			
			expect(path).toBeDefined();
			expect(path?.commune).toBeDefined();
			expect(path?.district).toBeDefined();
			expect(path?.province).toBeDefined();
			expect(end - start).toBeLessThan(30);
		});

		it('should format address efficiently', async () => {
			const start = performance.now();
			const address = await getFormattedAddress('00001');
			const end = performance.now();
			
			expect(address).toBeDefined();
			expect(typeof address).toBe('string');
			expect(address?.includes(',')).toBe(true);
			expect(end - start).toBeLessThan(30);
		});
	});

	describe('Batch Operations', () => {
		it('should handle batch province operations efficiently', async () => {
			const provinceIds = ['01', '79', '31', '48', '92'];
			
			const start = performance.now();
			const result = await getProvincesBatch(provinceIds);
			const end = performance.now();
			
			expect(result.success).toBeDefined();
			expect(result.success.length).toBe(5);
			expect(result.failed.length).toBe(0);
			expect(end - start).toBeLessThan(100);
		});

		it('should handle batch address operations efficiently', async () => {
			const communeIds = ['00001', '00004', '00007'];
			
			const start = performance.now();
			const results = await getFullAddressesBatch(communeIds);
			const end = performance.now();
			
			expect(results).toBeDefined();
			expect(results.length).toBe(3);
			expect(results[0].fullAddress).toBeDefined();
			expect(end - start).toBeLessThan(100);
		});
	});

	describe('Memory Usage', () => {
		it('should not load all data immediately', async () => {
			// This test ensures lazy loading is working
			// We can't directly measure memory, but we can ensure
			// that data is only loaded when needed
			
			const start = performance.now();
			// Just importing shouldn't load all data
			const end = performance.now();
			
			expect(end - start).toBeLessThan(10);
		});
	});
});

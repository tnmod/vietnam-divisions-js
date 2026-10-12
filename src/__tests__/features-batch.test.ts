import { describe, it, expect } from 'vitest';
import {
	getProvincesBatch,
	getDistrictsBatch,
	getCommunesBatch,
	getDistrictsForProvincesBatch,
	getCommunesForDistrictsBatch,
	validateProvinceIdsBatch,
	getFullAddressesBatch,
	getProvinceStatsBatch,
} from '../features/batch';

describe('Batch Operations Features', () => {
	it('should get provinces in batch with success and failed lists', async () => {
		const result = await getProvincesBatch(['01', '79', '999']);
		expect(result.success).toHaveLength(2);
		expect(result.failed).toEqual(['999']);
		expect(result.success.map((p) => p.idProvince)).toEqual(['01', '79']);
	});

	it('should get districts in batch', async () => {
		const result = await getDistrictsBatch(['001', '002', '999']);
		expect(result.success.length).toBeGreaterThan(0);
		expect(result.failed).toContain('999');
	});

	it('should get communes in batch', async () => {
		const result = await getCommunesBatch(['00001', '00004', '99999']);
		expect(result.success.length).toBeGreaterThan(0);
		expect(result.failed).toContain('99999');
	});

	it('should get districts for multiple provinces in batch', async () => {
		const result = await getDistrictsForProvincesBatch(['01', '79']);
		expect(result['01']).toBeDefined();
		expect(result['79']).toBeDefined();
		expect(result['01'].length).toBeGreaterThan(0);
		expect(result['79'].length).toBeGreaterThan(0);
	});

	it('should get communes for multiple districts in batch', async () => {
		const result = await getCommunesForDistrictsBatch(['001', '002']);
		expect(result['001']).toBeDefined();
		expect(result['002']).toBeDefined();
		expect(result['001'].length).toBeGreaterThan(0);
		expect(result['002'].length).toBeGreaterThan(0);
	});

	it('should validate multiple province IDs in batch', async () => {
		const result = await validateProvinceIdsBatch(['01', '79', '999']);
		expect(result['01']).toBe(true);
		expect(result['79']).toBe(true);
		expect(result['999']).toBe(false);
	});

	it('should get full addresses in batch', async () => {
		const result = await getFullAddressesBatch(['00001', '00004', '99999']);
		expect(result).toHaveLength(3);
		expect(result[0].fullAddress).toBeDefined();
		expect(result[0].province?.idProvince).toBe('01');
		expect(result[2].fullAddress).toBeUndefined();
	});

	it('should get province stats in batch', async () => {
		const result = await getProvinceStatsBatch(['01', '79']);
		expect(result).toHaveLength(2);
		expect(result[0].province.idProvince).toBe('01');
		expect(result[0].districtCount).toBeGreaterThan(0);
		expect(result[0].communeCount).toBeGreaterThan(0);
	});
});

import { describe, it, expect } from 'vitest';
import {
	loadV3ProvinceData,
	loadV3CommuneData,
	loadWardMappings,
	getV3ProvinceData,
	getV3ProvinceById,
	getV3ProvinceByCode,
	searchV3Provinces,
	getV3CommuneData,
	getV3CommuneById,
	getV3CommunesByProvinceId,
	searchV3Communes,
	getWardMappingsData,
	getMappingsByOldCode,
	getMappingsByNewCode,
} from '../v3/cache';

describe('v3 cache', () => {
	describe('loaders', () => {
		it('are idempotent and safe to call concurrently', async () => {
			await Promise.all([
				loadV3ProvinceData(),
				loadV3ProvinceData(),
				loadV3CommuneData(),
				loadV3CommuneData(),
				loadWardMappings(),
				loadWardMappings(),
			]);
			expect(await getV3ProvinceData()).toHaveLength(34);
			expect(await getV3CommuneData()).toHaveLength(3321);
			expect(await getWardMappingsData()).toHaveLength(10571);
		});
	});

	describe('provinces', () => {
		it('looks up by id', async () => {
			expect((await getV3ProvinceById('79'))!.name).toBe(
				'Thành phố Hồ Chí Minh'
			);
			expect(await getV3ProvinceById('02')).toBeUndefined(); // merged away
			expect(await getV3ProvinceById('99')).toBeUndefined();
		});

		it('accepts a numeric id by coercing to string', async () => {
			expect((await getV3ProvinceById(79 as any))!.idProvince).toBe('79');
			// 8 becomes "8", which is not the zero-padded id "08"
			expect(await getV3ProvinceById(8 as any)).toBeUndefined();
			expect(await getV3ProvinceById(0 as any)).toBeUndefined();
		});

		it('looks up by code, case-insensitively', async () => {
			expect((await getV3ProvinceByCode('HNI'))!.idProvince).toBe('01');
			expect((await getV3ProvinceByCode('hni'))!.idProvince).toBe('01');
			expect(await getV3ProvinceByCode('XXX')).toBeUndefined();
		});

		it('rejects non-string codes without throwing', async () => {
			expect(await getV3ProvinceByCode(123 as any)).toBeUndefined();
			expect(await getV3ProvinceByCode({} as any)).toBeUndefined();
			expect(await getV3ProvinceByCode(undefined as any)).toBeUndefined();
		});

		it('searches accent-insensitively', async () => {
			const results = await searchV3Provinces('ha noi');
			expect(results.map((p) => p.idProvince)).toContain('01');
			expect(await searchV3Provinces('zzzzzz')).toEqual([]);
		});

		it('finds renamed 2026 cities by their short name', async () => {
			for (const [query, id] of [
				['Đồng Nai', '75'],
				['Quảng Ninh', '22'],
				['Bắc Ninh', '24'],
			]) {
				const results = await searchV3Provinces(query);
				expect(results.map((p) => p.idProvince)).toContain(id);
			}
		});

		it('returns [] for empty / whitespace / nullish queries', async () => {
			expect(await searchV3Provinces('')).toEqual([]);
			expect(await searchV3Provinces('   ')).toEqual([]);
			expect(await searchV3Provinces(null as any)).toEqual([]);
			expect(await searchV3Provinces(undefined as any)).toEqual([]);
		});

		it('has unique ids and codes', async () => {
			const provinces = await getV3ProvinceData();
			expect(new Set(provinces.map((p) => p.idProvince)).size).toBe(34);
			expect(new Set(provinces.map((p) => p.code)).size).toBe(34);
		});
	});

	describe('communes', () => {
		it('looks up by id', async () => {
			expect((await getV3CommuneById('00004'))!.name).toBe('Phường Ba Đình');
			expect(await getV3CommuneById('00000')).toBeUndefined();
		});

		it('accepts a numeric id by coercing to string (zero-padding is required)', async () => {
			// 4 as a number becomes "4", which is NOT the padded code "00004"
			expect(await getV3CommuneById(4 as any)).toBeUndefined();
		});

		it('groups communes by province and covers every commune', async () => {
			const provinces = await getV3ProvinceData();
			let total = 0;
			for (const p of provinces) {
				const communes = await getV3CommunesByProvinceId(p.idProvince);
				expect(communes.length).toBeGreaterThan(0);
				communes.forEach((c) => expect(c.idProvince).toBe(p.idProvince));
				total += communes.length;
			}
			expect(total).toBe(3321);
		});

		it('returns [] for unknown / empty province ids', async () => {
			expect(await getV3CommunesByProvinceId('99')).toEqual([]);
			expect(await getV3CommunesByProvinceId('')).toEqual([]);
			expect(await getV3CommunesByProvinceId(undefined as any)).toEqual([]);
		});

		it('searches accent-insensitively', async () => {
			const results = await searchV3Communes('ba dinh');
			expect(results.map((c) => c.idCommune)).toContain('00004');
			expect(await searchV3Communes('zzzzzz')).toEqual([]);
		});

		it('returns [] for empty / whitespace / nullish queries', async () => {
			expect(await searchV3Communes('')).toEqual([]);
			expect(await searchV3Communes('   ')).toEqual([]);
			expect(await searchV3Communes(null as any)).toEqual([]);
		});

		it('has unique ids, 5-digit codes, NFC names and valid provinces', async () => {
			const communes = await getV3CommuneData();
			const provinceIds = new Set(
				(await getV3ProvinceData()).map((p) => p.idProvince)
			);
			expect(new Set(communes.map((c) => c.idCommune)).size).toBe(3321);
			for (const c of communes) {
				expect(c.idCommune).toMatch(/^\d{5}$/);
				expect(c.name).toBe(c.name.normalize('NFC'));
				expect(c.name.trim()).toBe(c.name);
				expect(provinceIds.has(c.idProvince)).toBe(true);
			}
		});
	});

	describe('ward mappings', () => {
		it('finds mappings by old code', async () => {
			const res = await getMappingsByOldCode('23938');
			expect(res).toHaveLength(1);
			expect(res[0].newWardCode).toBe('23938');
		});

		it('finds mappings by new code', async () => {
			const res = await getMappingsByNewCode('23938');
			expect(res.length).toBeGreaterThan(0);
			res.forEach((m) => expect(m.newWardCode).toBe('23938'));
		});

		it('returns [] for unknown / empty / nullish codes', async () => {
			for (const code of ['99999', '', null, undefined]) {
				expect(await getMappingsByOldCode(code as any)).toEqual([]);
				expect(await getMappingsByNewCode(code as any)).toEqual([]);
			}
		});

		it('never indexes records with a null oldWardCode by old code', async () => {
			expect(await getMappingsByOldCode(null as any)).toEqual([]);
			expect(await getMappingsByOldCode('null')).toEqual([]);
		});

		it('keeps null-oldWardCode records reachable by new code', async () => {
			for (const code of ['11948', '19742', '20333', '21548', '26732']) {
				const res = await getMappingsByNewCode(code);
				expect(res).toHaveLength(1);
				expect(res[0].oldWardCode).toBeNull();
				expect(res[0].relation).toBe('DISTRICT_CONVERTED');
			}
		});

		it('every mapping is reachable through the indexes', async () => {
			const all = await getWardMappingsData();
			for (const m of all) {
				const byNew = await getMappingsByNewCode(m.newWardCode);
				expect(byNew).toContain(m);
				if (m.oldWardCode) {
					expect(await getMappingsByOldCode(m.oldWardCode)).toContain(m);
				}
			}
		});

		it('every mapping points to an existing commune and province', async () => {
			const all = await getWardMappingsData();
			for (const m of all) {
				const commune = await getV3CommuneById(m.newWardCode);
				expect(commune).toBeDefined();
				expect(m.newWardName).toBe(commune!.name);
				if (m.newProvinceCode) {
					expect(m.newProvinceCode).toBe(commune!.idProvince);
				}
				const province = await getV3ProvinceById(commune!.idProvince);
				expect(m.newProvinceName).toBe(province!.name);
			}
		});

		it('only uses known relation types', async () => {
			const allowed = new Set([
				'UNCHANGED',
				'RENAMED',
				'MERGED',
				'PARTIAL',
				'DISTRICT_CONVERTED',
				'UNCODED_AREA',
			]);
			for (const m of await getWardMappingsData()) {
				expect(allowed.has(m.relation as string)).toBe(true);
			}
		});

		it('has no duplicate (oldWardCode, newWardCode) pairs', async () => {
			const seen = new Set<string>();
			for (const m of await getWardMappingsData()) {
				if (!m.oldWardCode) continue;
				const key = `${m.oldWardCode}>${m.newWardCode}`;
				expect(seen.has(key)).toBe(false);
				seen.add(key);
			}
		});
	});
});

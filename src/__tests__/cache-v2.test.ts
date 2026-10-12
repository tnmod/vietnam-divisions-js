import { describe, it, expect } from 'vitest';
import {
	loadProvinceData,
	loadDistrictData,
	loadCommuneData,
	getProvinceData,
	getDistrictData,
	getCommuneData,
	getProvinceById,
	getDistrictById,
	getCommuneById,
	getDistrictsByProvinceId,
	getCommunesByDistrictId,
	searchProvinces,
	searchDistricts,
	searchCommunes,
	isValidProvinceId,
} from '../cache';

describe('v2 Cache Module', () => {
	it('should load v2 datasets and support idempotent loading', async () => {
		await Promise.all([
			loadProvinceData(),
			loadProvinceData(),
			loadDistrictData(),
			loadDistrictData(),
			loadCommuneData(),
			loadCommuneData(),
		]);
		expect((await getProvinceData()).length).toBe(63);
		expect((await getDistrictData()).length).toBe(696);
		expect((await getCommuneData()).length).toBe(10051);
	});

	it('should lookup province, district, commune by id', async () => {
		const province = await getProvinceById('01');
		expect(province).toBeDefined();
		expect(province?.name).toBe('Thành phố Hà Nội');

		const district = await getDistrictById('001');
		expect(district).toBeDefined();
		expect(district?.name).toBe('Quận Ba Đình');

		const commune = await getCommuneById('00001');
		expect(commune).toBeDefined();
		expect(commune?.name).toBe('Phường Phúc Xá');

		expect(await getProvinceById('999')).toBeUndefined();
		expect(await getDistrictById('999')).toBeUndefined();
		expect(await getCommuneById('99999')).toBeUndefined();
	});

	it('should filter districts by province and communes by district', async () => {
		const districts = await getDistrictsByProvinceId('01');
		expect(districts.length).toBeGreaterThan(0);
		districts.forEach((d) => expect(d.idProvince).toBe('01'));

		const communes = await getCommunesByDistrictId('001');
		expect(communes.length).toBeGreaterThan(0);
		communes.forEach((c) => expect(c.idDistrict).toBe('001'));

		expect(await getDistrictsByProvinceId('999')).toEqual([]);
		expect(await getCommunesByDistrictId('999')).toEqual([]);
	});

	it('should search provinces, districts, and communes', async () => {
		const provinces = await searchProvinces('ha noi');
		expect(provinces.some((p) => p.idProvince === '01')).toBe(true);

		const districts = await searchDistricts('ba dinh');
		expect(districts.some((d) => d.idDistrict === '001')).toBe(true);

		const communes = await searchCommunes('phuc xa');
		expect(communes.some((c) => c.idCommune === '00001')).toBe(true);
	});

	it('should validate province id', async () => {
		expect(await isValidProvinceId('01')).toBe(true);
		expect(await isValidProvinceId('79')).toBe(true);
		expect(await isValidProvinceId('999')).toBe(false);
	});
});

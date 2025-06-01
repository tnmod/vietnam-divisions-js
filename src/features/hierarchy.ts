// Hierarchical data structures and navigation
import { 
	getProvinceData, 
	getDistrictsByProvinceId, 
	getCommunesByDistrictId,
	getProvinceById,
	getDistrictById,
	getCommuneById
} from '../cache';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface ProvinceWithDistricts extends Province {
	districts: District[];
}

export interface DistrictWithCommunes extends District {
	communes: Commune[];
}

export interface FullHierarchy extends Province {
	districts: DistrictWithCommunes[];
}

export interface AddressPath {
	province?: Province;
	district?: District;
	commune?: Commune;
}

/**
 * Get province with all its districts
 */
export const getProvinceWithDistricts = async (provinceId: string): Promise<ProvinceWithDistricts | null> => {
	const [province, districts] = await Promise.all([
		getProvinceById(provinceId),
		getDistrictsByProvinceId(provinceId)
	]);
	
	if (!province) return null;
	
	return {
		...province,
		districts
	};
};

/**
 * Get district with all its communes
 */
export const getDistrictWithCommunes = async (districtId: string): Promise<DistrictWithCommunes | null> => {
	const [district, communes] = await Promise.all([
		getDistrictById(districtId),
		getCommunesByDistrictId(districtId)
	]);
	
	if (!district) return null;
	
	return {
		...district,
		communes
	};
};

/**
 * Get full hierarchy for a province (province -> districts -> communes)
 */
export const getFullHierarchy = async (provinceId: string): Promise<FullHierarchy | null> => {
	const province = await getProvinceById(provinceId);
	if (!province) return null;
	
	const districts = await getDistrictsByProvinceId(provinceId);
	
	const districtsWithCommunes = await Promise.all(
		districts.map(async (district) => {
			const communes = await getCommunesByDistrictId(district.idDistrict);
			return {
				...district,
				communes
			};
		})
	);
	
	return {
		...province,
		districts: districtsWithCommunes
	};
};

/**
 * Get the full address path for a commune (commune -> district -> province)
 */
export const getAddressPath = async (communeId: string): Promise<AddressPath | null> => {
	const commune = await getCommuneById(communeId);
	if (!commune) return null;
	
	const district = await getDistrictById(commune.idDistrict);
	if (!district) return { commune };
	
	const province = await getProvinceById(district.idProvince);
	if (!province) return { commune, district };
	
	return {
		province,
		district,
		commune
	};
};

/**
 * Get formatted address string
 */
export const getFormattedAddress = async (
	communeId: string,
	format: 'full' | 'short' = 'full'
): Promise<string | null> => {
	const path = await getAddressPath(communeId);
	if (!path || !path.commune) return null;

	const parts: string[] = [];

	if (path.commune) parts.push(path.commune.name);
	if (path.district) parts.push(path.district.name);
	if (path.province) parts.push(path.province.name);

	if (format === 'short' && parts.length > 2) {
		// Return only commune and province for short format
		return `${parts[0]}, ${parts[parts.length - 1]}`;
	}

	return parts.join(', ');
};

/**
 * Get all provinces with their district counts
 */
export const getProvincesWithStats = async (): Promise<Array<Province & { districtCount: number }>> => {
	const provinces = await getProvinceData();
	
	const provincesWithStats = await Promise.all(
		provinces.map(async (province) => {
			const districts = await getDistrictsByProvinceId(province.idProvince);
			return {
				...province,
				districtCount: districts.length
			};
		})
	);
	
	return provincesWithStats;
};

/**
 * Get all districts with their commune counts
 */
export const getDistrictsWithStats = async (provinceId?: string): Promise<Array<District & { communeCount: number }>> => {
	const districts = provinceId 
		? await getDistrictsByProvinceId(provinceId)
		: await import('../cache').then(cache => cache.getDistrictData());
	
	const districtsWithStats = await Promise.all(
		districts.map(async (district) => {
			const communes = await getCommunesByDistrictId(district.idDistrict);
			return {
				...district,
				communeCount: communes.length
			};
		})
	);
	
	return districtsWithStats;
};

/**
 * Validate address hierarchy (check if commune belongs to district and district belongs to province)
 */
export const validateAddressHierarchy = async (
	provinceId: string,
	districtId: string,
	communeId: string
): Promise<boolean> => {
	const [district, commune] = await Promise.all([
		getDistrictById(districtId),
		getCommuneById(communeId)
	]);
	
	if (!district || !commune) return false;
	
	// Check if district belongs to province
	if (district.idProvince !== provinceId) return false;
	
	// Check if commune belongs to district
	if (commune.idDistrict !== districtId) return false;
	
	return true;
};

/**
 * Get neighboring districts (districts in the same province)
 */
export const getNeighboringDistricts = async (districtId: string): Promise<District[]> => {
	const district = await getDistrictById(districtId);
	if (!district) return [];
	
	const allDistricts = await getDistrictsByProvinceId(district.idProvince);
	return allDistricts.filter(d => d.idDistrict !== districtId);
};

// Batch operations for better performance when dealing with multiple items
import { 
	getProvinceById,
	getDistrictById,
	getCommuneById,
	getDistrictsByProvinceId,
	getCommunesByDistrictId,
	isValidProvinceId
} from '../cache';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface BatchResult<T> {
	success: T[];
	failed: string[];
}

/**
 * Get multiple provinces by IDs in a single batch operation
 */
export const getProvincesBatch = async (provinceIds: string[]): Promise<BatchResult<Province>> => {
	const results = await Promise.allSettled(
		provinceIds.map(id => getProvinceById(id))
	);
	
	const success: Province[] = [];
	const failed: string[] = [];
	
	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value) {
			success.push(result.value);
		} else {
			failed.push(provinceIds[index]);
		}
	});
	
	return { success, failed };
};

/**
 * Get multiple districts by IDs in a single batch operation
 */
export const getDistrictsBatch = async (districtIds: string[]): Promise<BatchResult<District>> => {
	const results = await Promise.allSettled(
		districtIds.map(id => getDistrictById(id))
	);
	
	const success: District[] = [];
	const failed: string[] = [];
	
	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value) {
			success.push(result.value);
		} else {
			failed.push(districtIds[index]);
		}
	});
	
	return { success, failed };
};

/**
 * Get multiple communes by IDs in a single batch operation
 */
export const getCommunesBatch = async (communeIds: string[]): Promise<BatchResult<Commune>> => {
	const results = await Promise.allSettled(
		communeIds.map(id => getCommuneById(id))
	);
	
	const success: Commune[] = [];
	const failed: string[] = [];
	
	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value) {
			success.push(result.value);
		} else {
			failed.push(communeIds[index]);
		}
	});
	
	return { success, failed };
};

/**
 * Get districts for multiple provinces in a single batch operation
 */
export const getDistrictsForProvincesBatch = async (
	provinceIds: string[]
): Promise<Record<string, District[]>> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (id) => ({
			provinceId: id,
			districts: await getDistrictsByProvinceId(id)
		}))
	);
	
	const output: Record<string, District[]> = {};
	
	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			output[result.value.provinceId] = result.value.districts;
		}
	});
	
	return output;
};

/**
 * Get communes for multiple districts in a single batch operation
 */
export const getCommunesForDistrictsBatch = async (
	districtIds: string[]
): Promise<Record<string, Commune[]>> => {
	const results = await Promise.allSettled(
		districtIds.map(async (id) => ({
			districtId: id,
			communes: await getCommunesByDistrictId(id)
		}))
	);
	
	const output: Record<string, Commune[]> = {};
	
	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			output[result.value.districtId] = result.value.communes;
		}
	});
	
	return output;
};

/**
 * Validate multiple province IDs in a single batch operation
 */
export const validateProvinceIdsBatch = async (
	provinceIds: string[]
): Promise<Record<string, boolean>> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (id) => ({
			id,
			isValid: await isValidProvinceId(id)
		}))
	);
	
	const output: Record<string, boolean> = {};
	
	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			output[result.value.id] = result.value.isValid;
		}
	});
	
	return output;
};

/**
 * Get full address information for multiple commune IDs
 */
export const getFullAddressesBatch = async (
	communeIds: string[]
): Promise<Array<{
	communeId: string;
	commune?: Commune;
	district?: District;
	province?: Province;
	fullAddress?: string;
}>> => {
	const results = await Promise.allSettled(
		communeIds.map(async (communeId) => {
			const commune = await getCommuneById(communeId);
			if (!commune) {
				return { communeId };
			}
			
			const district = await getDistrictById(commune.idDistrict);
			if (!district) {
				return { communeId, commune };
			}
			
			const province = await getProvinceById(district.idProvince);
			if (!province) {
				return { communeId, commune, district };
			}
			
			const fullAddress = `${commune.name}, ${district.name}, ${province.name}`;
			
			return {
				communeId,
				commune,
				district,
				province,
				fullAddress
			};
		})
	);
	
	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		}
		return { communeId: communeIds[index] };
	});
};

/**
 * Batch operation to get statistics for multiple provinces
 */
export const getProvinceStatsBatch = async (
	provinceIds: string[]
): Promise<Array<{
	province: Province;
	districtCount: number;
	communeCount: number;
}>> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (provinceId) => {
			const [province, districts] = await Promise.all([
				getProvinceById(provinceId),
				getDistrictsByProvinceId(provinceId)
			]);
			
			if (!province) throw new Error(`Province ${provinceId} not found`);
			
			const communeCounts = await Promise.all(
				districts.map(district => getCommunesByDistrictId(district.idDistrict))
			);
			
			const totalCommunes = communeCounts.reduce((sum, communes) => sum + communes.length, 0);
			
			return {
				province,
				districtCount: districts.length,
				communeCount: totalCommunes
			};
		})
	);
	
	return results
		.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
		.map(result => result.value);
};

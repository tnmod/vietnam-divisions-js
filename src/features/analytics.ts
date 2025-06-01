// Analytics and statistics features for Vietnam administrative data
import { 
	getProvinceData, 
	getDistrictData, 
	getCommuneData,
	getDistrictsByProvinceId,
	getCommunesByDistrictId
} from '../cache';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface ProvinceStats {
	province: Province;
	districtCount: number;
	communeCount: number;
	averageCommunesPerDistrict: number;
	largestDistrict: {
		district: District;
		communeCount: number;
	};
	smallestDistrict: {
		district: District;
		communeCount: number;
	};
}

export interface NationalStats {
	totalProvinces: number;
	totalDistricts: number;
	totalCommunes: number;
	averageDistrictsPerProvince: number;
	averageCommunesPerDistrict: number;
	largestProvince: {
		province: Province;
		districtCount: number;
		communeCount: number;
	};
	smallestProvince: {
		province: Province;
		districtCount: number;
		communeCount: number;
	};
}

export interface RegionStats {
	regionName: string;
	provinces: Province[];
	totalDistricts: number;
	totalCommunes: number;
	averageDistrictsPerProvince: number;
	averageCommunesPerDistrict: number;
}

/**
 * Get detailed statistics for a specific province
 */
export const getProvinceStats = async (provinceId: string): Promise<ProvinceStats | null> => {
	const [provinces, districts] = await Promise.all([
		getProvinceData(),
		getDistrictsByProvinceId(provinceId)
	]);
	
	const province = provinces.find(p => p.idProvince === provinceId);
	if (!province) return null;
	
	// Get commune counts for each district
	const districtStats = await Promise.all(
		districts.map(async (district) => {
			const communes = await getCommunesByDistrictId(district.idDistrict);
			return {
				district,
				communeCount: communes.length
			};
		})
	);
	
	const totalCommunes = districtStats.reduce((sum, stat) => sum + stat.communeCount, 0);
	const averageCommunesPerDistrict = districts.length > 0 ? totalCommunes / districts.length : 0;
	
	// Find largest and smallest districts
	const sortedByCommunes = districtStats.sort((a, b) => b.communeCount - a.communeCount);
	const largestDistrict = sortedByCommunes[0];
	const smallestDistrict = sortedByCommunes[sortedByCommunes.length - 1];
	
	return {
		province,
		districtCount: districts.length,
		communeCount: totalCommunes,
		averageCommunesPerDistrict: Math.round(averageCommunesPerDistrict * 100) / 100,
		largestDistrict,
		smallestDistrict
	};
};

/**
 * Get national statistics for all of Vietnam
 */
export const getNationalStats = async (): Promise<NationalStats> => {
	const [provinces, districts, communes] = await Promise.all([
		getProvinceData(),
		getDistrictData(),
		getCommuneData()
	]);
	
	// Calculate province statistics
	const provinceStats = await Promise.all(
		provinces.map(async (province) => {
			const provinceDistricts = await getDistrictsByProvinceId(province.idProvince);
			const communeCounts = await Promise.all(
				provinceDistricts.map(d => getCommunesByDistrictId(d.idDistrict))
			);
			const totalCommunes = communeCounts.reduce((sum, communes) => sum + communes.length, 0);
			
			return {
				province,
				districtCount: provinceDistricts.length,
				communeCount: totalCommunes
			};
		})
	);
	
	// Find largest and smallest provinces
	const sortedByDistricts = provinceStats.sort((a, b) => b.districtCount - a.districtCount);
	const largestProvince = sortedByDistricts[0];
	const smallestProvince = sortedByDistricts[sortedByDistricts.length - 1];
	
	const averageDistrictsPerProvince = districts.length / provinces.length;
	const averageCommunesPerDistrict = communes.length / districts.length;
	
	return {
		totalProvinces: provinces.length,
		totalDistricts: districts.length,
		totalCommunes: communes.length,
		averageDistrictsPerProvince: Math.round(averageDistrictsPerProvince * 100) / 100,
		averageCommunesPerDistrict: Math.round(averageCommunesPerDistrict * 100) / 100,
		largestProvince,
		smallestProvince
	};
};

/**
 * Get statistics by region (North, Central, South)
 */
export const getRegionStats = async (): Promise<RegionStats[]> => {
	const provinces = await getProvinceData();
	
	// Define regions based on province IDs (simplified classification)
	const regions = {
		'North': provinces.filter(p => parseInt(p.idProvince) <= 30),
		'Central': provinces.filter(p => parseInt(p.idProvince) > 30 && parseInt(p.idProvince) <= 70),
		'South': provinces.filter(p => parseInt(p.idProvince) > 70)
	};
	
	const regionStats = await Promise.all(
		Object.entries(regions).map(async ([regionName, regionProvinces]) => {
			let totalDistricts = 0;
			let totalCommunes = 0;
			
			for (const province of regionProvinces) {
				const districts = await getDistrictsByProvinceId(province.idProvince);
				totalDistricts += districts.length;
				
				for (const district of districts) {
					const communes = await getCommunesByDistrictId(district.idDistrict);
					totalCommunes += communes.length;
				}
			}
			
			const averageDistrictsPerProvince = regionProvinces.length > 0 ? totalDistricts / regionProvinces.length : 0;
			const averageCommunesPerDistrict = totalDistricts > 0 ? totalCommunes / totalDistricts : 0;
			
			return {
				regionName,
				provinces: regionProvinces,
				totalDistricts,
				totalCommunes,
				averageDistrictsPerProvince: Math.round(averageDistrictsPerProvince * 100) / 100,
				averageCommunesPerDistrict: Math.round(averageCommunesPerDistrict * 100) / 100
			};
		})
	);
	
	return regionStats;
};

/**
 * Get top N provinces by district count
 */
export const getTopProvincesByDistricts = async (limit: number = 10): Promise<Array<{
	province: Province;
	districtCount: number;
}>> => {
	const provinces = await getProvinceData();
	
	const provinceStats = await Promise.all(
		provinces.map(async (province) => {
			const districts = await getDistrictsByProvinceId(province.idProvince);
			return {
				province,
				districtCount: districts.length
			};
		})
	);
	
	return provinceStats
		.sort((a, b) => b.districtCount - a.districtCount)
		.slice(0, limit);
};

/**
 * Get top N provinces by commune count
 */
export const getTopProvincesByCommunes = async (limit: number = 10): Promise<Array<{
	province: Province;
	communeCount: number;
}>> => {
	const provinces = await getProvinceData();
	
	const provinceStats = await Promise.all(
		provinces.map(async (province) => {
			const districts = await getDistrictsByProvinceId(province.idProvince);
			let totalCommunes = 0;
			
			for (const district of districts) {
				const communes = await getCommunesByDistrictId(district.idDistrict);
				totalCommunes += communes.length;
			}
			
			return {
				province,
				communeCount: totalCommunes
			};
		})
	);
	
	return provinceStats
		.sort((a, b) => b.communeCount - a.communeCount)
		.slice(0, limit);
};

/**
 * Get distribution of districts per province
 */
export const getDistrictDistribution = async (): Promise<{
	min: number;
	max: number;
	average: number;
	median: number;
	distribution: Record<number, number>;
}> => {
	const provinces = await getProvinceData();
	
	const districtCounts = await Promise.all(
		provinces.map(async (province) => {
			const districts = await getDistrictsByProvinceId(province.idProvince);
			return districts.length;
		})
	);
	
	const sorted = districtCounts.sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const average = districtCounts.reduce((sum, count) => sum + count, 0) / districtCounts.length;
	const median = sorted.length % 2 === 0 
		? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
		: sorted[Math.floor(sorted.length / 2)];
	
	// Create distribution map
	const distribution: Record<number, number> = {};
	districtCounts.forEach(count => {
		distribution[count] = (distribution[count] || 0) + 1;
	});
	
	return {
		min,
		max,
		average: Math.round(average * 100) / 100,
		median,
		distribution
	};
};

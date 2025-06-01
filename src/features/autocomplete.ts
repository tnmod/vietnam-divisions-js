// Autocomplete functionality for better UX
import { 
	getProvinceData, 
	getDistrictData, 
	getCommuneData,
	loadProvinceData,
	loadDistrictData,
	loadCommuneData
} from '../cache';
import { normalizeText } from '../utils';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface AutocompleteResult {
	type: 'province' | 'district' | 'commune';
	id: string;
	name: string;
	parentName?: string;
	score: number;
}

/**
 * Get autocomplete suggestions for provinces
 */
export const getProvinceAutocomplete = async (
	query: string, 
	limit: number = 10
): Promise<AutocompleteResult[]> => {
	await loadProvinceData();
	const provinces = await getProvinceData();
	const normalizedQuery = normalizeText(query);
	
	const results: AutocompleteResult[] = [];
	
	for (const province of provinces) {
		const normalizedName = normalizeText(province.name);
		let score = 0;
		
		// Exact match gets highest score
		if (normalizedName === normalizedQuery) {
			score = 100;
		}
		// Starts with query gets high score
		else if (normalizedName.startsWith(normalizedQuery)) {
			score = 90 - (normalizedName.length - normalizedQuery.length);
		}
		// Contains query gets medium score
		else if (normalizedName.includes(normalizedQuery)) {
			score = 70 - (normalizedName.indexOf(normalizedQuery) * 2);
		}
		// Word starts with query gets lower score
		else {
			const words = normalizedName.split(/\s+/);
			for (const word of words) {
				if (word.startsWith(normalizedQuery)) {
					score = 50 - (word.length - normalizedQuery.length);
					break;
				}
			}
		}
		
		if (score > 0) {
			results.push({
				type: 'province',
				id: province.idProvince,
				name: province.name,
				score
			});
		}
	}
	
	return results
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
};

/**
 * Get autocomplete suggestions for districts
 */
export const getDistrictAutocomplete = async (
	query: string, 
	provinceId?: string,
	limit: number = 10
): Promise<AutocompleteResult[]> => {
	await loadDistrictData();
	await loadProvinceData();
	
	const districts = await getDistrictData();
	const provinces = await getProvinceData();
	const provinceMap = new Map(provinces.map(p => [p.idProvince, p.name]));
	
	const normalizedQuery = normalizeText(query);
	const results: AutocompleteResult[] = [];
	
	const filteredDistricts = provinceId 
		? districts.filter(d => d.idProvince === provinceId)
		: districts;
	
	for (const district of filteredDistricts) {
		const normalizedName = normalizeText(district.name);
		let score = 0;
		
		if (normalizedName === normalizedQuery) {
			score = 100;
		} else if (normalizedName.startsWith(normalizedQuery)) {
			score = 90 - (normalizedName.length - normalizedQuery.length);
		} else if (normalizedName.includes(normalizedQuery)) {
			score = 70 - (normalizedName.indexOf(normalizedQuery) * 2);
		} else {
			const words = normalizedName.split(/\s+/);
			for (const word of words) {
				if (word.startsWith(normalizedQuery)) {
					score = 50 - (word.length - normalizedQuery.length);
					break;
				}
			}
		}
		
		if (score > 0) {
			results.push({
				type: 'district',
				id: district.idDistrict,
				name: district.name,
				parentName: provinceMap.get(district.idProvince),
				score
			});
		}
	}
	
	return results
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
};

/**
 * Get autocomplete suggestions for communes
 */
export const getCommuneAutocomplete = async (
	query: string, 
	districtId?: string,
	limit: number = 10
): Promise<AutocompleteResult[]> => {
	await loadCommuneData();
	await loadDistrictData();
	
	const communes = await getCommuneData();
	const districts = await getDistrictData();
	const districtMap = new Map(districts.map(d => [d.idDistrict, d.name]));
	
	const normalizedQuery = normalizeText(query);
	const results: AutocompleteResult[] = [];
	
	const filteredCommunes = districtId 
		? communes.filter(c => c.idDistrict === districtId)
		: communes;
	
	for (const commune of filteredCommunes) {
		const normalizedName = normalizeText(commune.name);
		let score = 0;
		
		if (normalizedName === normalizedQuery) {
			score = 100;
		} else if (normalizedName.startsWith(normalizedQuery)) {
			score = 90 - (normalizedName.length - normalizedQuery.length);
		} else if (normalizedName.includes(normalizedQuery)) {
			score = 70 - (normalizedName.indexOf(normalizedQuery) * 2);
		} else {
			const words = normalizedName.split(/\s+/);
			for (const word of words) {
				if (word.startsWith(normalizedQuery)) {
					score = 50 - (word.length - normalizedQuery.length);
					break;
				}
			}
		}
		
		if (score > 0) {
			results.push({
				type: 'commune',
				id: commune.idCommune,
				name: commune.name,
				parentName: districtMap.get(commune.idDistrict),
				score
			});
		}
	}
	
	return results
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
};

/**
 * Universal autocomplete that searches across all types
 */
export const getUniversalAutocomplete = async (
	query: string,
	limit: number = 15
): Promise<AutocompleteResult[]> => {
	const [provinces, districts, communes] = await Promise.all([
		getProvinceAutocomplete(query, Math.ceil(limit / 3)),
		getDistrictAutocomplete(query, undefined, Math.ceil(limit / 3)),
		getCommuneAutocomplete(query, undefined, Math.ceil(limit / 3))
	]);
	
	const allResults = [...provinces, ...districts, ...communes];
	
	return allResults
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
};

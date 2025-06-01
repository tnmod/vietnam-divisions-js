// Centralized cache and index management for performance optimization
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';
import { 
	createSearchIndex, 
	createIdMap, 
	createHierarchicalMap,
	normalizeText 
} from '../utils';

// Lazy loading flags
let isProvinceDataLoaded = false;
let isDistrictDataLoaded = false;
let isCommuneDataLoaded = false;

// Data storage
let provinceData: Province[] = [];
let districtData: District[] = [];
let communeData: Commune[] = [];

// Index maps for fast lookup
let provinceIdMap: Map<string, Province>;
let districtIdMap: Map<string, District>;
let communeIdMap: Map<string, Commune>;

// Hierarchical maps
let districtsByProvinceMap: Map<string, District[]>;
let communesByDistrictMap: Map<string, Commune[]>;

// Search indexes
let provinceSearchIndex: Map<string, Province[]>;
let districtSearchIndex: Map<string, District[]>;
let communeSearchIndex: Map<string, Commune[]>;

/**
 * Lazy load province data and create indexes
 */
export const loadProvinceData = async (): Promise<void> => {
	if (isProvinceDataLoaded) return;
	
	const { provinceData: data } = await import('../seeds/vietnam');
	provinceData = data;
	
	// Create indexes
	provinceIdMap = createIdMap(provinceData, 'idProvince');
	provinceSearchIndex = createSearchIndex(provinceData);
	
	isProvinceDataLoaded = true;
};

/**
 * Lazy load district data and create indexes
 */
export const loadDistrictData = async (): Promise<void> => {
	if (isDistrictDataLoaded) return;
	
	const { districtData: data } = await import('../seeds/vietnam');
	districtData = data;
	
	// Create indexes
	districtIdMap = createIdMap(districtData, 'idDistrict');
	districtsByProvinceMap = createHierarchicalMap(districtData, 'idProvince');
	districtSearchIndex = createSearchIndex(districtData);
	
	isDistrictDataLoaded = true;
};

/**
 * Lazy load commune data and create indexes
 */
export const loadCommuneData = async (): Promise<void> => {
	if (isCommuneDataLoaded) return;
	
	const { communeData: data } = await import('../seeds/vietnam');
	communeData = data;
	
	// Create indexes
	communeIdMap = createIdMap(communeData, 'idCommune');
	communesByDistrictMap = createHierarchicalMap(communeData, 'idDistrict');
	communeSearchIndex = createSearchIndex(communeData);
	
	isCommuneDataLoaded = true;
};

/**
 * Get province data (with lazy loading)
 */
export const getProvinceData = async (): Promise<Province[]> => {
	await loadProvinceData();
	return provinceData;
};

/**
 * Get district data (with lazy loading)
 */
export const getDistrictData = async (): Promise<District[]> => {
	await loadDistrictData();
	return districtData;
};

/**
 * Get commune data (with lazy loading)
 */
export const getCommuneData = async (): Promise<Commune[]> => {
	await loadCommuneData();
	return communeData;
};

/**
 * Get province by ID (O(1) lookup)
 */
export const getProvinceById = async (id: string): Promise<Province | undefined> => {
	await loadProvinceData();
	return provinceIdMap.get(id);
};

/**
 * Get district by ID (O(1) lookup)
 */
export const getDistrictById = async (id: string): Promise<District | undefined> => {
	await loadDistrictData();
	return districtIdMap.get(id);
};

/**
 * Get commune by ID (O(1) lookup)
 */
export const getCommuneById = async (id: string): Promise<Commune | undefined> => {
	await loadCommuneData();
	return communeIdMap.get(id);
};

/**
 * Get districts by province ID (O(1) lookup)
 */
export const getDistrictsByProvinceId = async (provinceId: string): Promise<District[]> => {
	await loadDistrictData();
	return districtsByProvinceMap.get(provinceId) || [];
};

/**
 * Get communes by district ID (O(1) lookup)
 */
export const getCommunesByDistrictId = async (districtId: string): Promise<Commune[]> => {
	await loadCommuneData();
	return communesByDistrictMap.get(districtId) || [];
};

/**
 * Search provinces by name (using index)
 */
export const searchProvinces = async (query: string): Promise<Province[]> => {
	await loadProvinceData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Province>();
	
	// Exact and prefix matches
	for (const [key, provinces] of provinceSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			provinces.forEach(province => results.add(province));
		}
	}
	
	return Array.from(results);
};

/**
 * Search districts by name (using index)
 */
export const searchDistricts = async (query: string): Promise<District[]> => {
	await loadDistrictData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<District>();
	
	// Exact and prefix matches
	for (const [key, districts] of districtSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			districts.forEach(district => results.add(district));
		}
	}
	
	return Array.from(results);
};

/**
 * Search communes by name (using index)
 */
export const searchCommunes = async (query: string): Promise<Commune[]> => {
	await loadCommuneData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Commune>();
	
	// Exact and prefix matches
	for (const [key, communes] of communeSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			communes.forEach(commune => results.add(commune));
		}
	}
	
	return Array.from(results);
};

/**
 * Check if province ID is valid (O(1) lookup)
 */
export const isValidProvinceId = async (id: string): Promise<boolean> => {
	await loadProvinceData();
	return provinceIdMap.has(id);
};

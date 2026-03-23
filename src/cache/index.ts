import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';
import {
	createSearchIndex,
	createIdMap,
	createHierarchicalMap,
	normalizeText
} from '../utils';

let isProvinceDataLoaded = false;
let isDistrictDataLoaded = false;
let isCommuneDataLoaded = false;

let provinceData: Province[] = [];
let districtData: District[] = [];
let communeData: Commune[] = [];

let provinceIdMap: Map<string, Province>;
let districtIdMap: Map<string, District>;
let communeIdMap: Map<string, Commune>;

let districtsByProvinceMap: Map<string, District[]>;
let communesByDistrictMap: Map<string, Commune[]>;

let provinceSearchIndex: Map<string, Province[]>;
let districtSearchIndex: Map<string, District[]>;
let communeSearchIndex: Map<string, Commune[]>;

export const loadProvinceData = async (): Promise<void> => {
	if (isProvinceDataLoaded) return;

	const { provinceData: data } = await import('../seeds/vietnam');
	provinceData = data;
	provinceIdMap = createIdMap(provinceData, 'idProvince');
	provinceSearchIndex = createSearchIndex(provinceData);

	isProvinceDataLoaded = true;
};

export const loadDistrictData = async (): Promise<void> => {
	if (isDistrictDataLoaded) return;

	const { districtData: data } = await import('../seeds/vietnam');
	districtData = data;
	districtIdMap = createIdMap(districtData, 'idDistrict');
	districtsByProvinceMap = createHierarchicalMap(districtData, 'idProvince');
	districtSearchIndex = createSearchIndex(districtData);

	isDistrictDataLoaded = true;
};

export const loadCommuneData = async (): Promise<void> => {
	if (isCommuneDataLoaded) return;

	const { communeData: data } = await import('../seeds/vietnam');
	communeData = data;
	communeIdMap = createIdMap(communeData, 'idCommune');
	communesByDistrictMap = createHierarchicalMap(communeData, 'idDistrict');
	communeSearchIndex = createSearchIndex(communeData);

	isCommuneDataLoaded = true;
};

export const getProvinceData = async (): Promise<Province[]> => {
	await loadProvinceData();
	return provinceData;
};

export const getDistrictData = async (): Promise<District[]> => {
	await loadDistrictData();
	return districtData;
};

export const getCommuneData = async (): Promise<Commune[]> => {
	await loadCommuneData();
	return communeData;
};

export const getProvinceById = async (id: string): Promise<Province | undefined> => {
	await loadProvinceData();
	return provinceIdMap.get(id);
};

export const getDistrictById = async (id: string): Promise<District | undefined> => {
	await loadDistrictData();
	return districtIdMap.get(id);
};

export const getCommuneById = async (id: string): Promise<Commune | undefined> => {
	await loadCommuneData();
	return communeIdMap.get(id);
};

export const getDistrictsByProvinceId = async (provinceId: string): Promise<District[]> => {
	await loadDistrictData();
	return districtsByProvinceMap.get(provinceId) || [];
};

export const getCommunesByDistrictId = async (districtId: string): Promise<Commune[]> => {
	await loadCommuneData();
	return communesByDistrictMap.get(districtId) || [];
};

export const searchProvinces = async (query: string): Promise<Province[]> => {
	await loadProvinceData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Province>();
	for (const [key, provinces] of provinceSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			provinces.forEach(province => results.add(province));
		}
	}
	return Array.from(results);
};

export const searchDistricts = async (query: string): Promise<District[]> => {
	await loadDistrictData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<District>();
	for (const [key, districts] of districtSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			districts.forEach(district => results.add(district));
		}
	}
	return Array.from(results);
};

export const searchCommunes = async (query: string): Promise<Commune[]> => {
	await loadCommuneData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Commune>();
	for (const [key, communes] of communeSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			communes.forEach(commune => results.add(commune));
		}
	}
	return Array.from(results);
};

export const isValidProvinceId = async (id: string): Promise<boolean> => {
	await loadProvinceData();
	return provinceIdMap.has(id);
};

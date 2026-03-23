import { ProvinceV3, CommuneV3, WardMapping } from './types';
import {
	createSearchIndex,
	createIdMap,
	createHierarchicalMap,
	normalizeText,
} from '../utils';

let isProvinceLoaded = false;
let isCommuneLoaded = false;
let isWardMappingsLoaded = false;

let provinceData: ProvinceV3[] = [];
let communeData: CommuneV3[] = [];
let wardMappingsData: WardMapping[] = [];

let provinceIdMap: Map<string, ProvinceV3>;
let provinceCodeMap: Map<string, ProvinceV3>;
let communeIdMap: Map<string, CommuneV3>;
let communesByProvinceMap: Map<string, CommuneV3[]>;

let provinceSearchIndex: Map<string, ProvinceV3[]>;
let communeSearchIndex: Map<string, CommuneV3[]>;

let oldWardCodeMap: Map<string, WardMapping[]>;
let newWardCodeMap: Map<string, WardMapping[]>;

export const loadV3ProvinceData = async (): Promise<void> => {
	if (isProvinceLoaded) return;

	const { provinceData: data } = await import('../seeds/v3');
	provinceData = data as ProvinceV3[];

	provinceIdMap = createIdMap(provinceData, 'idProvince');
	provinceCodeMap = createIdMap(provinceData, 'code');
	provinceSearchIndex = createSearchIndex(provinceData);

	isProvinceLoaded = true;
};

export const loadV3CommuneData = async (): Promise<void> => {
	if (isCommuneLoaded) return;

	const { communeData: data } = await import('../seeds/v3');
	communeData = data as CommuneV3[];

	communeIdMap = createIdMap(communeData, 'idCommune');
	communesByProvinceMap = createHierarchicalMap(communeData, 'idProvince');
	communeSearchIndex = createSearchIndex(communeData);

	isCommuneLoaded = true;
};

export const loadWardMappings = async (): Promise<void> => {
	if (isWardMappingsLoaded) return;

	const { wardMappingsData: data } = await import('../seeds/v3');
	wardMappingsData = data as WardMapping[];

	oldWardCodeMap = new Map();
	newWardCodeMap = new Map();
	wardMappingsData.forEach((m) => {
		if (!oldWardCodeMap.has(m.oldWardCode)) {
			oldWardCodeMap.set(m.oldWardCode, []);
		}
		oldWardCodeMap.get(m.oldWardCode)!.push(m);

		if (!newWardCodeMap.has(m.newWardCode)) {
			newWardCodeMap.set(m.newWardCode, []);
		}
		newWardCodeMap.get(m.newWardCode)!.push(m);
	});

	isWardMappingsLoaded = true;
};

export const getV3ProvinceData = async (): Promise<ProvinceV3[]> => {
	await loadV3ProvinceData();
	return provinceData;
};

export const getV3ProvinceById = async (id: string): Promise<ProvinceV3 | undefined> => {
	await loadV3ProvinceData();
	return provinceIdMap.get(id);
};

export const getV3ProvinceByCode = async (code: string): Promise<ProvinceV3 | undefined> => {
	await loadV3ProvinceData();
	return provinceCodeMap.get(code.toUpperCase());
};

export const searchV3Provinces = async (query: string): Promise<ProvinceV3[]> => {
	await loadV3ProvinceData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<ProvinceV3>();
	for (const [key, provinces] of provinceSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			provinces.forEach((p) => results.add(p));
		}
	}
	return Array.from(results);
};

export const getV3CommuneData = async (): Promise<CommuneV3[]> => {
	await loadV3CommuneData();
	return communeData;
};

export const getV3CommuneById = async (id: string): Promise<CommuneV3 | undefined> => {
	await loadV3CommuneData();
	return communeIdMap.get(id);
};

export const getV3CommunesByProvinceId = async (provinceId: string): Promise<CommuneV3[]> => {
	await loadV3CommuneData();
	return communesByProvinceMap.get(provinceId) || [];
};

export const searchV3Communes = async (query: string): Promise<CommuneV3[]> => {
	await loadV3CommuneData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<CommuneV3>();
	for (const [key, communes] of communeSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			communes.forEach((c) => results.add(c));
		}
	}
	return Array.from(results);
};

export const getWardMappingsData = async (): Promise<WardMapping[]> => {
	await loadWardMappings();
	return wardMappingsData;
};

export const getMappingsByOldCode = async (oldCode: string): Promise<WardMapping[]> => {
	await loadWardMappings();
	return oldWardCodeMap.get(oldCode) || [];
};

export const getMappingsByNewCode = async (newCode: string): Promise<WardMapping[]> => {
	await loadWardMappings();
	return newWardCodeMap.get(newCode) || [];
};


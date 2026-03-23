import compare from 'natural-compare';
import { ProvinceV3, CommuneV3 } from './types';
import {
	getV3ProvinceData,
	getV3ProvinceById,
	getV3ProvinceByCode,
	searchV3Provinces,
	getV3CommuneData,
	getV3CommuneById,
	getV3CommunesByProvinceId,
	searchV3Communes,
} from './cache';

export const getAllProvinces = async (): Promise<ProvinceV3[]> => {
	return await getV3ProvinceData();
};

export const getAllProvincesSorted = async (): Promise<ProvinceV3[]> => {
	const data = await getV3ProvinceData();
	return [...data].sort((a, b) => compare(a.name, b.name));
};

export const getProvinceById = async (id: string): Promise<ProvinceV3 | undefined> => {
	return await getV3ProvinceById(id);
};

export const getProvinceByCode = async (code: string): Promise<ProvinceV3 | undefined> => {
	return await getV3ProvinceByCode(code);
};

export const isValidProvinceId = async (id: string): Promise<boolean> => {
	const province = await getV3ProvinceById(id);
	return province !== undefined;
};

export const searchProvinceByName = async (name: string): Promise<ProvinceV3[]> => {
	const results = await searchV3Provinces(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

export const getAllCommunes = async (): Promise<CommuneV3[]> => {
	return await getV3CommuneData();
};

export const getCommuneById = async (id: string): Promise<CommuneV3 | undefined> => {
	return await getV3CommuneById(id);
};

export const getCommunesByProvinceId = async (provinceId: string): Promise<CommuneV3[]> => {
	return await getV3CommunesByProvinceId(provinceId);
};

export const searchCommuneByName = async (name: string): Promise<CommuneV3[]> => {
	const results = await searchV3Communes(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

export type { ProvinceV3, CommuneV3, WardMapping } from './types';


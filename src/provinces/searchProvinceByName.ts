import { searchProvinces } from '../cache';
import compare from 'natural-compare';
import { Province } from './types';
import { memoize } from '../utils';

const _searchProvinceByName = async (name: string): Promise<Province[]> => {
	const results = await searchProvinces(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

// Memoize search results for better performance
export const searchProvinceByName = memoize(_searchProvinceByName);

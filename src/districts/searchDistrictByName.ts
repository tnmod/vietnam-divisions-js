import { searchDistricts } from '../cache';
import compare from 'natural-compare';
import { District } from './types';
import { memoize } from '../utils';

/**
 * Tìm quận/huyện theo tên (tìm kiếm tối ưu với index)
 */
const _searchDistrictByName = async (name: string): Promise<District[]> => {
	const results = await searchDistricts(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

// Memoize search results for better performance
export const searchDistrictByName = memoize(_searchDistrictByName);

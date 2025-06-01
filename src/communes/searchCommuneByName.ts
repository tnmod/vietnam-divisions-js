import { searchCommunes } from '../cache';
import compare from 'natural-compare';
import { Commune } from './types';
import { memoize } from '../utils';

/**
 * Tìm xã/phường theo tên (tìm kiếm tối ưu với index)
 */
const _searchCommuneByName = async (name: string): Promise<Commune[]> => {
	const results = await searchCommunes(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

// Memoize search results for better performance
export const searchCommuneByName = memoize(_searchCommuneByName);

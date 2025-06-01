import { getProvinceData } from '../cache';
import compare from 'natural-compare';
import { Province } from './types';
import { memoize } from '../utils';

const _getAllProvincesSorted = async (): Promise<Province[]> => {
	const provinces = await getProvinceData();
	return [...provinces].sort((a, b) => compare(a.name, b.name));
};

// Memoize the sorted result since it doesn't change often
export const getAllProvincesSorted = memoize(_getAllProvincesSorted);

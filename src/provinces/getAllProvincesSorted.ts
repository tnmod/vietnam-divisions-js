import { provinceData } from '../seeds/vietnam';
import compare from 'natural-compare';
import { Province } from './types';

export const getAllProvincesSorted = (): Province[] => {
	return [...provinceData].sort((a, b) => compare(a.name, b.name));
};

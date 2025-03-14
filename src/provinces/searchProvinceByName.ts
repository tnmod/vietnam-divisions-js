import { provinceData } from '../seeds/vietnam';
import similarity from 'similarity';
import removeAccents from 'remove-accents';
import compare from 'natural-compare';
import { Province } from './types';

export const searchProvinceByName = (name: string): Province[] => {
	return provinceData
		.filter(province => similarity(removeAccents(province.name), removeAccents(name.toLowerCase())) > 0.5)
		.sort((a, b) => compare(a.name, b.name));
};

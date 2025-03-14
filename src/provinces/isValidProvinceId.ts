import { provinceData } from '../seeds/vietnam';

export const isValidProvinceId = (provinceId: string): boolean => {
	return provinceData
		.some(prov => prov.idProvince === provinceId);
};

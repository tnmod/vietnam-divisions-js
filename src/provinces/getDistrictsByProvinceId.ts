import { districtData } from '../seeds/vietnam';
import { Province } from './types';

export const getDistrictsByProvinceId = (provinceId: string): Province[] => {
	return districtData.filter(prov => prov.idProvince === provinceId);
};

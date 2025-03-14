import { getAllProvince } from './getAllProvinces';
import { getAllProvincesSorted } from './getAllProvincesSorted';
import { getDistrictsByProvinceId } from './getDistrictsByProvinceId';
import { isValidProvinceId } from './isValidProvinceId';
import { searchProvinceByName } from './searchProvinceByName';
import { Province } from './types';

export type { Province };
export {
	getAllProvince,
	getAllProvincesSorted,
	getDistrictsByProvinceId,
	isValidProvinceId,
	searchProvinceByName,
};

import { getAllDistricts } from './getAllDistricts';
import { getDistrictById } from './getDistrictById';
import { getCommunesByDistrictId } from './getCommunesByDistrictId';
import { searchDistrictByName } from './searchDistrictByName';
import { District } from './types';

export type { District };
export {
	getAllDistricts,
	getDistrictById,
	getCommunesByDistrictId,
	searchDistrictByName,
};

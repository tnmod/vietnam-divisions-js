import { districtData } from '../seeds/vietnam';
import { Province } from '../provinces';

export const getAllDistricts = (): Province[] => {
	return districtData;
};

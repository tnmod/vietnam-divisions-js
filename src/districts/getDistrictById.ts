import { districtData } from '../seeds/vietnam';
import { District } from './types';

/**
 * Lấy thông tin một quận/huyện theo mã
 */
export const getDistrictById = (districtId: string): District | undefined => {
	return districtData.find(district => district.idDistrict === districtId);
};

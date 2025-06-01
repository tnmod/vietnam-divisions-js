import { getDistrictById as getCachedDistrict } from '../cache';
import { District } from './types';

/**
 * Lấy thông tin một quận/huyện theo mã (O(1) lookup)
 */
export const getDistrictById = async (districtId: string): Promise<District | undefined> => {
	return await getCachedDistrict(districtId);
};

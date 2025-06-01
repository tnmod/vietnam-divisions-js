import { getDistrictsByProvinceId as getCachedDistricts } from '../cache';
import { District } from '../districts/types';

export const getDistrictsByProvinceId = async (provinceId: string): Promise<District[]> => {
	return await getCachedDistricts(provinceId);
};

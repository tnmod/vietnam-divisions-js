import { isValidProvinceId as checkValidId } from '../cache';

export const isValidProvinceId = async (provinceId: string): Promise<boolean> => {
	return await checkValidId(provinceId);
};

import { getCommunesByDistrictId as getCachedCommunes } from '../cache';
import { Commune } from '../communes';

/**
 * Lấy danh sách xã/phường của một quận/huyện (O(1) lookup)
 */
export const getCommunesByDistrictId = async (districtId: string): Promise<Commune[]> => {
	return await getCachedCommunes(districtId);
};

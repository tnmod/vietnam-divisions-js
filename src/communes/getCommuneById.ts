import { getCommuneById as getCachedCommune } from '../cache';
import { Commune } from './types';

/**
 * Lấy thông tin một xã/phường theo mã (O(1) lookup)
 */
export const getCommuneById = async (communeId: string): Promise<Commune | undefined> => {
	return await getCachedCommune(communeId);
};

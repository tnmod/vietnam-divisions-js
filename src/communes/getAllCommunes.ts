import { getCommuneData } from '../cache';
import { Commune } from './types';

/**
 * Lấy danh sách tất cả xã/phường (lazy loading)
 */
export const getAllCommunes = async (): Promise<Commune[]> => {
	return await getCommuneData();
};

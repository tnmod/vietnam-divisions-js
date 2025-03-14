import { communeData } from '../seeds/vietnam';
import { Commune } from './types';

/**
 * Lấy danh sách tất cả xã/phường
 */
export const getAllCommunes = (): Commune[] => {
	return communeData;
};

import { communeData } from '../seeds/vietnam';
import { Commune } from './types';

/**
 * Lấy thông tin một xã/phường theo mã
 */
export const getCommuneById = (communeId: string): Commune | undefined => {
	return communeData.find(commune => commune.idCommune === communeId);
};

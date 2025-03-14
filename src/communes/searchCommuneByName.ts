import removeAccents from 'remove-accents';
import { communeData } from '../seeds/vietnam';
import { Commune } from './types';

/**
 * Tìm xã/phường theo tên (tìm kiếm gần đúng, bỏ dấu)
 */
export const searchCommuneByName = (name: string): Commune[] => {
	const normalizedInput = removeAccents(name.toLowerCase());
	return communeData.filter(commune =>
		removeAccents(commune.name.toLowerCase()).includes(normalizedInput),
	);
};

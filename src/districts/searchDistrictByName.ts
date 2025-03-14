import removeAccents from 'remove-accents';
import { districtData } from '../seeds/vietnam';
import { District } from './types';

/**
 * Tìm quận/huyện theo tên (tìm kiếm gần đúng, bỏ dấu)
 */
export const searchDistrictByName = (name: string): District[] => {
	const normalizedInput = removeAccents(name.toLowerCase());
	return districtData.filter(district =>
		removeAccents(district.name.toLowerCase()).includes(normalizedInput),
	);
};

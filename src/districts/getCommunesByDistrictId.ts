import { communeData } from '../seeds/vietnam';
import { Commune } from '../communes';


/**
 * Lấy danh sách xã/phường của một quận/huyện
 */
export const getCommunesByDistrictId = (districtId: string): Commune[] => {
	return communeData.filter(commune => commune.idDistrict === districtId);
};

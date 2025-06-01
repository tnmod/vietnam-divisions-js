import { getDistrictData } from '../cache';
import { District } from './types';

export const getAllDistricts = async (): Promise<District[]> => {
	return await getDistrictData();
};

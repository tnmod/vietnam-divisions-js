import { getProvinceData } from '../cache';
import { Province } from './types';

export const getAllProvince = async (): Promise<Province[]> => {
  return await getProvinceData();
};

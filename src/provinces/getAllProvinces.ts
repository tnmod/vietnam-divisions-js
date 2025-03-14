import {provinceData} from "../seeds/vietnam";
import { Province } from './types';

export const getAllProvince = ():Province[] => {
  return provinceData;
}

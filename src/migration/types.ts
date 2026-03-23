import { WardMapping } from '../v3/types';

export interface ProvinceMergeInfo {
	newProvinceId: string;
	newProvinceName: string;
	mergedFrom: {
		oldProvinceId: string;
		oldProvinceName: string;
	}[];
}

export interface MergedProvinceResult {
	oldProvinceId: string;
	oldProvinceName: string;
	newProvinceId: string;
	newProvinceName: string;
}

export interface BatchMigrateResult {
	oldWardCode: string;
	mappings: WardMapping[];
	status: 'mapped' | 'not_found';
}


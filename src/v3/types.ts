export interface ProvinceV3 {
	idProvince: string;
	name: string;
	shortName: string;
	code: string;
	placeType: string;
}

export interface CommuneV3 {
	idProvince: string;
	idCommune: string;
	name: string;
}

export type WardMappingRelation =
	| 'UNCHANGED'
	| 'RENAMED'
	| 'MERGED'
	| 'PARTIAL'
	| 'DISTRICT_CONVERTED'
	| 'UNCODED_AREA';

export interface WardMapping {
	oldWardCode: string | null;
	oldWardName: string | null;
	oldDistrictCode?: string | null;
	oldDistrictName?: string | null;
	oldProvinceCode?: string | null;
	oldProvinceName?: string | null;
	newWardCode: string;
	newWardName: string;
	newProvinceCode?: string | null;
	newProvinceName: string;
	relation?: WardMappingRelation;
	note?: string | null;
}

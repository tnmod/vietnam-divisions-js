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

export interface WardMapping {
	oldWardCode: string;
	oldWardName: string;
	oldDistrictName: string;
	oldProvinceName: string;
	newWardCode: string;
	newWardName: string;
	newProvinceName: string;
}


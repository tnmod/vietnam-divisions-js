interface Province {
    idProvince: string;
    name: string;
}

declare const getAllProvince: () => Province[];

declare const getAllProvincesSorted: () => Province[];

declare const getDistrictsByProvinceId: (provinceId: string) => Province[];

declare const isValidProvinceId: (provinceId: string) => boolean;

declare const searchProvinceByName: (name: string) => Province[];

type index$2_Province = Province;
declare const index$2_getAllProvince: typeof getAllProvince;
declare const index$2_getAllProvincesSorted: typeof getAllProvincesSorted;
declare const index$2_getDistrictsByProvinceId: typeof getDistrictsByProvinceId;
declare const index$2_isValidProvinceId: typeof isValidProvinceId;
declare const index$2_searchProvinceByName: typeof searchProvinceByName;
declare namespace index$2 {
  export { type index$2_Province as Province, index$2_getAllProvince as getAllProvince, index$2_getAllProvincesSorted as getAllProvincesSorted, index$2_getDistrictsByProvinceId as getDistrictsByProvinceId, index$2_isValidProvinceId as isValidProvinceId, index$2_searchProvinceByName as searchProvinceByName };
}

declare const getAllDistricts: () => Province[];

interface District {
    idProvince: string;
    idDistrict: string;
    name: string;
}

/**
 * Lấy thông tin một quận/huyện theo mã
 */
declare const getDistrictById: (districtId: string) => District | undefined;

interface Commune {
    idDistrict: string;
    idCommune: string;
    name: string;
}

/**
 * Lấy thông tin một xã/phường theo mã
 */
declare const getCommuneById: (communeId: string) => Commune | undefined;

/**
 * Tìm xã/phường theo tên (tìm kiếm gần đúng, bỏ dấu)
 */
declare const searchCommuneByName: (name: string) => Commune[];

/**
 * Lấy danh sách tất cả xã/phường
 */
declare const getAllCommunes: () => Commune[];

type index$1_Commune = Commune;
declare const index$1_getAllCommunes: typeof getAllCommunes;
declare const index$1_getCommuneById: typeof getCommuneById;
declare const index$1_searchCommuneByName: typeof searchCommuneByName;
declare namespace index$1 {
  export { type index$1_Commune as Commune, index$1_getAllCommunes as getAllCommunes, index$1_getCommuneById as getCommuneById, index$1_searchCommuneByName as searchCommuneByName };
}

/**
 * Lấy danh sách xã/phường của một quận/huyện
 */
declare const getCommunesByDistrictId: (districtId: string) => Commune[];

/**
 * Tìm quận/huyện theo tên (tìm kiếm gần đúng, bỏ dấu)
 */
declare const searchDistrictByName: (name: string) => District[];

type index_District = District;
declare const index_getAllDistricts: typeof getAllDistricts;
declare const index_getCommunesByDistrictId: typeof getCommunesByDistrictId;
declare const index_getDistrictById: typeof getDistrictById;
declare const index_searchDistrictByName: typeof searchDistrictByName;
declare namespace index {
  export { type index_District as District, index_getAllDistricts as getAllDistricts, index_getCommunesByDistrictId as getCommunesByDistrictId, index_getDistrictById as getDistrictById, index_searchDistrictByName as searchDistrictByName };
}

export { index$1 as Communes, index as Districts, index$2 as Provinces };

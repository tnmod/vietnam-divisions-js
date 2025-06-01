// Validation utilities for Vietnam administrative data
import { 
	getProvinceById,
	getDistrictById,
	getCommuneById,
	getDistrictsByProvinceId,
	getCommunesByDistrictId
} from '../cache';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	data?: {
		province?: Province;
		district?: District;
		commune?: Commune;
	};
}

export interface AddressValidationResult extends ValidationResult {
	hierarchy: {
		province?: Province;
		district?: District;
		commune?: Commune;
	};
	suggestions?: {
		provinces?: Province[];
		districts?: District[];
		communes?: Commune[];
	};
}

/**
 * Validate a province ID
 */
export const validateProvinceId = async (provinceId: string): Promise<ValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	// Basic format validation
	if (!provinceId || typeof provinceId !== 'string') {
		errors.push('Province ID must be a non-empty string');
		return { isValid: false, errors, warnings };
	}
	
	if (!/^\d{2}$/.test(provinceId)) {
		warnings.push('Province ID should be a 2-digit number (e.g., "01", "79")');
	}
	
	// Check if province exists
	const province = await getProvinceById(provinceId);
	if (!province) {
		errors.push(`Province with ID "${provinceId}" does not exist`);
		return { isValid: false, errors, warnings };
	}
	
	return {
		isValid: true,
		errors,
		warnings,
		data: { province }
	};
};

/**
 * Validate a district ID
 */
export const validateDistrictId = async (districtId: string): Promise<ValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	// Basic format validation
	if (!districtId || typeof districtId !== 'string') {
		errors.push('District ID must be a non-empty string');
		return { isValid: false, errors, warnings };
	}
	
	if (!/^\d{3}$/.test(districtId)) {
		warnings.push('District ID should be a 3-digit number (e.g., "001", "250")');
	}
	
	// Check if district exists
	const district = await getDistrictById(districtId);
	if (!district) {
		errors.push(`District with ID "${districtId}" does not exist`);
		return { isValid: false, errors, warnings };
	}
	
	return {
		isValid: true,
		errors,
		warnings,
		data: { district }
	};
};

/**
 * Validate a commune ID
 */
export const validateCommuneId = async (communeId: string): Promise<ValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	// Basic format validation
	if (!communeId || typeof communeId !== 'string') {
		errors.push('Commune ID must be a non-empty string');
		return { isValid: false, errors, warnings };
	}
	
	if (!/^\d{5}$/.test(communeId)) {
		warnings.push('Commune ID should be a 5-digit number (e.g., "00001", "00250")');
	}
	
	// Check if commune exists
	const commune = await getCommuneById(communeId);
	if (!commune) {
		errors.push(`Commune with ID "${communeId}" does not exist`);
		return { isValid: false, errors, warnings };
	}
	
	return {
		isValid: true,
		errors,
		warnings,
		data: { commune }
	};
};

/**
 * Validate the hierarchical relationship between province, district, and commune
 */
export const validateAddressHierarchy = async (
	provinceId: string,
	districtId: string,
	communeId: string
): Promise<AddressValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const hierarchy: AddressValidationResult['hierarchy'] = {};
	
	// Validate each level individually
	const [provinceResult, districtResult, communeResult] = await Promise.all([
		validateProvinceId(provinceId),
		validateDistrictId(districtId),
		validateCommuneId(communeId)
	]);
	
	// Collect individual validation errors
	errors.push(...provinceResult.errors, ...districtResult.errors, ...communeResult.errors);
	warnings.push(...provinceResult.warnings, ...districtResult.warnings, ...communeResult.warnings);
	
	// If any individual validation failed, return early
	if (!provinceResult.isValid || !districtResult.isValid || !communeResult.isValid) {
		return { isValid: false, errors, warnings, hierarchy };
	}
	
	const province = provinceResult.data!.province!;
	const district = districtResult.data!.district!;
	const commune = communeResult.data!.commune!;
	
	hierarchy.province = province;
	hierarchy.district = district;
	hierarchy.commune = commune;
	
	// Validate hierarchical relationships
	if (district.idProvince !== provinceId) {
		errors.push(`District "${district.name}" (${districtId}) does not belong to province "${province.name}" (${provinceId})`);
	}
	
	if (commune.idDistrict !== districtId) {
		errors.push(`Commune "${commune.name}" (${communeId}) does not belong to district "${district.name}" (${districtId})`);
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		hierarchy
	};
};

/**
 * Validate and suggest corrections for partial address data
 */
export const validateAndSuggestAddress = async (
	provinceId?: string,
	districtId?: string,
	communeId?: string
): Promise<AddressValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const hierarchy: AddressValidationResult['hierarchy'] = {};
	const suggestions: AddressValidationResult['suggestions'] = {};
	
	// If commune is provided, validate the full hierarchy
	if (communeId) {
		if (!districtId || !provinceId) {
			warnings.push('When commune ID is provided, district and province IDs should also be provided for complete validation');
		}
		
		const commune = await getCommuneById(communeId);
		if (commune) {
			hierarchy.commune = commune;
			
			// Auto-detect district if not provided
			if (!districtId) {
				const autoDistrict = await getDistrictById(commune.idDistrict);
				if (autoDistrict) {
					hierarchy.district = autoDistrict;
					warnings.push(`Auto-detected district: ${autoDistrict.name} (${autoDistrict.idDistrict})`);
				}
			}
			
			// Auto-detect province if not provided
			if (!provinceId && hierarchy.district) {
				const autoProvince = await getProvinceById(hierarchy.district.idProvince);
				if (autoProvince) {
					hierarchy.province = autoProvince;
					warnings.push(`Auto-detected province: ${autoProvince.name} (${autoProvince.idProvince})`);
				}
			}
		} else {
			errors.push(`Commune with ID "${communeId}" does not exist`);
		}
	}
	
	// If district is provided, validate and suggest communes
	if (districtId) {
		const district = await getDistrictById(districtId);
		if (district) {
			if (!hierarchy.district) hierarchy.district = district;
			
			// Auto-detect province if not provided
			if (!provinceId) {
				const autoProvince = await getProvinceById(district.idProvince);
				if (autoProvince) {
					hierarchy.province = autoProvince;
					warnings.push(`Auto-detected province: ${autoProvince.name} (${autoProvince.idProvince})`);
				}
			}
			
			// Suggest communes in this district
			const communes = await getCommunesByDistrictId(districtId);
			if (communes.length > 0) {
				suggestions.communes = communes.slice(0, 10); // Limit to 10 suggestions
			}
		} else {
			errors.push(`District with ID "${districtId}" does not exist`);
		}
	}
	
	// If province is provided, validate and suggest districts
	if (provinceId) {
		const province = await getProvinceById(provinceId);
		if (province) {
			if (!hierarchy.province) hierarchy.province = province;
			
			// Suggest districts in this province
			const districts = await getDistrictsByProvinceId(provinceId);
			if (districts.length > 0) {
				suggestions.districts = districts.slice(0, 10); // Limit to 10 suggestions
			}
		} else {
			errors.push(`Province with ID "${provinceId}" does not exist`);
		}
	}
	
	// Cross-validate hierarchy if multiple levels are provided
	if (provinceId && districtId && hierarchy.province && hierarchy.district) {
		if (hierarchy.district.idProvince !== provinceId) {
			errors.push(`District "${hierarchy.district.name}" does not belong to province "${hierarchy.province.name}"`);
		}
	}
	
	if (districtId && communeId && hierarchy.district && hierarchy.commune) {
		if (hierarchy.commune.idDistrict !== districtId) {
			errors.push(`Commune "${hierarchy.commune.name}" does not belong to district "${hierarchy.district.name}"`);
		}
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		hierarchy,
		suggestions
	};
};

/**
 * Batch validate multiple addresses
 */
export const batchValidateAddresses = async (
	addresses: Array<{
		provinceId?: string;
		districtId?: string;
		communeId?: string;
	}>
): Promise<AddressValidationResult[]> => {
	return Promise.all(
		addresses.map(({ provinceId, districtId, communeId }) =>
			validateAndSuggestAddress(provinceId, districtId, communeId)
		)
	);
};

/**
 * Validate address format patterns
 */
export const validateAddressFormat = (address: {
	provinceId?: string;
	districtId?: string;
	communeId?: string;
}): ValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];
	
	// Validate ID formats
	if (address.provinceId && !/^\d{2}$/.test(address.provinceId)) {
		errors.push('Province ID must be a 2-digit number');
	}
	
	if (address.districtId && !/^\d{3}$/.test(address.districtId)) {
		errors.push('District ID must be a 3-digit number');
	}
	
	if (address.communeId && !/^\d{5}$/.test(address.communeId)) {
		errors.push('Commune ID must be a 5-digit number');
	}
	
	// Check for logical consistency in ID patterns
	if (address.communeId && address.districtId) {
		// In some cases, commune IDs might start with district ID pattern
		// This is a heuristic check and might not be 100% accurate
		if (!address.communeId.startsWith(address.districtId.substring(0, 2))) {
			warnings.push('Commune ID pattern might not match district ID pattern');
		}
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
};

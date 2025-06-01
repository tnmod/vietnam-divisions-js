// Export utilities for Vietnam administrative data
import { 
	getProvinceData, 
	getDistrictData, 
	getCommuneData,
	getDistrictsByProvinceId,
	getCommunesByDistrictId
} from '../cache';
import { Province } from '../provinces/types';
import { District } from '../districts/types';
import { Commune } from '../communes/types';

export interface ExportOptions {
	format: 'json' | 'csv' | 'xml' | 'sql';
	includeHierarchy?: boolean;
	filterByProvince?: string[];
	filterByDistrict?: string[];
	customFields?: string[];
	tableName?: string; // For SQL export
}

export interface FlattenedAddress {
	provinceId: string;
	provinceName: string;
	districtId: string;
	districtName: string;
	communeId: string;
	communeName: string;
}

/**
 * Export provinces data in various formats
 */
export const exportProvinces = async (options: ExportOptions): Promise<string> => {
	const provinces = await getProvinceData();
	
	switch (options.format) {
		case 'json':
			return JSON.stringify(provinces, null, 2);
		
		case 'csv':
			return exportProvincesToCSV(provinces);
		
		case 'xml':
			return exportProvincesToXML(provinces);
		
		case 'sql':
			return exportProvincesToSQL(provinces, options.tableName || 'provinces');
		
		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export districts data in various formats
 */
export const exportDistricts = async (options: ExportOptions): Promise<string> => {
	let districts = await getDistrictData();
	
	// Filter by provinces if specified
	if (options.filterByProvince && options.filterByProvince.length > 0) {
		districts = districts.filter(d => options.filterByProvince!.includes(d.idProvince));
	}
	
	switch (options.format) {
		case 'json':
			return JSON.stringify(districts, null, 2);
		
		case 'csv':
			return exportDistrictsToCSV(districts);
		
		case 'xml':
			return exportDistrictsToXML(districts);
		
		case 'sql':
			return exportDistrictsToSQL(districts, options.tableName || 'districts');
		
		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export communes data in various formats
 */
export const exportCommunes = async (options: ExportOptions): Promise<string> => {
	let communes = await getCommuneData();
	
	// Filter by districts if specified
	if (options.filterByDistrict && options.filterByDistrict.length > 0) {
		communes = communes.filter(c => options.filterByDistrict!.includes(c.idDistrict));
	}
	
	switch (options.format) {
		case 'json':
			return JSON.stringify(communes, null, 2);
		
		case 'csv':
			return exportCommunesToCSV(communes);
		
		case 'xml':
			return exportCommunesToXML(communes);
		
		case 'sql':
			return exportCommunesToSQL(communes, options.tableName || 'communes');
		
		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export flattened address data with full hierarchy
 */
export const exportFlattenedAddresses = async (options: ExportOptions): Promise<string> => {
	const [provinces, districts, communes] = await Promise.all([
		getProvinceData(),
		getDistrictData(),
		getCommuneData()
	]);
	
	// Create lookup maps for performance
	const provinceMap = new Map(provinces.map(p => [p.idProvince, p]));
	const districtMap = new Map(districts.map(d => [d.idDistrict, d]));
	
	const flattenedData: FlattenedAddress[] = communes.map(commune => {
		const district = districtMap.get(commune.idDistrict);
		const province = district ? provinceMap.get(district.idProvince) : undefined;
		
		return {
			provinceId: province?.idProvince || '',
			provinceName: province?.name || '',
			districtId: district?.idDistrict || '',
			districtName: district?.name || '',
			communeId: commune.idCommune,
			communeName: commune.name
		};
	});
	
	// Apply filters
	let filteredData = flattenedData;
	if (options.filterByProvince && options.filterByProvince.length > 0) {
		filteredData = filteredData.filter(item => options.filterByProvince!.includes(item.provinceId));
	}
	
	switch (options.format) {
		case 'json':
			return JSON.stringify(filteredData, null, 2);
		
		case 'csv':
			return exportFlattenedToCSV(filteredData);
		
		case 'xml':
			return exportFlattenedToXML(filteredData);
		
		case 'sql':
			return exportFlattenedToSQL(filteredData, options.tableName || 'addresses');
		
		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export hierarchical data for specific provinces
 */
export const exportHierarchicalData = async (
	provinceIds: string[],
	options: ExportOptions
): Promise<string> => {
	const hierarchicalData = await Promise.all(
		provinceIds.map(async (provinceId) => {
			const [provinces, districts] = await Promise.all([
				getProvinceData(),
				getDistrictsByProvinceId(provinceId)
			]);
			
			const province = provinces.find(p => p.idProvince === provinceId);
			if (!province) return null;
			
			const districtsWithCommunes = await Promise.all(
				districts.map(async (district) => {
					const communes = await getCommunesByDistrictId(district.idDistrict);
					return {
						...district,
						communes
					};
				})
			);
			
			return {
				...province,
				districts: districtsWithCommunes
			};
		})
	);
	
	const validData = hierarchicalData.filter(Boolean);
	
	switch (options.format) {
		case 'json':
			return JSON.stringify(validData, null, 2);
		
		case 'xml':
			return exportHierarchicalToXML(validData);
		
		default:
			throw new Error(`Format ${options.format} is not supported for hierarchical data`);
	}
};

// Helper functions for CSV export
function exportProvincesToCSV(provinces: Province[]): string {
	const headers = ['idProvince', 'name'];
	const rows = provinces.map(p => [p.idProvince, `"${p.name}"`]);
	return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function exportDistrictsToCSV(districts: District[]): string {
	const headers = ['idProvince', 'idDistrict', 'name'];
	const rows = districts.map(d => [d.idProvince, d.idDistrict, `"${d.name}"`]);
	return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function exportCommunesToCSV(communes: Commune[]): string {
	const headers = ['idDistrict', 'idCommune', 'name'];
	const rows = communes.map(c => [c.idDistrict, c.idCommune, `"${c.name}"`]);
	return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function exportFlattenedToCSV(data: FlattenedAddress[]): string {
	const headers = ['provinceId', 'provinceName', 'districtId', 'districtName', 'communeId', 'communeName'];
	const rows = data.map(item => [
		item.provinceId,
		`"${item.provinceName}"`,
		item.districtId,
		`"${item.districtName}"`,
		item.communeId,
		`"${item.communeName}"`
	]);
	return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Helper functions for XML export
function exportProvincesToXML(provinces: Province[]): string {
	const items = provinces.map(p => 
		`  <province>\n    <idProvince>${p.idProvince}</idProvince>\n    <name><![CDATA[${p.name}]]></name>\n  </province>`
	).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<provinces>\n${items}\n</provinces>`;
}

function exportDistrictsToXML(districts: District[]): string {
	const items = districts.map(d => 
		`  <district>\n    <idProvince>${d.idProvince}</idProvince>\n    <idDistrict>${d.idDistrict}</idDistrict>\n    <name><![CDATA[${d.name}]]></name>\n  </district>`
	).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<districts>\n${items}\n</districts>`;
}

function exportCommunesToXML(communes: Commune[]): string {
	const items = communes.map(c => 
		`  <commune>\n    <idDistrict>${c.idDistrict}</idDistrict>\n    <idCommune>${c.idCommune}</idCommune>\n    <name><![CDATA[${c.name}]]></name>\n  </commune>`
	).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<communes>\n${items}\n</communes>`;
}

function exportFlattenedToXML(data: FlattenedAddress[]): string {
	const items = data.map(item => 
		`  <address>\n    <provinceId>${item.provinceId}</provinceId>\n    <provinceName><![CDATA[${item.provinceName}]]></provinceName>\n    <districtId>${item.districtId}</districtId>\n    <districtName><![CDATA[${item.districtName}]]></districtName>\n    <communeId>${item.communeId}</communeId>\n    <communeName><![CDATA[${item.communeName}]]></communeName>\n  </address>`
	).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<addresses>\n${items}\n</addresses>`;
}

function exportHierarchicalToXML(data: any[]): string {
	const items = data.map(province => {
		const districts = province.districts.map((district: any) => {
			const communes = district.communes.map((commune: any) => 
				`      <commune>\n        <idCommune>${commune.idCommune}</idCommune>\n        <name><![CDATA[${commune.name}]]></name>\n      </commune>`
			).join('\n');
			return `    <district>\n      <idDistrict>${district.idDistrict}</idDistrict>\n      <name><![CDATA[${district.name}]]></name>\n      <communes>\n${communes}\n      </communes>\n    </district>`;
		}).join('\n');
		return `  <province>\n    <idProvince>${province.idProvince}</idProvince>\n    <name><![CDATA[${province.name}]]></name>\n    <districts>\n${districts}\n    </districts>\n  </province>`;
	}).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<hierarchy>\n${items}\n</hierarchy>`;
}

// Helper functions for SQL export
function exportProvincesToSQL(provinces: Province[], tableName: string): string {
	const values = provinces.map(p => `('${p.idProvince}', '${p.name.replace(/'/g, "''")}')`).join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  idProvince VARCHAR(2) PRIMARY KEY,\n  name NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (idProvince, name) VALUES\n  ${values};`;
}

function exportDistrictsToSQL(districts: District[], tableName: string): string {
	const values = districts.map(d => `('${d.idProvince}', '${d.idDistrict}', '${d.name.replace(/'/g, "''")}')`).join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  idProvince VARCHAR(2) NOT NULL,\n  idDistrict VARCHAR(3) PRIMARY KEY,\n  name NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (idProvince, idDistrict, name) VALUES\n  ${values};`;
}

function exportCommunesToSQL(communes: Commune[], tableName: string): string {
	const values = communes.map(c => `('${c.idDistrict}', '${c.idCommune}', '${c.name.replace(/'/g, "''")}')`).join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  idDistrict VARCHAR(3) NOT NULL,\n  idCommune VARCHAR(5) PRIMARY KEY,\n  name NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (idDistrict, idCommune, name) VALUES\n  ${values};`;
}

function exportFlattenedToSQL(data: FlattenedAddress[], tableName: string): string {
	const values = data.map(item => 
		`('${item.provinceId}', '${item.provinceName.replace(/'/g, "''")}', '${item.districtId}', '${item.districtName.replace(/'/g, "''")}', '${item.communeId}', '${item.communeName.replace(/'/g, "''")}')`
	).join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  provinceId VARCHAR(2) NOT NULL,\n  provinceName NVARCHAR(255) NOT NULL,\n  districtId VARCHAR(3) NOT NULL,\n  districtName NVARCHAR(255) NOT NULL,\n  communeId VARCHAR(5) PRIMARY KEY,\n  communeName NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (provinceId, provinceName, districtId, districtName, communeId, communeName) VALUES\n  ${values};`;
}

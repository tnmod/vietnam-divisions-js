import { WardMapping } from '../v3/types';
import {
	getWardMappingsData,
	getMappingsByOldCode,
	getMappingsByNewCode,
} from '../v3/cache';
import {
	ProvinceMergeInfo,
	MergedProvinceResult,
	BatchMigrateResult,
} from './types';

let provinceMerges: ProvinceMergeInfo[] | null = null;
let oldToNewProvinceMap: Map<string, MergedProvinceResult> | null = null;

const loadProvinceMerges = async (): Promise<void> => {
	if (provinceMerges !== null) return;

	const { provinceMergesData } = await import('../seeds/v3');
	provinceMerges = provinceMergesData as ProvinceMergeInfo[];

	oldToNewProvinceMap = new Map();
	provinceMerges.forEach((merge) => {
		merge.mergedFrom.forEach((old) => {
			oldToNewProvinceMap!.set(old.oldProvinceId, {
				oldProvinceId: old.oldProvinceId,
				oldProvinceName: old.oldProvinceName,
				newProvinceId: merge.newProvinceId,
				newProvinceName: merge.newProvinceName,
			});
		});
	});
};

export const migrateWardCode = async (oldWardCode: string): Promise<WardMapping[]> => {
	return await getMappingsByOldCode(oldWardCode);
};

export const reverseMigrateWardCode = async (newWardCode: string): Promise<WardMapping[]> => {
	return await getMappingsByNewCode(newWardCode);
};

export const batchMigrateWardCodes = async (
	oldWardCodes: string[]
): Promise<BatchMigrateResult[]> => {
	const results: BatchMigrateResult[] = [];
	for (const code of oldWardCodes) {
		const mappings = await getMappingsByOldCode(code);
		results.push({
			oldWardCode: code,
			mappings,
			status: mappings.length > 0 ? 'mapped' : 'not_found',
		});
	}
	return results;
};

export const getWardMappings = async (): Promise<WardMapping[]> => {
	return await getWardMappingsData();
};

export const getMergedProvince = async (
	oldProvinceId: string
): Promise<MergedProvinceResult | undefined> => {
	await loadProvinceMerges();
	return oldToNewProvinceMap!.get(oldProvinceId);
};

export const getAllMergedProvinces = async (): Promise<ProvinceMergeInfo[]> => {
	await loadProvinceMerges();
	return provinceMerges!;
};

export const isProvinceMerged = async (oldProvinceId: string): Promise<boolean> => {
	await loadProvinceMerges();
	return oldToNewProvinceMap!.has(oldProvinceId);
};

export type {
	ProvinceMergeInfo,
	MergedProvinceResult,
	BatchMigrateResult,
} from './types';
export type { WardMapping } from '../v3/types';

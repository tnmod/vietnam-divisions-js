import { describe, it, expect } from 'vitest';
import {
	getProvinceStats,
	getNationalStats,
	getRegionStats,
	getTopProvincesByDistricts,
	getTopProvincesByCommunes,
	getDistrictDistribution
} from '../features/analytics';
import {
	validateProvinceId,
	validateDistrictId,
	validateCommuneId,
	validateAddressHierarchy,
	validateAndSuggestAddress,
	batchValidateAddresses,
	validateAddressFormat
} from '../features/validation';
import {
	exportProvinces,
	exportDistricts,
	exportCommunes,
	exportFlattenedAddresses,
	exportHierarchicalData
} from '../features/export';
import {
	fuzzySearchProvinces,
	fuzzySearchDistricts,
	fuzzySearchCommunes,
	universalFuzzySearch,
	findSimilarNames,
	suggestCorrections
} from '../features/fuzzy';

describe('Advanced Features Tests', () => {
	describe('Analytics Features', () => {
		it('should get province statistics', async () => {
			const stats = await getProvinceStats('01'); // Hanoi
			
			expect(stats).toBeDefined();
			expect(stats?.province.name).toContain('Hà Nội');
			expect(stats?.districtCount).toBeGreaterThan(0);
			expect(stats?.communeCount).toBeGreaterThan(0);
			expect(stats?.averageCommunesPerDistrict).toBeGreaterThan(0);
			expect(stats?.largestDistrict).toBeDefined();
			expect(stats?.smallestDistrict).toBeDefined();
		});

		it('should get national statistics', async () => {
			const stats = await getNationalStats();
			
			expect(stats).toBeDefined();
			expect(stats.totalProvinces).toBe(63);
			expect(stats.totalDistricts).toBeGreaterThan(600);
			expect(stats.totalCommunes).toBeGreaterThan(10000);
			expect(stats.averageDistrictsPerProvince).toBeGreaterThan(0);
			expect(stats.averageCommunesPerDistrict).toBeGreaterThan(0);
			expect(stats.largestProvince).toBeDefined();
			expect(stats.smallestProvince).toBeDefined();
		});

		it('should get region statistics', async () => {
			const regionStats = await getRegionStats();
			
			expect(regionStats).toBeDefined();
			expect(regionStats.length).toBe(3); // North, Central, South
			
			const regions = regionStats.map(r => r.regionName);
			expect(regions).toContain('North');
			expect(regions).toContain('Central');
			expect(regions).toContain('South');
			
			regionStats.forEach(region => {
				expect(region.provinces.length).toBeGreaterThan(0);
				expect(region.totalDistricts).toBeGreaterThan(0);
				expect(region.totalCommunes).toBeGreaterThan(0);
			});
		});

		it('should get top provinces by districts', async () => {
			const topProvinces = await getTopProvincesByDistricts(5);
			
			expect(topProvinces).toBeDefined();
			expect(topProvinces.length).toBe(5);
			
			// Should be sorted by district count (descending)
			for (let i = 1; i < topProvinces.length; i++) {
				expect(topProvinces[i].districtCount).toBeLessThanOrEqual(topProvinces[i-1].districtCount);
			}
		});

		it('should get district distribution', async () => {
			const distribution = await getDistrictDistribution();
			
			expect(distribution).toBeDefined();
			expect(distribution.min).toBeGreaterThan(0);
			expect(distribution.max).toBeGreaterThan(distribution.min);
			expect(distribution.average).toBeGreaterThan(0);
			expect(distribution.median).toBeGreaterThan(0);
			expect(Object.keys(distribution.distribution).length).toBeGreaterThan(0);
		});
	});

	describe('Validation Features', () => {
		it('should validate province ID', async () => {
			const validResult = await validateProvinceId('01');
			expect(validResult.isValid).toBe(true);
			expect(validResult.errors.length).toBe(0);
			expect(validResult.data?.province).toBeDefined();
			
			const invalidResult = await validateProvinceId('99');
			expect(invalidResult.isValid).toBe(false);
			expect(invalidResult.errors.length).toBeGreaterThan(0);
		});

		it('should validate district ID', async () => {
			const validResult = await validateDistrictId('001');
			expect(validResult.isValid).toBe(true);
			expect(validResult.errors.length).toBe(0);
			expect(validResult.data?.district).toBeDefined();
			
			const invalidResult = await validateDistrictId('999');
			expect(invalidResult.isValid).toBe(false);
			expect(invalidResult.errors.length).toBeGreaterThan(0);
		});

		it('should validate commune ID', async () => {
			const validResult = await validateCommuneId('00001');
			expect(validResult.isValid).toBe(true);
			expect(validResult.errors.length).toBe(0);
			expect(validResult.data?.commune).toBeDefined();
			
			const invalidResult = await validateCommuneId('99999');
			expect(invalidResult.isValid).toBe(false);
			expect(invalidResult.errors.length).toBeGreaterThan(0);
		});

		it('should validate address hierarchy', async () => {
			const validResult = await validateAddressHierarchy('01', '001', '00001');
			expect(validResult.isValid).toBe(true);
			expect(validResult.errors.length).toBe(0);
			expect(validResult.hierarchy.province).toBeDefined();
			expect(validResult.hierarchy.district).toBeDefined();
			expect(validResult.hierarchy.commune).toBeDefined();
			
			// Test invalid hierarchy
			const invalidResult = await validateAddressHierarchy('01', '002', '00001');
			expect(invalidResult.isValid).toBe(false);
			expect(invalidResult.errors.length).toBeGreaterThan(0);
		});

		it('should validate and suggest address', async () => {
			const result = await validateAndSuggestAddress('01');
			expect(result.hierarchy.province).toBeDefined();
			expect(result.suggestions?.districts).toBeDefined();
			expect(result.suggestions?.districts?.length).toBeGreaterThan(0);
		});

		it('should batch validate addresses', async () => {
			const addresses = [
				{ provinceId: '01', districtId: '001', communeId: '00001' },
				{ provinceId: '79', districtId: '999', communeId: '99999' }
			];
			
			const results = await batchValidateAddresses(addresses);
			expect(results.length).toBe(2);
			expect(results[0].isValid).toBe(true);
			expect(results[1].isValid).toBe(false);
		});

		it('should validate address format', () => {
			const validFormat = validateAddressFormat({
				provinceId: '01',
				districtId: '001',
				communeId: '00001'
			});
			expect(validFormat.isValid).toBe(true);
			
			const invalidFormat = validateAddressFormat({
				provinceId: '1',
				districtId: '1',
				communeId: '1'
			});
			expect(invalidFormat.isValid).toBe(false);
		});
	});

	describe('Export Features', () => {
		it('should export provinces to JSON', async () => {
			const jsonData = await exportProvinces({ format: 'json' });
			expect(jsonData).toBeDefined();
			expect(() => JSON.parse(jsonData)).not.toThrow();
			
			const parsed = JSON.parse(jsonData);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed.length).toBe(63);
		});

		it('should export provinces to CSV', async () => {
			const csvData = await exportProvinces({ format: 'csv' });
			expect(csvData).toBeDefined();
			expect(csvData).toContain('idProvince,name');
			expect(csvData.split('\n').length).toBeGreaterThan(63);
		});

		it('should export provinces to XML', async () => {
			const xmlData = await exportProvinces({ format: 'xml' });
			expect(xmlData).toBeDefined();
			expect(xmlData).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xmlData).toContain('<provinces>');
			expect(xmlData).toContain('</provinces>');
		});

		it('should export provinces to SQL', async () => {
			const sqlData = await exportProvinces({ format: 'sql', tableName: 'test_provinces' });
			expect(sqlData).toBeDefined();
			expect(sqlData).toContain('CREATE TABLE test_provinces');
			expect(sqlData).toContain('INSERT INTO test_provinces');
		});

		it('should export flattened addresses', async () => {
			const jsonData = await exportFlattenedAddresses({ 
				format: 'json',
				filterByProvince: ['01']
			});
			expect(jsonData).toBeDefined();
			
			const parsed = JSON.parse(jsonData);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed.length).toBeGreaterThan(0);
			expect(parsed[0]).toHaveProperty('provinceId');
			expect(parsed[0]).toHaveProperty('provinceName');
			expect(parsed[0]).toHaveProperty('districtId');
			expect(parsed[0]).toHaveProperty('districtName');
			expect(parsed[0]).toHaveProperty('communeId');
			expect(parsed[0]).toHaveProperty('communeName');
		});

		it('should export hierarchical data', async () => {
			const jsonData = await exportHierarchicalData(['01'], { format: 'json' });
			expect(jsonData).toBeDefined();
			
			const parsed = JSON.parse(jsonData);
			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed[0]).toHaveProperty('districts');
			expect(parsed[0].districts[0]).toHaveProperty('communes');
		});
	});

	describe('Fuzzy Search Features', () => {
		it('should fuzzy search provinces', async () => {
			const results = await fuzzySearchProvinces('Thành phố', { threshold: 0.3 });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].score).toBeGreaterThan(0.3);
			expect(results[0].matches).toBeDefined();

			// Should find cities (Thành phố)
			expect(results[0].item.name).toContain('Thành phố');
		});

		it('should fuzzy search districts', async () => {
			const results = await fuzzySearchDistricts('Ba Dinh', { threshold: 0.5 });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].score).toBeGreaterThan(0.5);
		});

		it('should fuzzy search communes', async () => {
			const results = await fuzzySearchCommunes('Phuc Xa', { threshold: 0.5 });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].score).toBeGreaterThan(0.5);
		});

		it('should perform universal fuzzy search', async () => {
			const results = await universalFuzzySearch('Ha', { 
				threshold: 0.3,
				maxResults: 10
			});
			
			expect(results).toBeDefined();
			expect(results.provinces).toBeDefined();
			expect(results.districts).toBeDefined();
			expect(results.communes).toBeDefined();
			expect(results.combined).toBeDefined();
			expect(results.combined.length).toBeLessThanOrEqual(10);
		});

		it('should find similar names', async () => {
			const results = await findSimilarNames('Thành phố Hà Nội', 'province', 0.7);
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			
			results.forEach(result => {
				expect(result.similarity).toBeGreaterThanOrEqual(0.7);
				expect(result.item).toBeDefined();
			});
		});

		it('should suggest corrections', async () => {
			const suggestions = await suggestCorrections('Ha Noi');
			expect(suggestions).toBeDefined();
			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions[0]).toHaveProperty('suggestion');
			expect(suggestions[0]).toHaveProperty('type');
			expect(suggestions[0]).toHaveProperty('confidence');
			expect(suggestions[0]).toHaveProperty('item');
		});

		it('should handle fuzzy search with filters', async () => {
			const results = await universalFuzzySearch('Quan', {
				threshold: 0.3,
				filters: { provinceId: '01', type: 'district' }
			});
			
			expect(results.provinces.length).toBe(0);
			expect(results.communes.length).toBe(0);
			expect(results.districts.length).toBeGreaterThan(0);
			
			// All districts should belong to Hanoi (province 01)
			results.districts.forEach(result => {
				expect(result.item.idProvince).toBe('01');
			});
		});
	});

	describe('Performance of Advanced Features', () => {
		it('should perform analytics operations efficiently', async () => {
			const start = performance.now();
			await Promise.all([
				getProvinceStats('01'),
				getTopProvincesByDistricts(5),
				getDistrictDistribution()
			]);
			const end = performance.now();
			
			expect(end - start).toBeLessThan(1000); // Should complete within 1 second
		});

		it('should perform validation operations efficiently', async () => {
			const start = performance.now();
			await Promise.all([
				validateProvinceId('01'),
				validateDistrictId('001'),
				validateCommuneId('00001'),
				validateAddressHierarchy('01', '001', '00001')
			]);
			const end = performance.now();
			
			expect(end - start).toBeLessThan(100); // Should complete within 100ms
		});

		it('should perform fuzzy search efficiently', async () => {
			const start = performance.now();
			await Promise.all([
				fuzzySearchProvinces('Ha Noi', { maxResults: 5 }),
				fuzzySearchDistricts('Ba Dinh', { maxResults: 5 }),
				universalFuzzySearch('Ha', { maxResults: 10 })
			]);
			const end = performance.now();
			
			expect(end - start).toBeLessThan(500); // Should complete within 500ms
		});
	});
});

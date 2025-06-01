// Advanced demo script showcasing all new features of vietnam-provinces-js
const { 
  getProvinceStats,
  getNationalStats,
  getTopProvincesByDistricts 
} = require('./dist/analytics.js');

const { 
  validateAddressHierarchy,
  validateAndSuggestAddress,
  batchValidateAddresses 
} = require('./dist/validation.js');

const { 
  exportProvinces,
  exportFlattenedAddresses 
} = require('./dist/export.js');

const { 
  fuzzySearchProvinces,
  universalFuzzySearch,
  suggestCorrections 
} = require('./dist/fuzzy.js');

async function runAdvancedDemo() {
  console.log('🚀 Vietnam Provinces JS - Advanced Features Demo\n');

  // Analytics Demo
  console.log('📊 ANALYTICS FEATURES');
  console.log('='.repeat(50));
  
  console.time('⚡ Get Hanoi statistics');
  const hanoiStats = await getProvinceStats('01');
  console.timeEnd('⚡ Get Hanoi statistics');
  console.log(`📍 ${hanoiStats?.province.name}:`);
  console.log(`   • Districts: ${hanoiStats?.districtCount}`);
  console.log(`   • Communes: ${hanoiStats?.communeCount}`);
  console.log(`   • Avg communes/district: ${hanoiStats?.averageCommunesPerDistrict}`);
  console.log(`   • Largest district: ${hanoiStats?.largestDistrict.district.name} (${hanoiStats?.largestDistrict.communeCount} communes)`);
  console.log(`   • Smallest district: ${hanoiStats?.smallestDistrict.district.name} (${hanoiStats?.smallestDistrict.communeCount} communes)\n`);

  console.time('⚡ Get national statistics');
  const nationalStats = await getNationalStats();
  console.timeEnd('⚡ Get national statistics');
  console.log('🇻🇳 National Statistics:');
  console.log(`   • Total provinces: ${nationalStats.totalProvinces}`);
  console.log(`   • Total districts: ${nationalStats.totalDistricts}`);
  console.log(`   • Total communes: ${nationalStats.totalCommunes}`);
  console.log(`   • Avg districts/province: ${nationalStats.averageDistrictsPerProvince}`);
  console.log(`   • Avg communes/district: ${nationalStats.averageCommunesPerDistrict}`);
  console.log(`   • Largest province: ${nationalStats.largestProvince.province.name} (${nationalStats.largestProvince.districtCount} districts)`);
  console.log(`   • Smallest province: ${nationalStats.smallestProvince.province.name} (${nationalStats.smallestProvince.districtCount} districts)\n`);

  console.time('⚡ Get top provinces by districts');
  const topProvinces = await getTopProvincesByDistricts(5);
  console.timeEnd('⚡ Get top provinces by districts');
  console.log('🏆 Top 5 Provinces by District Count:');
  topProvinces.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.province.name}: ${item.districtCount} districts`);
  });
  console.log();

  // Validation Demo
  console.log('✅ VALIDATION FEATURES');
  console.log('='.repeat(50));
  
  console.time('⚡ Validate address hierarchy');
  const validationResult = await validateAddressHierarchy('01', '001', '00001');
  console.timeEnd('⚡ Validate address hierarchy');
  console.log('🔍 Address Validation Result:');
  console.log(`   • Valid: ${validationResult.isValid}`);
  console.log(`   • Errors: ${validationResult.errors.length}`);
  console.log(`   • Warnings: ${validationResult.warnings.length}`);
  if (validationResult.hierarchy.province) {
    console.log(`   • Province: ${validationResult.hierarchy.province.name}`);
    console.log(`   • District: ${validationResult.hierarchy.district?.name}`);
    console.log(`   • Commune: ${validationResult.hierarchy.commune?.name}`);
  }
  console.log();

  console.time('⚡ Validate and suggest');
  const suggestionResult = await validateAndSuggestAddress('01');
  console.timeEnd('⚡ Validate and suggest');
  console.log('💡 Address Suggestions:');
  console.log(`   • Province: ${suggestionResult.hierarchy.province?.name}`);
  console.log(`   • Available districts: ${suggestionResult.suggestions?.districts?.length || 0}`);
  if (suggestionResult.suggestions?.districts) {
    console.log('   • Sample districts:');
    suggestionResult.suggestions.districts.slice(0, 3).forEach(district => {
      console.log(`     - ${district.name}`);
    });
  }
  console.log();

  console.time('⚡ Batch validate addresses');
  const batchResults = await batchValidateAddresses([
    { provinceId: '01', districtId: '001', communeId: '00001' },
    { provinceId: '79', districtId: '760', communeId: '26734' },
    { provinceId: '99', districtId: '999', communeId: '99999' } // Invalid
  ]);
  console.timeEnd('⚡ Batch validate addresses');
  console.log('📦 Batch Validation Results:');
  batchResults.forEach((result, index) => {
    console.log(`   ${index + 1}. Valid: ${result.isValid}, Errors: ${result.errors.length}`);
  });
  console.log();

  // Export Demo
  console.log('📤 EXPORT FEATURES');
  console.log('='.repeat(50));
  
  console.time('⚡ Export provinces to JSON');
  const provincesJson = await exportProvinces({ format: 'json' });
  console.timeEnd('⚡ Export provinces to JSON');
  console.log(`📄 Exported provinces JSON: ${provincesJson.length} characters`);

  console.time('⚡ Export provinces to CSV');
  const provincesCSV = await exportProvinces({ format: 'csv' });
  console.timeEnd('⚡ Export provinces to CSV');
  console.log(`📊 Exported provinces CSV: ${provincesCSV.split('\n').length} lines`);

  console.time('⚡ Export flattened addresses');
  const flattenedData = await exportFlattenedAddresses({ 
    format: 'json',
    filterByProvince: ['01'] // Only Hanoi
  });
  console.timeEnd('⚡ Export flattened addresses');
  const flattenedCount = JSON.parse(flattenedData).length;
  console.log(`🗂️ Exported flattened addresses for Hanoi: ${flattenedCount} records`);
  console.log();

  // Fuzzy Search Demo
  console.log('🔍 FUZZY SEARCH FEATURES');
  console.log('='.repeat(50));
  
  console.time('⚡ Fuzzy search provinces');
  const fuzzyProvinces = await fuzzySearchProvinces('Ha Noi', { threshold: 0.3 });
  console.timeEnd('⚡ Fuzzy search provinces');
  console.log('🔎 Fuzzy search results for "Ha Noi":');
  fuzzyProvinces.slice(0, 3).forEach(result => {
    console.log(`   • ${result.item.name} (score: ${result.score.toFixed(3)}, type: ${result.matches[0].type})`);
  });
  console.log();

  console.time('⚡ Universal fuzzy search');
  const universalResults = await universalFuzzySearch('Quan 1', { 
    threshold: 0.3,
    maxResults: 8
  });
  console.timeEnd('⚡ Universal fuzzy search');
  console.log('🌐 Universal search results for "Quan 1":');
  universalResults.combined.forEach(result => {
    console.log(`   • ${result.type}: ${result.item.name} (score: ${result.score.toFixed(3)})`);
  });
  console.log();

  console.time('⚡ Suggest corrections');
  const corrections = await suggestCorrections('Ha Noi Viet Nam');
  console.timeEnd('⚡ Suggest corrections');
  console.log('💭 Correction suggestions for "Ha Noi Viet Nam":');
  corrections.slice(0, 5).forEach(suggestion => {
    console.log(`   • ${suggestion.suggestion} (${suggestion.type}, confidence: ${suggestion.confidence.toFixed(3)})`);
  });
  console.log();

  // Advanced Search Demo
  console.log('🎯 ADVANCED SEARCH SCENARIOS');
  console.log('='.repeat(50));
  
  console.time('⚡ Search with filters');
  const filteredSearch = await universalFuzzySearch('Phuong', {
    threshold: 0.4,
    maxResults: 5,
    filters: { provinceId: '01', type: 'commune' }
  });
  console.timeEnd('⚡ Search with filters');
  console.log('🎯 Filtered search for "Phuong" in Hanoi communes:');
  filteredSearch.communes.forEach(result => {
    console.log(`   • ${result.item.name} (score: ${result.score.toFixed(3)})`);
  });
  console.log();

  // Performance Summary
  console.log('⚡ PERFORMANCE SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ All advanced features completed successfully!');
  console.log('📊 Analytics: Fast statistical computations');
  console.log('✅ Validation: Comprehensive address validation');
  console.log('📤 Export: Multiple format support (JSON, CSV, XML, SQL)');
  console.log('🔍 Fuzzy Search: Advanced matching algorithms');
  console.log('🎯 Filtering: Precise search with multiple criteria');
  console.log('💾 Memory Efficient: Lazy loading and caching');
  console.log('🚀 High Performance: Optimized for speed and accuracy');
  
  console.log('\n🎉 Advanced demo completed! The library now offers enterprise-grade features.');
}

// Run the advanced demo
runAdvancedDemo().catch(console.error);

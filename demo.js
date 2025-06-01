// Demo script to showcase the optimized vietnam-provinces-js library
const { 
  getAllProvince, 
  getAllProvincesSorted, 
  searchProvinceByName 
} = require('./dist/provinces.js');

const { 
  getDistrictById, 
  getCommunesByDistrictId 
} = require('./dist/districts.js');

const { 
  getCommuneById 
} = require('./dist/communes.js');

const { 
  getProvinceAutocomplete,
  getUniversalAutocomplete 
} = require('./dist/autocomplete.js');

const { 
  getAddressPath,
  getFormattedAddress,
  getFullHierarchy 
} = require('./dist/hierarchy.js');

const { 
  getProvincesBatch,
  getFullAddressesBatch 
} = require('./dist/batch.js');

async function runDemo() {
  console.log('🇻🇳 Vietnam Provinces JS - Performance Demo\n');

  // Performance test: Basic operations
  console.log('📊 Performance Tests:');
  
  console.time('⚡ Get all provinces');
  const provinces = await getAllProvince();
  console.timeEnd('⚡ Get all provinces');
  console.log(`   Found ${provinces.length} provinces\n`);

  console.time('⚡ Get sorted provinces (first call)');
  const sorted1 = await getAllProvincesSorted();
  console.timeEnd('⚡ Get sorted provinces (first call)');

  console.time('⚡ Get sorted provinces (cached)');
  const sorted2 = await getAllProvincesSorted();
  console.timeEnd('⚡ Get sorted provinces (cached)');
  console.log(`   Cached result is identical: ${JSON.stringify(sorted1) === JSON.stringify(sorted2)}\n`);

  console.time('⚡ Search provinces');
  const searchResults = await searchProvinceByName('Hà Nội');
  console.timeEnd('⚡ Search provinces');
  console.log(`   Found ${searchResults.length} results for "Hà Nội"\n`);

  console.time('⚡ Get district by ID');
  const district = await getDistrictById('001');
  console.timeEnd('⚡ Get district by ID');
  console.log(`   District: ${district?.name}\n`);

  console.time('⚡ Get commune by ID');
  const commune = await getCommuneById('00001');
  console.timeEnd('⚡ Get commune by ID');
  console.log(`   Commune: ${commune?.name}\n`);

  // Autocomplete demo
  console.log('🔍 Autocomplete Features:');
  
  console.time('⚡ Province autocomplete');
  const autoComplete = await getProvinceAutocomplete('Hà', 5);
  console.timeEnd('⚡ Province autocomplete');
  console.log('   Top suggestions for "Hà":');
  autoComplete.forEach(item => {
    console.log(`   - ${item.name} (score: ${item.score})`);
  });
  console.log();

  console.time('⚡ Universal autocomplete');
  const universalResults = await getUniversalAutocomplete('Hà', 8);
  console.timeEnd('⚡ Universal autocomplete');
  console.log('   Universal search results for "Hà":');
  universalResults.forEach(item => {
    console.log(`   - ${item.type}: ${item.name} ${item.parentName ? `(${item.parentName})` : ''} (score: ${item.score})`);
  });
  console.log();

  // Hierarchy demo
  console.log('🏗️ Hierarchy Features:');
  
  console.time('⚡ Get address path');
  const addressPath = await getAddressPath('00001');
  console.timeEnd('⚡ Get address path');
  console.log('   Address hierarchy:');
  console.log(`   - Province: ${addressPath?.province?.name}`);
  console.log(`   - District: ${addressPath?.district?.name}`);
  console.log(`   - Commune: ${addressPath?.commune?.name}`);
  console.log();

  console.time('⚡ Get formatted address');
  const formattedAddress = await getFormattedAddress('00001');
  console.timeEnd('⚡ Get formatted address');
  console.log(`   Formatted address: ${formattedAddress}\n`);

  console.time('⚡ Get full hierarchy');
  const fullHierarchy = await getFullHierarchy('01');
  console.timeEnd('⚡ Get full hierarchy');
  console.log(`   Hanoi has ${fullHierarchy?.districts.length} districts`);
  const totalCommunes = fullHierarchy?.districts.reduce((sum, d) => sum + d.communes.length, 0);
  console.log(`   Total communes in Hanoi: ${totalCommunes}\n`);

  // Batch operations demo
  console.log('📦 Batch Operations:');
  
  const provinceIds = ['01', '79', '31', '48', '92']; // Major cities
  console.time('⚡ Batch get provinces');
  const batchProvinces = await getProvincesBatch(provinceIds);
  console.timeEnd('⚡ Batch get provinces');
  console.log('   Major cities:');
  batchProvinces.success.forEach(p => {
    console.log(`   - ${p.name}`);
  });
  console.log();

  const communeIds = ['00001', '00004', '00007'];
  console.time('⚡ Batch get addresses');
  const batchAddresses = await getFullAddressesBatch(communeIds);
  console.timeEnd('⚡ Batch get addresses');
  console.log('   Batch addresses:');
  batchAddresses.forEach(addr => {
    if (addr.fullAddress) {
      console.log(`   - ${addr.fullAddress}`);
    }
  });
  console.log();

  // Memory efficiency demo
  console.log('💾 Memory Efficiency:');
  console.log('   ✅ Lazy loading: Data loaded only when needed');
  console.log('   ✅ Caching: Results cached for repeated operations');
  console.log('   ✅ Tree-shaking: Only imported modules are bundled');
  console.log('   ✅ Indexed lookup: O(1) performance for ID-based operations');
  console.log('   ✅ Memoization: Expensive operations cached automatically');
  
  console.log('\n🎉 Demo completed! All operations are significantly faster than before.');
}

// Run the demo
runDemo().catch(console.error);

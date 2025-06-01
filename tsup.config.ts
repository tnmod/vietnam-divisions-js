import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		provinces: 'src/provinces/index.ts',
		districts: 'src/districts/index.ts',
		communes: 'src/communes/index.ts',
		utils: 'src/utils/index.ts',
		cache: 'src/cache/index.ts',
		autocomplete: 'src/features/autocomplete.ts',
		hierarchy: 'src/features/hierarchy.ts',
		batch: 'src/features/batch.ts',
		analytics: 'src/features/analytics.ts',
		validation: 'src/features/validation.ts',
		export: 'src/features/export.ts',
		fuzzy: 'src/features/fuzzy.ts',
	},
	clean: true,
	format: ['cjs', 'esm'],
	dts: {
		entry: {
			index: 'src/index.ts',
			provinces: 'src/provinces/index.ts',
			districts: 'src/districts/index.ts',
			communes: 'src/communes/index.ts',
			utils: 'src/utils/index.ts',
			cache: 'src/cache/index.ts',
			autocomplete: 'src/features/autocomplete.ts',
			hierarchy: 'src/features/hierarchy.ts',
			batch: 'src/features/batch.ts',
			analytics: 'src/features/analytics.ts',
			validation: 'src/features/validation.ts',
			export: 'src/features/export.ts',
			fuzzy: 'src/features/fuzzy.ts',
		},
	},
	sourcemap: false, // ✅ Tránh tạo file .d.ts.map không cần thiết
	splitting: true, // ✅ Enable code splitting for better tree-shaking
	treeshake: true, // ✅ Enable tree-shaking
	minify: true, // ✅ Minify output for smaller bundle size
	outDir: 'dist', // ✅ Đảm bảo xuất file vào thư mục dist
	loader: {
		'.json': 'json',
	},
	esbuildOptions(options) {
		// ✅ Optimize for modern browsers
		options.target = 'es2020';
		options.keepNames = true;
	},
});

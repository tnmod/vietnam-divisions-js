import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		provinces: 'src/provinces/index.ts',
		districts: 'src/districts/index.ts',
		communes: 'src/communes/index.ts',
	},
	clean: true,
	format: ['cjs', 'esm'],
	dts: {
		entry: {
			index: 'src/index.ts',
			provinces: 'src/provinces/index.ts',
			districts: 'src/districts/index.ts',
			communes: 'src/communes/index.ts',
		},
	},
	sourcemap: false, // ✅ Tránh tạo file .d.ts.map không cần thiết
	splitting: false, // ✅ Tránh tách file không cần thiết
	outDir: 'dist', // ✅ Đảm bảo xuất file vào thư mục dist
	loader: {
		'.json': 'json',
	},
});

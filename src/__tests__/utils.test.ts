import { describe, it, expect, vi } from 'vitest';
import {
	normalizeText,
	memoize,
	createSearchIndex,
	fuzzySearchWithIndex,
	createIdMap,
	createHierarchicalMap,
} from '../utils';

describe('utils', () => {
	describe('normalizeText', () => {
		it('removes Vietnamese diacritics and lowercases', () => {
			expect(normalizeText('Thành phố Hồ Chí Minh')).toBe(
				'thanh pho ho chi minh'
			);
			expect(normalizeText('Đắk Lắk')).toBe('dak lak');
			expect(normalizeText('Xã Ia Mơ')).toBe('xa ia mo');
		});

		it('trims surrounding whitespace', () => {
			expect(normalizeText('  Hà Nội  ')).toBe('ha noi');
		});

		it('handles empty string and whitespace-only input', () => {
			expect(normalizeText('')).toBe('');
			expect(normalizeText('   ')).toBe('');
		});

		it('is idempotent', () => {
			const once = normalizeText('Phường Bến Nghé');
			expect(normalizeText(once)).toBe(once);
		});

		it('treats NFC and NFD input the same', () => {
			const nfc = 'Nậm Nèn'.normalize('NFC');
			const nfd = 'Nậm Nèn'.normalize('NFD');
			expect(normalizeText(nfd)).toBe(normalizeText(nfc));
		});
	});

	describe('memoize', () => {
		it('caches results per argument list', () => {
			const fn = vi.fn((a: number, b: number) => a + b);
			const memo = memoize(fn);
			expect(memo(1, 2)).toBe(3);
			expect(memo(1, 2)).toBe(3);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(memo(2, 1)).toBe(3);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('caches undefined / falsy results', () => {
			const fn = vi.fn(() => 0);
			const memo = memoize(fn);
			memo();
			memo();
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('createIdMap', () => {
		const items = [
			{ id: 'a', name: 'A' },
			{ id: 'b', name: 'B' },
		];

		it('builds an O(1) lookup by field', () => {
			const map = createIdMap(items, 'id');
			expect(map.size).toBe(2);
			expect(map.get('a')).toBe(items[0]);
			expect(map.get('zzz')).toBeUndefined();
		});

		it('returns an empty map for empty input', () => {
			expect(createIdMap([], 'id').size).toBe(0);
		});

		it('keeps the last item when ids are duplicated', () => {
			const dup = [
				{ id: 'x', name: 'first' },
				{ id: 'x', name: 'second' },
			];
			expect(createIdMap(dup, 'id').get('x')!.name).toBe('second');
		});
	});

	describe('createHierarchicalMap', () => {
		it('groups items by parent id, preserving order', () => {
			const items = [
				{ id: '1', parent: 'p1' },
				{ id: '2', parent: 'p2' },
				{ id: '3', parent: 'p1' },
			];
			const map = createHierarchicalMap(items, 'parent');
			expect(map.get('p1')!.map((i) => i.id)).toEqual(['1', '3']);
			expect(map.get('p2')!.map((i) => i.id)).toEqual(['2']);
			expect(map.get('missing')).toBeUndefined();
		});

		it('returns an empty map for empty input', () => {
			expect(createHierarchicalMap([], 'parent').size).toBe(0);
		});
	});

	describe('createSearchIndex / fuzzySearchWithIndex', () => {
		const items = [
			{ name: 'Hà Nội' },
			{ name: 'Hà Giang' },
			{ name: 'Hải Phòng' },
			{ name: 'Đà Nẵng' },
		];
		const index = createSearchIndex(items);

		it('indexes the full normalized name', () => {
			expect(new Set(index.get('ha noi'))).toEqual(new Set([items[0]]));
		});

		it('indexes individual words longer than one character', () => {
			expect(new Set(index.get('ha'))).toEqual(
				new Set([items[0], items[1], items[2]])
			);
			expect(index.has('a')).toBe(false);
		});

		it('indexes prefixes of length >= 2', () => {
			expect(index.get('da')).toContain(items[3]);
			expect(index.has('d')).toBe(false);
		});

		it('finds exact matches, ignoring case and diacritics', () => {
			const res = fuzzySearchWithIndex('HÀ NỘI', index);
			expect(res).toContain(items[0]);
		});

		it('finds by prefix and by word', () => {
			expect(fuzzySearchWithIndex('hai', index)).toContain(items[2]);
			expect(fuzzySearchWithIndex('giang', index)).toContain(items[1]);
		});

		it('does not return duplicates', () => {
			const res = fuzzySearchWithIndex('ha noi', index);
			expect(new Set(res).size).toBe(res.length);
		});

		it('returns nothing for unrelated queries', () => {
			expect(fuzzySearchWithIndex('zzzzzz', index)).toEqual([]);
		});

		it('handles an empty index', () => {
			expect(fuzzySearchWithIndex('ha', new Map())).toEqual([]);
		});
	});
});

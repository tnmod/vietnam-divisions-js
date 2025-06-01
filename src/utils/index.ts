// Utility functions for performance optimization
import removeAccents from 'remove-accents';

/**
 * Normalize text for search (remove accents, lowercase, trim)
 */
export const normalizeText = (text: string): string => {
	return removeAccents(text.toLowerCase().trim());
};

/**
 * Memoization decorator for expensive functions
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
	const cache = new Map();
	return ((...args: any[]) => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key);
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
};

/**
 * Create a search index for fast text searching
 */
export const createSearchIndex = <T extends { name: string }>(
	items: T[]
): Map<string, T[]> => {
	const index = new Map<string, T[]>();
	
	items.forEach(item => {
		const normalized = normalizeText(item.name);
		const words = normalized.split(/\s+/);
		
		// Index by full name
		if (!index.has(normalized)) {
			index.set(normalized, []);
		}
		index.get(normalized)!.push(item);
		
		// Index by individual words
		words.forEach(word => {
			if (word.length > 1) { // Skip single characters
				if (!index.has(word)) {
					index.set(word, []);
				}
				index.get(word)!.push(item);
			}
		});
		
		// Index by prefixes (for autocomplete)
		for (let i = 2; i <= normalized.length; i++) {
			const prefix = normalized.substring(0, i);
			if (!index.has(prefix)) {
				index.set(prefix, []);
			}
			index.get(prefix)!.push(item);
		}
	});
	
	return index;
};

/**
 * Fast fuzzy search using pre-built index
 */
export const fuzzySearchWithIndex = <T extends { name: string }>(
	query: string,
	searchIndex: Map<string, T[]>,
	threshold: number = 0.5
): T[] => {
	const normalizedQuery = normalizeText(query);
	const results = new Set<T>();
	
	// Exact match first
	if (searchIndex.has(normalizedQuery)) {
		searchIndex.get(normalizedQuery)!.forEach(item => results.add(item));
	}
	
	// Prefix matches
	for (const [key, items] of searchIndex.entries()) {
		if (key.startsWith(normalizedQuery) || normalizedQuery.startsWith(key)) {
			items.forEach(item => results.add(item));
		}
	}
	
	// Word matches
	const queryWords = normalizedQuery.split(/\s+/);
	queryWords.forEach(word => {
		if (searchIndex.has(word)) {
			searchIndex.get(word)!.forEach(item => results.add(item));
		}
	});
	
	return Array.from(results);
};

/**
 * Create ID lookup map for O(1) access
 */
export const createIdMap = <T extends Record<string, any>>(
	items: T[],
	idField: keyof T
): Map<string, T> => {
	const map = new Map<string, T>();
	items.forEach(item => {
		map.set(item[idField], item);
	});
	return map;
};

/**
 * Create hierarchical lookup map (e.g., districts by province)
 */
export const createHierarchicalMap = <T extends Record<string, any>>(
	items: T[],
	parentIdField: keyof T
): Map<string, T[]> => {
	const map = new Map<string, T[]>();
	items.forEach(item => {
		const parentId = item[parentIdField];
		if (!map.has(parentId)) {
			map.set(parentId, []);
		}
		map.get(parentId)!.push(item);
	});
	return map;
};

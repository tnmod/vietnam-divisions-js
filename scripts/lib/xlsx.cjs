'use strict';
/**
 * Minimal, dependency-free .xlsx reader.
 *
 * Only supports what we need to read the official NSO workbooks:
 * - ZIP container (stored / deflate entries, central directory)
 * - shared strings, inline strings, numeric cells
 *
 * Numeric cells are returned as raw strings (e.g. "1558"); callers are
 * responsible for re-padding administrative codes that lost leading zeros.
 */
const fs = require('fs');
const zlib = require('zlib');

const readZipEntries = (buf) => {
	// Locate End Of Central Directory record (signature 0x06054b50).
	let eocd = -1;
	for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
		if (buf.readUInt32LE(i) === 0x06054b50) {
			eocd = i;
			break;
		}
	}
	if (eocd < 0) throw new Error('Invalid xlsx: EOCD not found');

	const count = buf.readUInt16LE(eocd + 10);
	let ptr = buf.readUInt32LE(eocd + 16);
	const entries = new Map();

	for (let n = 0; n < count; n++) {
		if (buf.readUInt32LE(ptr) !== 0x02014b50)
			throw new Error('Invalid central directory');
		const method = buf.readUInt16LE(ptr + 10);
		const compSize = buf.readUInt32LE(ptr + 20);
		const nameLen = buf.readUInt16LE(ptr + 28);
		const extraLen = buf.readUInt16LE(ptr + 30);
		const commentLen = buf.readUInt16LE(ptr + 32);
		const localOffset = buf.readUInt32LE(ptr + 42);
		const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen);

		const lNameLen = buf.readUInt16LE(localOffset + 26);
		const lExtraLen = buf.readUInt16LE(localOffset + 28);
		const dataStart = localOffset + 30 + lNameLen + lExtraLen;
		const raw = buf.subarray(dataStart, dataStart + compSize);

		entries.set(name, () => {
			if (method === 0) return raw;
			if (method === 8) return zlib.inflateRawSync(raw);
			throw new Error(
				`Unsupported zip compression method ${method} for ${name}`
			);
		});
		ptr += 46 + nameLen + extraLen + commentLen;
	}
	return entries;
};

const decodeXml = (s) =>
	s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
			String.fromCodePoint(parseInt(h, 16))
		)
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
		.replace(/&amp;/g, '&');

const textOf = (xml) =>
	[...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
		.map((m) => decodeXml(m[1]))
		.join('');

const colIndex = (ref) => {
	let n = 0;
	for (const ch of ref.match(/^[A-Z]+/)[0])
		n = n * 26 + (ch.charCodeAt(0) - 64);
	return n - 1;
};

/**
 * @param {string} file path to .xlsx
 * @returns {{ sheets: string[], readSheet: (nameOrIndex: string|number) => {row:number, cells:(string|null)[]}[] }}
 */
const openWorkbook = (file) => {
	const entries = readZipEntries(fs.readFileSync(file));
	const read = (name) => {
		const get = entries.get(name);
		if (!get) throw new Error(`Missing ${name} in workbook`);
		return get().toString('utf8');
	};

	const shared = entries.has('xl/sharedStrings.xml')
		? [...read('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
				(m) => textOf(m[1])
			)
		: [];

	const workbook = read('xl/workbook.xml');
	const rels = read('xl/_rels/workbook.xml.rels');
	const relTarget = new Map(
		[...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => [
			(m[0].match(/Id="([^"]+)"/) || [])[1],
			(m[0].match(/Target="([^"]+)"/) || [])[1],
		])
	);
	const sheets = [...workbook.matchAll(/<sheet\b[^>]*>/g)].map((m) => ({
		name: decodeXml((m[0].match(/name="([^"]*)"/) || [])[1] || ''),
		target: relTarget.get((m[0].match(/r:id="([^"]+)"/) || [])[1]),
	}));

	const readSheet = (nameOrIndex) => {
		const sheet =
			typeof nameOrIndex === 'number'
				? sheets[nameOrIndex]
				: sheets.find((s) => s.name.trim() === String(nameOrIndex).trim());
		if (!sheet) throw new Error(`Sheet not found: ${nameOrIndex}`);
		const xml = read('xl/' + sheet.target.replace(/^\/?xl\//, ''));
		const rows = [];
		for (const r of xml.matchAll(
			/<row\b[^>]*?\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g
		)) {
			const cells = [];
			for (const c of r[2].matchAll(
				/<c\b[^>]*?\br="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
			)) {
				const type = ((c[2] || '').match(/\bt="(\w+)"/) || [])[1];
				const inner = c[3] || '';
				let v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
				if (type === 's' && v !== undefined) v = shared[+v];
				else if (type === 'inlineStr') v = textOf(inner);
				else if (v !== undefined) v = decodeXml(v);
				cells[colIndex(c[1])] = v === undefined ? null : v;
			}
			rows.push({
				row: +r[1],
				cells: Array.from(cells, (x) => (x === undefined ? null : x)),
			});
		}
		return rows;
	};

	return { sheets: sheets.map((s) => s.name), readSheet };
};

module.exports = { openWorkbook };

'use strict';
/**
 * Fetch official administrative legal resolutions directly from NSO website:
 * https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx';
const OUT_FILE = path.join(__dirname, '../data-sources/nso/resolutions.json');

const decodeHtml = (str) => {
	return str
		.replace(/&#224;/g, 'à')
		.replace(/&#225;/g, 'á')
		.replace(/&#226;/g, 'â')
		.replace(/&#227;/g, 'ã')
		.replace(/&#232;/g, 'è')
		.replace(/&#233;/g, 'é')
		.replace(/&#234;/g, 'ê')
		.replace(/&#236;/g, 'ì')
		.replace(/&#237;/g, 'í')
		.replace(/&#242;/g, 'ò')
		.replace(/&#243;/g, 'ó')
		.replace(/&#244;/g, 'ô')
		.replace(/&#245;/g, 'õ')
		.replace(/&#249;/g, 'ù')
		.replace(/&#250;/g, 'ú')
		.replace(/&#253;/g, 'ý')
		.replace(/&#273;/g, 'đ')
		.replace(/&#272;/g, 'Đ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};

const fetchHtml = () => {
	return new Promise((resolve, reject) => {
		https
			.get(URL, { rejectUnauthorized: false }, (res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => resolve(data));
			})
			.on('error', reject);
	});
};

const main = async () => {
	console.log(`🌐 Fetching official resolutions from ${URL}...`);
	const html = await fetchHtml();

	const regex =
		/<tr[^>]*id=["']ctl00_PlaceHolderMain_ASPxGridView1_DXDataRow\d+["'][^>]*>([\s\S]*?)<\/tr>/g;
	const resolutions = [];
	let match;

	while ((match = regex.exec(html)) !== null) {
		const rowHtml = match[1];
		const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
		const cols = [];
		let tdMatch;
		while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
			cols.push(decodeHtml(tdMatch[1].replace(/<[^>]+>/g, '')));
		}
		if (cols.length >= 4) {
			resolutions.push({
				number: cols[0],
				issueDate: cols[1],
				effectiveDate: cols[2],
				content: cols[3],
			});
		}
	}

	console.log(
		`✅ Successfully parsed ${resolutions.length} official resolutions from NSO!`
	);
	console.log('\nTop 5 newest resolutions on NSO:');
	resolutions.slice(0, 5).forEach((r, idx) => {
		console.log(
			`  ${idx + 1}. [${r.number}] (Hiệu lực: ${r.effectiveDate}): ${r.content}`
		);
	});

	fs.writeFileSync(OUT_FILE, JSON.stringify(resolutions, null, 2) + '\n');
	console.log(`\n💾 Saved to ${path.relative(process.cwd(), OUT_FILE)}`);
};

main().catch((err) => {
	console.error('Fetch failed:', err);
	process.exit(1);
});

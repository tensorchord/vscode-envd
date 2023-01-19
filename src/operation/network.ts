import {type RequestInfo, type RequestInit} from 'node-fetch';

import * as fs from 'fs';
import * as path from 'path';
import {compareVersions} from 'compare-versions';
import {Module, warn, error, info} from '../logger';
import {getLspVersion} from './cmd-back';

// Convert ESM into CommonJS import ref: https://stackoverflow.com/a/69331469
const fetch = async (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(async ({default: fetch}) => fetch(url, init));

type GithubTagOutput = {
	[x: string]: unknown;
	name: string;
};

export async function getGithubOnlineVersion(): Promise<string[]> {
	// The Github tag contains "v", as "v0.3.5", we remove them for consistency
	const tags = await fetch('https://api.github.com/repos/tensorchord/envd-lsp/tags')
		.then(async output => output.json() as Promise<GithubTagOutput[]>)
		.then(json => json.map(tagEntry => tagEntry.name))
		.then(tags => tags.map(tag => tag.replace('v', '')))
	// Remove rc and alpha version
		.then(tags => tags.map(tag => {
			const regexp = /^(\d+\.\d+\.\d+)((-alpha|-rc)\.\d+)?$/g;
			const matches = [...tag.matchAll(regexp)];
			if (matches.length !== 1) {
				error(`online version not meet specifications: ${tag}`, Module.INSTALL);
			}

			// Return match group version
			return matches[0][1];
		}))
	// Deduplication
		.then(tags => Array.from(new Set(tags)));

	// Descending sort version
	return tags.sort((v1: string, v2: string) => -compareVersions(v1, v2));
}

type PypiTagOutput = {
	[y: string]: unknown;
	releases: Record<string, unknown>;
};

export async function getPypiOnlineVersion(): Promise<string[]> {
	// The pypi version doesn't contain "v", as "0.3.5", used in pypi install
	const tags = await fetch('https://pypi.org/pypi/envd/json')
		.then(async output => output.json() as Promise<PypiTagOutput>)
		.then(json => json.releases)
		.then(releases => Object.keys(releases))
	// Remove rc and alpha version
		.then(tags => tags.map(tag => {
			const regexp = /^(\d+\.\d+\.\d+)((a|rc)\d+)?$/g;
			const matches = [...tag.matchAll(regexp)];
			if (matches.length !== 1) {
				error(`online version not meet specifications: ${tag}`, Module.INSTALL);
			}

			// Return match group version
			return matches[0][1];
		}))
	// Deduplication
		.then(tags => Array.from(new Set(tags)));

	// Descending sort version
	return tags.sort((v1: string, v2: string) => -compareVersions(v1, v2));
}

export async function installLsp(lspPath: string, gitTag: string) {
	if (!gitTag.startsWith('v')) {
		gitTag = `v${gitTag}`;
	}

	const prevLspExist = fs.existsSync(lspPath);

	if (prevLspExist && getLspVersion(lspPath) === gitTag) {
		warn('Request installnation version is same to original.', Module.INSTALL);
		return;
	}

	const lspInstallDir = path.dirname(lspPath);
	const lspBaseName = path.basename(lspPath);

	const res = await fetch(`https://github.com/tensorchord/envd-lsp/releases/download/${gitTag}/${lspBaseName}`);
	const downloadPath = path.join(lspInstallDir, 'envd-lsp-tmp');
	await new Promise<void>((resolve, reject) => {
		const fileStream = fs.createWriteStream(downloadPath);
		res.body!.pipe(fileStream);
		res.body!.on('error', err => {
			reject(err);
		});
		fileStream.on('finish', () => {
			resolve();
		});
	});
	info('LSP Server download finished, installing...', Module.INSTALL);
	if (prevLspExist) {
		fs.rmSync(lspPath);
	}

	fs.chmodSync(downloadPath, 0o775);
	fs.renameSync(downloadPath, lspPath);
	info(`LSP Server ${gitTag} has installed`, Module.INSTALL);
}

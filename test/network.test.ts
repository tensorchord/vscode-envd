
import {describe, expect, test} from '@jest/globals';
import type * as logger from '../src/logger';
import fetch from 'node-fetch';
import {getGithubOnlineVersion, getPypiOnlineVersion} from '../src/operation/network';

jest.mock('node-fetch', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('../src/logger', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Module: {LSP: '[LSP]', MANAGER: '[MANAGER]', INSTALL: '[INSTALL]', CONFIG: '[CONFIG]'},
	error: jest.fn((message: string, _module: logger.Module) => {
		console.error(message);
	}),
	warn: jest.fn((message: string, _module: logger.Module) => {
		console.warn(message);
	}),
	info: jest.fn((message: string, _module: logger.Module) => {
		console.info(message);
	}),
}));

describe('fetch data from network', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	test('get all versions from pypi', async () => {
		((fetch as unknown) as jest.Mock).mockResolvedValueOnce({
			json: () => ({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				releases: {'0.1.0': '', '1.0.0': '', '0.2.0': ''},
			}),
		});
		const versions = await getPypiOnlineVersion();
		expect(versions.length).toBe(3);
		expect(versions[0]).toBe('1.0.0');
		expect(versions[2]).toBe('0.1.0');
	});
	test('get all versions from Github', async () => {
		((fetch as unknown) as jest.Mock).mockResolvedValueOnce({
			json: () => [{
				name: 'v0.1.0',
			}, {
				name: 'v1.0.0',
			}, {
				name: 'v0.2.0',
			}],
		});
		const versions = await getGithubOnlineVersion();
		expect(versions.length).toBe(3);
		expect(versions[0]).toBe('1.0.0');
		expect(versions[2]).toBe('0.1.0');
	});
});

import {describe, expect, test} from '@jest/globals';
import {checkEnvdVersion, listEnvs, type EnvInfo, descEnv, type EnvDescribe, listImgs, type ImgInfo, descImg, listContexts, type CtxInfo, getPipEnvdPath, getLspVersion} from '../src/operation/cmd-back';
import * as proc from 'child_process';
import type * as logger from '../src/logger';

jest.mock('child_process', () => ({
	execSync: jest.fn(),
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

describe('envd-handler working with envd', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	test('get version of envd dirty build', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'{"envd":"v0.2.5-alpha.7+0c21af8.dirty","build_date":"2022-12-19T08:02:50Z",',
				'"git_commit":"0c21af8f76b8e6ba733c1d81bb51e6f038b69d93","git_tree_state":"dirty",',
				'"git_tag":"v0.2.5-alpha.7","go_version":"go1.19.3","compiler":"gc",',
				'"platform":"linux/amd64","os_type":"linux","os_version":"20.04",',
				'"kernel_version":"5.15.0-52-generic","docker_host_version":"20.10.12",',
				'"container_runtimes":"[io.containerd.runc.v2,io.containerd.runtime.v1.linux,runc]",',
				'"default_runtime":"runc"}',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		expect(checkEnvdVersion('ENVD')).toBe('0.2.5-alpha.7+0c21af8.dirty');
	});
	test('get version of envd clean build', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'{"envd":"v0.2.4","build_date":"2022-12-19T08:02:50Z",',
				'"git_commit":"0c21af8f76b8e6ba733c1d81bb51e6f038b69d93","git_tree_state":"dirty",',
				'"git_tag":"v0.2.4","go_version":"go1.19.3","compiler":"gc",',
				'"platform":"linux/amd64"}',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		expect(checkEnvdVersion('ENVD')).toBe('0.2.4');
	});
	test('get version when envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => checkEnvdVersion('ENVD-UNEXIST')).toThrowError('mock-error');
	});
	test('list environments', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'[{"name":"var2","ssh_target":"var2.envd","image":"act:var","gpu":false,"status":"Up 5 days"},',
				'{"name":"var","ssh_target":"var.envd","image":"var:dev","gpu":false,"status":"Up 5 days"}]',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		const info: EnvInfo[] = listEnvs('ENVD');
		expect(info.length).toBe(2);
		expect(info[0].name).toBe('var2');
		expect(info[1].name).toBe('var');
	});
	test('list environments when envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => listEnvs('ENVD-UNEXIST')).toThrowError('mock-error');
	});
	test('get environment describe', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'{"ports":[{"name":"ssh","container_port":"2222","protocol":"tcp","host_ip":"127.0.0.1","host_port":"44603"},',
				'{"name":"jupyter","container_port":"8888","protocol":"tcp","host_ip":"127.0.0.1","host_port":"35469"}],',
				'"dependencies":[{"name":"via","type":"Python"},{"name":"libgl1","type":"APT"}]}',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		const desc: EnvDescribe = descEnv('ENVD', 'env:name');
		expect(desc.dependencies).not.toBe(undefined);
		expect(desc.ports).not.toBe(undefined);

		const dependencies = desc.dependencies!;
		expect(dependencies.length).toBe(2);
		expect(dependencies[0].name).toBe('via');
		expect(dependencies[0].type).toBe('Python');

		const ports = desc.ports!;
		expect(ports.length).toBe(2);
		expect(ports[0].name).toBe('ssh');
		expect(ports[1].name).toBe('jupyter');
	});
	test('get environment describe of envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => descEnv('ENVD-UNEXIST', 'env:name')).toThrowError('mock-error');
	});
	test('list images', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'[{"name":"gpu:real","endpoint":"/user/envd/bin/gpu","gpu":true,"cuda":"11.2.2",',
				'"cudnn":"8","image_id":"c1a2719d3ff8","created":"About an hour ago","size":"10.7GB"},',
				'{"name":"<none>:<none>","endpoint":"/user/envd/bin/gpu","gpu":true,"cuda":"11.2.2",',
				'"cudnn":"8","image_id":"ddf810b2dec0","created":"About an hour ago","size":"10.7GB"},',
				'{"name":"act:var","endpoint":"/user/envd/bin/var2","gpu":false,',
				'"image_id":"4bb54ef42cfa","created":"6 days ago","size":"892MB"}]',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		const info: ImgInfo[] = listImgs('ENVD');
		expect(info.length).toBe(3);
		expect(info[0].cuda).not.toBeUndefined();
		expect(info[2].cuda).toBeUndefined();
	});
	test('list images when envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => listImgs('ENVD-UNEXIST')).toThrowError('mock-error');
	});
	test('get image describe', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = '{"dependencies":[{"name":"via","type":"Python"},{"name":"libgl1","type":"APT"}]}';
			return Buffer.from(output, 'utf-8');
		});
		const desc: EnvDescribe = descImg('ENVD', 'img:name');
		expect(desc.dependencies).not.toBe(undefined);
		expect(desc.ports).toBe(undefined);

		const dependencies = desc.dependencies!;
		expect(dependencies.length).toBe(2);
		expect(dependencies[0].name).toBe('via');
		expect(dependencies[0].type).toBe('Python');
	});
	test('get image describe of envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => descImg('ENVD-UNEXIST', 'img:name')).toThrowError('mock-error');
	});
	test('list contexts', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = [
				'[{"context":"default","builder":"docker-container",',
				'"builder_addr":"docker-container://envd_buildkitd","runner":"docker","current":true}]',
			].join('');
			return Buffer.from(output, 'utf-8');
		});
		const info: CtxInfo[] = listContexts('ENVD');
		expect(info.length).toBe(1);
		expect(info[0].context).toBe('default');
		expect(info[0].current).toBe(true);
	});
	test('list contexts when envd uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => listContexts('ENVD-UNEXIST')).toThrowError('mock-error');
	});
	test('get envd path from pip', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = '/home/user/.local\n';
			return Buffer.from(output, 'utf-8');
		});
		const path: string = getPipEnvdPath('ENVD');
		expect(path).toBe('/home/user/.local/bin/envd');
	});
	test('get envd path from pip when python uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => getPipEnvdPath('ENVD-UNEXIST')).toThrowError('mock-error');
	});
	test('get LSP Server version', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			const output = 'envd-lsp github.com/tensorchord/envd-lsp v0.3.5+9bb022f';
			return Buffer.from(output, 'utf-8');
		});
		const version: string = getLspVersion('ENVD');
		expect(version).toBe('0.3.5');
	});
	test('get LSP Server version when python uninstalled', () => {
		(proc.execSync as jest.Mock).mockImplementation(_ => {
			throw new Error('mock-error');
		});
		expect(() => getLspVersion('ENVD-UNEXIST')).toThrowError('mock-error');
	});
});

/**
 * Commands call `Envd` and collect their output,
 * will be runned backward by child_process.execSync
 * and the error will be handled by our VSCode format logger
 */
import {execSync} from 'child_process';
import {error, Module} from './logger';

export type EnvdVersion = {
	envd: string;
	// `envd version -s` output above lines
	build_date?: string;
	git_commit?: string;
	git_tree_state?: string;
	git_tag?: string;
	go_version?: string;
	compiler?: string;
	platform?: string;
	// `envd version` default output
	os_type?: string;
	os_version?: string;
	kernel_version?: string;
	docker_host_version?: string;
	container_runtimes?: string;
	default_runtime?: string;
	// `envd version -d` output above lines
};

export function checkEnvdVersion(envdPath: string): string {
	const command = `${envdPath} version --format json`;
	const versionInfo = cmdOutputJsonHandle<EnvdVersion>(command);
	return versionInfo.envd;
}

export type EnvInfo = {
	name: string;
	endpoint?: string;
	ssh_target: string;
	image: string;
	gpu: boolean;
	cuda?: string;
	cudnn?: string;
	status: string;
};

export function listEnvs(envdPath: string): EnvInfo[] {
	const command = `${envdPath} envs ls --format json`;
	const envInfo = cmdOutputJsonHandle<EnvInfo[]>(command);
	return envInfo;
}

export type EnvDescribe = {
	ports?: EnvPort[];
	dependencies?: EnvDependency[];
};
export type EnvPort = {
	name: string;
	container_port: string;
	protocol: string;
	host_ip: string;
	host_port: string;
};

export type EnvDependency = {
	name: string;
	type: string;
};

export function descEnv(envdPath: string, envName: string): EnvDescribe {
	const command = `${envdPath} envs describe --env ${envName} --format json`;
	const envDesc = cmdOutputJsonHandle<EnvDescribe>(command);
	return envDesc;
}

export type ImgInfo = {
	name: string;
	endpoint?: string;
	gpu: boolean;
	cuda?: string;
	cudnn?: string;
	image_id: string;
	created: string;
	size: string;
};

export function listImgs(envdPath: string): ImgInfo[] {
	const command = `${envdPath} image ls --format json`;
	const imgInfo = cmdOutputJsonHandle<ImgInfo[]>(command);
	return imgInfo;
}

export function descImg(envdPath: string, imgName: string): EnvDescribe {
	const command = `${envdPath} image describe --image ${imgName} --format json`;
	const imgDesc = cmdOutputJsonHandle<EnvDescribe>(command);
	return imgDesc;
}

export type CtxInfo = {
	context: string;
	builder: string;
	builder_addr: string;
	runner: string;
	runner_addr?: string;
	current: boolean;
};

export function listContexts(envdPath: string): CtxInfo[] {
	const command = `${envdPath} context ls --format json`;
	const ctxInfo = cmdOutputJsonHandle<CtxInfo[]>(command);
	return ctxInfo;
}

function cmdOutputJsonHandle<T>(command: string): T {
	try {
		const output = execSync(command, {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024}).toString();
		const envInfo: T = JSON.parse(output) as T;
		return envInfo;
	} catch (e) {
		if (e instanceof Error) {
			error(`Failed at exec "${command}", error: ${(e).message}`, Module.MANAGER);
		} else {
			error(`Failed at exec "${command}"`, Module.MANAGER);
		}

		throw e;
	}
}

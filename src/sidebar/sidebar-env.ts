import {type Event, EventEmitter, type TreeDataProvider, type TreeItem} from 'vscode';

import {getEnvdPath} from '../config';
import {descEnv, type EnvDescribe, type EnvInfo, listEnvs} from '../envd-handler';
import {Dependency, DepEntry, DepTypeEntry, EndPointEntry, GPUEntry, groupBy, StatusEntry} from './shared-entry';
import {Environment, ImageTag, Port, PortIPEntry, PortNumEntry, PortProtocolEntry, SSHEntry} from './env-entry';
import {Module, warn} from '../logger';

type EnvItem =
    | Environment | Dependency | Port | DepEntry | DepTypeEntry
    | PortIPEntry | PortNumEntry | PortProtocolEntry
    | EndPointEntry | GPUEntry | StatusEntry | ImageTag | SSHEntry;

type EnvCache = {
	info: EnvInfo;
	desp: EnvDescribe;
};

/**
 * EnvProvider fill data into sidebar tree view sub-panel `Environment`, data will
 * be cached and refreshed from `Envd envs ls` only happen when necessary
 *
 * @var cache path of icon file
 * @method getTreeItem VSCode API implementation, Get TreeItem representation of the element
 * @method getChildren VSCode API implementation, Get the children of element or root if no element is passed.
 * @method refresh refresh sidebar tree view of sub-panel
 * @method refreshCache refresh environment cache
 * @method getCtxInfo get environment infomation from cache
 */
export class EnvProvider implements TreeDataProvider<EnvItem> {
	readonly _onDidChangeTreeData: EventEmitter<EnvItem | undefined | void> = new EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: Event<EnvItem | undefined | void> = this._onDidChangeTreeData.event;

	private cache: EnvCache[] | undefined = undefined;

	refresh(): void {
		this.refreshCache();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: EnvItem): TreeItem {
		return element;
	}

	getChildren(element?: EnvItem): Thenable<EnvItem[]> {
		if (!this.cache) {
			this.refreshCache();
		}

		if (!element) {
			const envShow = this.cache!
				.map((cache, index) => new Environment(cache.info.name, index));
			return Promise.resolve(envShow);
		}

		const env = this.cache![element.parentId];
		switch (element?.contextValue) {
			case 'environment': {
				const envShow: EnvItem[] = [];
				if (env.info.endpoint) {
					envShow.push(new EndPointEntry(env.info.endpoint, element.parentId));
				}

				envShow.push(new SSHEntry(env.info.ssh_target, element.parentId));
				envShow.push(new ImageTag(env.info.image, element.parentId));
				if (env.info.gpu) {
					const cuda = env.info.cuda ? env.info.cuda : '<none>';
					const cudnn = env.info.cudnn ? env.info.cudnn : '<none>';
					envShow.push(new GPUEntry(`CUDA: ${cuda} | CUDNN: ${cudnn}`, element.parentId));
				} else {
					envShow.push(new GPUEntry('unsupported', element.parentId));
				}

				envShow.push(new StatusEntry(env.info.status, element.parentId));
				if (env.desp.dependencies) {
					envShow.push(new Dependency(element.parentId));
				}

				const ports = env.desp.ports?.map((port, index) => new Port(port.name, index, element.parentId));
				return Promise.resolve(ports ? [...envShow, ...ports] : envShow);
			}

			case 'dependency': {
				const results = groupBy(env.desp.dependencies!, i => i.type);
				return Promise.resolve(Object.keys(results).map(typeName => new DepTypeEntry(typeName, element.parentId)));
			}

			case 'dependency-type':
			{
				const depShow = env.desp.dependencies?.filter(dep => dep.type === (element as DepTypeEntry).type).map(dep => new DepEntry(dep.name, element.parentId));
				return Promise.resolve(depShow ? depShow : []);
			}

			case 'port': {
				const portInfo = env.desp.ports![(element as Port).port];
				const portDesp: EnvItem[] = [];
				portDesp.push(new PortNumEntry(portInfo.container_port, 'Container Port', element.parentId));
				portDesp.push(new PortProtocolEntry(portInfo.protocol, element.parentId));
				portDesp.push(new PortIPEntry(portInfo.host_ip, 'Host IP', element.parentId));
				portDesp.push(new PortNumEntry(portInfo.host_port, 'Host Port', element.parentId));
				return Promise.resolve(portDesp);
			}

			default:
				return Promise.resolve([]);
		}
	}

	refreshCache() {
		const envdPath = getEnvdPath();
		const envInfoCollect = listEnvs(envdPath).filter(envInfo => {
			if (envInfo.name.includes('<none>')) {
				warn('An environment couldn\'t be recognized, use command "envd env ls" to check environment of <none> tag', Module.MANAGER);
				return false;
			}

			return true;
		});

		this.cache = [];

		const envShowCollect = envInfoCollect.map(envInfo => {
			const desp = descEnv(envdPath, envInfo.name);
			return desp;
		});
		this.cache = envInfoCollect.map((envInfo, index) => ({info: envInfo, desp: envShowCollect[index]!}));
	}

	getEnvInfo(name: string): EnvInfo | undefined {
		if (!this.cache) {
			return undefined;
		}

		const result = this.cache?.filter(cache => cache.info.name === name);
		if (result.length !== 1) {
			return undefined;
		}

		return result[0].info;
	}
}

import {type TreeDataProvider, EventEmitter, type Event, type TreeItem} from 'vscode';
import {getEnvdPath} from '../config';
import {type CtxInfo, listContexts} from '../operation/cmd-back';
import {Module, warn} from '../logger';
import {Builder, BuilderAddress, ContextCurrent, ContextOther, Runner, RunnerAddress} from './context-entry';

type CtxItem = ContextCurrent | ContextOther | Builder | BuilderAddress | Runner | RunnerAddress;

type ContextCache = {
	info: CtxInfo;
};

/**
 * CtxProvider fill data into sidebar tree view sub-panel `Context`, data will
 * be cached and refreshed from `Envd context ls` only happen when necessary
 *
 * @var cache cache of all context information
 * @method getTreeItem VSCode API implementation, Get TreeItem representation of the element
 * @method getChildren VSCode API implementation, Get the children of element or root if no element is passed.
 * @method refresh refresh sidebar tree view of sub-panel
 * @method refreshCache refresh context cache
 * @method getCtxInfo get context infomation from cache
 */
export class CtxProvider implements TreeDataProvider<CtxItem> {
	readonly _onDidChangeTreeData: EventEmitter<CtxItem | undefined | void> = new EventEmitter<CtxItem | undefined | void>();
	readonly onDidChangeTreeData: Event<CtxItem | undefined | void> = this._onDidChangeTreeData.event;

	private cache: ContextCache[] | undefined = undefined;

	refresh(): void {
		this.refreshCache();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: CtxItem): TreeItem {
		return element;
	}

	getChildren(element?: CtxItem): Thenable<CtxItem[]> {
		if (!this.cache) {
			this.refreshCache();
		}

		if (!element) {
			const ctxShow = this.cache!
				.map((cache, index) => {
					switch (cache.info.current) {
						case true:
							return new ContextCurrent(cache.info.context, index);
						default:
							return new ContextOther(cache.info.context, index);
					}
				});
			return Promise.resolve(ctxShow);
		}

		const ctx = this.cache![element.parentId];
		switch (element?.contextValue) {
			case 'context': {
				const showDesp: CtxItem[] = [];
				showDesp.push(new Builder(ctx.info.builder, element.parentId));
				showDesp.push(new BuilderAddress(ctx.info.builder_addr, element.parentId));
				showDesp.push(new Runner(ctx.info.runner, element.parentId));
				if (ctx.info.runner_addr) {
					showDesp.push(new RunnerAddress(ctx.info.runner_addr, element.parentId));
				}

				return Promise.resolve(showDesp);
			}

			default:
				return Promise.resolve([]);
		}
	}

	refreshCache() {
		const path = getEnvdPath();
		const ctxInfoCollect = listContexts(path).filter(ctxInfo => {
			if (ctxInfo.context.includes('<none>')) {
				warn('A context couldn\'t be recognized, use command "envd context ls" to check environment of <none> tag', Module.MANAGER);
				return false;
			}

			return true;
		});

		this.cache = ctxInfoCollect.map(ctxInfo => ({info: ctxInfo}));
	}

	getCtxInfo(name: string): CtxInfo | undefined {
		if (!this.cache) {
			return undefined;
		}

		const result = this.cache?.filter(cache => cache.info.context === name);
		if (result.length !== 1) {
			return undefined;
		}

		return result[0].info;
	}
}

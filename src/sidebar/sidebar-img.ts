import {type Event, EventEmitter, type TreeDataProvider, type TreeItem} from 'vscode';
import {getEnvdPath} from '../config';
import {descImg, type EnvDescribe, type ImgInfo, listImgs} from '../envd-handler';
import {Module, warn} from '../logger';
import {IdEntry, Image, SizeEntry} from './img-entry';
import {Dependency, DepEntry, DepTypeEntry, EndPointEntry, GPUEntry, groupBy, StatusEntry} from './shared-entry';

type ImgItem = Image | EndPointEntry | GPUEntry | IdEntry | SizeEntry | StatusEntry;

type ImgCache = {
	info: ImgInfo;
	desp: EnvDescribe;
};

/**
 * ImgProvider fill data into sidebar tree view sub-panel `Image`, data will 
 * be cached and refreshed from `Envd envs ls` only happen when necessary
 * 
 * @var cache cache of all image information
 * @method getTreeItem VSCode API implementation, Get TreeItem representation of the element
 * @method getChildren VSCode API implementation, Get the children of element or root if no element is passed.
 * @method refresh refresh sidebar tree view of sub-panel
 * @method refreshCache refresh image cache
 * @method getCtxInfo get image infomation from cache
 */
export class ImgProvider implements TreeDataProvider<ImgItem> {
	readonly _onDidChangeTreeData: EventEmitter<ImgItem | undefined | void> = new EventEmitter<ImgItem | undefined | void>();
	readonly onDidChangeTreeData: Event<ImgItem | undefined | void> = this._onDidChangeTreeData.event;

	private cache: ImgCache[] | undefined = undefined;

	refresh(): void {
		this.refreshCache();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: ImgItem): TreeItem {
		return element;
	}

	getChildren(element?: ImgItem): Thenable<ImgItem[]> {
		if (!this.cache) {
			this.refreshCache();
		}

		if (!element) {
			const imgShow = this.cache!
				.map((cache, index) => new Image(cache.info.name, index));
			return Promise.resolve(imgShow);
		}

		const img = this.cache![element.parentId];
		switch (element?.contextValue) {
			case 'image': {
				const imgShow: ImgItem[] = [];
				if (img.info.endpoint) {
					imgShow.push(new EndPointEntry(img.info.endpoint, element.parentId));
				}

				if (img.info.gpu) {
					const cuda = img.info.cuda ? img.info.cuda : '<none>';
					const cudnn = img.info.cudnn ? img.info.cudnn : '<none>';
					imgShow.push(new GPUEntry(`CUDA: ${cuda} | CUDNN: ${cudnn}`, element.parentId));
				} else {
					imgShow.push(new GPUEntry('unsupported', element.parentId));
				}

				imgShow.push(new IdEntry(img.info.image_id, element.parentId));
				imgShow.push(new SizeEntry(img.info.size, element.parentId));
				imgShow.push(new StatusEntry(img.info.created, element.parentId));
				if (img.desp.dependencies) {
					imgShow.push(new Dependency(element.parentId));
				}

				return Promise.resolve(imgShow);
			}

			case 'dependency': {
				const results = groupBy(img.desp.dependencies!, i => i.type);
				return Promise.resolve(Object.keys(results).map(typeName => new DepTypeEntry(typeName, element.parentId)));
			}

			case 'dependency-type':
			{
				const depShow = img.desp.dependencies?.filter(dep => dep.type === (element as DepTypeEntry).type).map(dep => new DepEntry(dep.name, element.parentId));
				return Promise.resolve(depShow ? depShow : []);
			}

			default:
				return Promise.resolve([]);
		}
	}

	refreshCache() {
		const path = getEnvdPath();
		const imgInfoCollect = listImgs(path).filter(imgInfo => {
			if (imgInfo.name.includes('<none>')) {
				warn('An image couldn\'t be recognized, use command "envd image ls" to check environment of <none> tag', Module.MANAGER);
				return false;
			}

			return true;
		});

		this.cache = [];

		const imgShowCollect = imgInfoCollect.map(imgInfo => {
			const desp = descImg(path, imgInfo.name);
			return desp;
		});

		this.cache = imgInfoCollect.map((imgInfo, index) => ({info: imgInfo, desp: imgShowCollect[index]!}));
	}

	getImgInfo(name: string): ImgInfo | undefined {
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

import path from 'path';
import {TreeItem, TreeItemCollapsibleState} from 'vscode';

export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
	arr.reduce<Record<K, T[]>>((groups, item) => {
		(groups[key(item)] ||= []).push(item);
		return groups;
	}, {} as Record<K, T[]>);// eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter

export abstract class EnvdTreeItem extends TreeItem {
	parentId: number;

	constructor(
		label: string,
		state: TreeItemCollapsibleState,
		parentId: number,
	) {
		super(label, state);
		this.parentId = parentId;
	}
}

/**
 * Entry of common endpoint of environment/image
 *
 * @param value endpoint address
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 * @see Image is its parent at sidebar menu
 */
export class EndPointEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'debug-step-into.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'debug-step-into.svg'),
	};

	contextValue = 'endpoint';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'Available endPoint for environment or image';
		this.description = 'EndPoint';
	}
}

/**
 * Entry of status of environment/image
 *
 * @param value status description
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 * @see Image is its parent at sidebar menu
 */
export class StatusEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'dashboard.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'dashboard.svg'),
	};

	contextValue = 'status';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'Running status of the environment or image';
		this.description = 'Status';
	}
}

/**
 * Entry of GPU support of environment/image
 *
 * @param value GPU support information
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 * @see Image is its parent at sidebar menu
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class GPUEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'DVI_dvi.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'DVI_dvi.svg'),
	};

	contextValue = 'gpu';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'Whether the environment support GPU. If so, will display CUDA and CUDNN for it.';
		this.description = 'GPU Support';
	}
}

/**
 * Entry of dependency panel of environment/image
 *
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 * @see Image is its parent at sidebar menu
 */
export class Dependency extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'extensions.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'extensions.svg'),
	};

	contextValue = 'dependency';

	constructor(
		parentId: number,
	) {
		super('dependency', TreeItemCollapsibleState.Collapsed, parentId);

		this.tooltip = 'The dependencies of environment';
		this.description = undefined;
	}
}

/**
 * Entry of a dependency type of environment/image
 *
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Dependency is its parent at sidebar menu
 */
export class DepTypeEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'layers.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'layers.svg'),
	};

	contextValue = 'dependency-type';

	type: string;

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.Collapsed, parentId);

		this.tooltip = undefined;
		this.description = undefined;
		this.type = value;
	}
}

/**
 * Entry of a dependency of environment/image
 *
 * @param parentId index of environment/image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see DepTypeEntry is its parent at sidebar menu
 */
export class DepEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'package.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'package.svg'),
	};

	contextValue = 'dependency-entry';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = undefined;
		this.description = undefined;
	}
}


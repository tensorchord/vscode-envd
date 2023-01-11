import path from 'path';
import {TreeItemCollapsibleState} from 'vscode';
import {EnvdTreeItem} from './shared-entry';

/**
 * Entry of panel of a environment
 *
 * @param value context name
 * @param index index of this environment
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 */
export class Environment extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'symbol-field.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'symbol-field.svg'),
	};

	contextValue = 'environment';

	constructor(
		value: string,
		index: number,
	) {
		super(value, TreeItemCollapsibleState.Expanded, index);

		this.tooltip = 'Information of an environment';
		this.description = undefined;
	}
}

/**
 * Entry of SSH endpoint of environment
 *
 * @param value ssh endpoint alias
 * @param parentId index of environment that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class SSHEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'link-three.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'link-three.svg'),
	};

	contextValue = 'ssh';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'SSH EndPoint for environment';
		this.description = 'SSH';
	}
}

/**
 * Entry of image tag of environment
 *
 * @param value image tag
 * @param parentId index of environment that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 */
export class ImageTag extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'tag.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'tag.svg'),
	};

	contextValue = 'image';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'Image tag of environment';
		this.description = 'Image';
	}
}

/**
 * Entry of port panel of environment
 *
 * @param name image tag
 * @param index index of this port
 * @param parentId index of environment that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Environment is its parent at sidebar menu
 */
export class Port extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'symbol-property.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'symbol-property.svg'),
	};

	contextValue = 'port';

	port: number;

	constructor(
		name: string,
		index: number,
		parentId: number,
	) {
		super(`port-${name}`, TreeItemCollapsibleState.Collapsed, parentId);

		this.tooltip = 'The port of environment';
		this.description = undefined;
		this.port = index;
	}
}

/**
 * Entry of port number of environment
 *
 * @param value port number
 * @param target port name that entry belongs to
 * @param parentId index of environment that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Port is its parent at sidebar menu
 */
export class PortNumEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'api.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'api.svg'),
	};

	contextValue = 'port-number';

	constructor(
		value: string,
		target: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = `Port number for ${target}`;
		this.description = target;
	}
}

/**
 * Entry of port IP address of environment
 *
 * @param value IP address
 * @param target port name that entry belongs to
 * @param parentId index of environment that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Port is its parent at sidebar menu
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class PortIPEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'earth.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'earth.svg'),
	};

	contextValue = 'port-adr';

	constructor(
		value: string,
		target: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = `IP address of ${target}`;
		this.description = target;
	}
}

export class PortProtocolEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'agreement.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'agreement.svg'),
	};

	contextValue = 'port-protocol';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'Used protocol for port';
		this.description = 'Protocol';
	}
}

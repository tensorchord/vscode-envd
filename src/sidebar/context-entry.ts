import path from 'path';
import {TreeItemCollapsibleState} from 'vscode';
import {EnvdTreeItem} from './shared-entry';

/**
 * Entry of current used context
 * 
 * @param value context name
 * @param index index of this context
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 */
export class ContextCurrent extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'star-full.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'star-full.svg'),
	};

	contextValue = 'context';

	constructor(
		value: string,
		index: number,
	) {
		super(value, TreeItemCollapsibleState.Collapsed, index);

		this.tooltip = 'Current context';
		this.description = 'Current';
	}
}

/**
 * Entry of other(not used) context
 * 
 * @param value context name
 * @param index index of this context
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 */
export class ContextOther extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'star-empty.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'star-empty.svg'),
	};

	contextValue = 'context';

	constructor(
		value: string,
		index: number,
	) {
		super(value, TreeItemCollapsibleState.Collapsed, index);

		this.tooltip = undefined;
		this.description = undefined;
	}
}

/**
 * Entry of builder of a context
 * 
 * @param value builder name
 * @param parentId Index of context that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see ContextCurrent is its parent at sidebar menu
 * @see ContextOther is its parent at sidebar menu
 */
export class Builder extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'symbol-property.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'symbol-property.svg'),
	};

	contextValue = 'builder';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'The name of builder';
		this.description = 'Builder';
	}
}

/**
 * Entry of builder address of a context
 * 
 * @param value builder address
 * @param parentId Index of context that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see ContextCurrent is its parent at sidebar menu
 * @see ContextOther is its parent at sidebar menu
 */
export class BuilderAddress extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'earth.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'earth.svg'),
	};

	contextValue = 'builder-adr';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'The address of builder';
		this.description = 'Builder Address';
	}
}

/**
 * Entry of runner of a context
 * 
 * @param value runner name
 * @param parentId Index of context that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see ContextCurrent is its parent at sidebar menu
 * @see ContextOther is its parent at sidebar menu
 */
export class Runner extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'pinned.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'pinned.svg'),
	};

	contextValue = 'runner';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'The name of runner';
		this.description = 'Runner';
	}
}

/**
 * Entry of runner address of a context
 * 
 * @param value runner address
 * @param parentId Index of context that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see ContextCurrent is its parent at sidebar menu
 * @see ContextOther is its parent at sidebar menu
 */
export class RunnerAddress extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'earth.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'earth.svg'),
	};

	contextValue = 'runner-adr';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = 'The address of runner';
		this.description = 'Runner Address';
	}
}

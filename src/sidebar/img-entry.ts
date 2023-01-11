import path from 'path';
import {TreeItemCollapsibleState} from 'vscode';
import {EnvdTreeItem} from './shared-entry';

/**
 * Entry of panel of a image
 *
 * @param value context name
 * @param index index of this image
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 */
export class Image extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'tag.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'tag.svg'),
	};

	contextValue = 'image';

	constructor(
		value: string,
		index: number,
	) {
		super(value, TreeItemCollapsibleState.Collapsed, index);

		this.tooltip = 'Information of an image';
		this.description = undefined;
	}
}

/**
 * Entry of digest ID of image
 *
 * @param value digest ID
 * @param parentId index of image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Image is its parent at sidebar menu
 */
export class IdEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'key.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'key.svg'),
	};

	contextValue = 'id';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = undefined;
		this.description = 'ID';
	}
}

/**
 * Entry of size of image
 *
 * @param value image size
 * @param parentId index of image that entry belongs to
 * @var iconPath path of icon file
 * @var contextValue unique ID of this entry, could be used in package.json
 * @see Image is its parent at sidebar menu
 */
export class SizeEntry extends EnvdTreeItem {
	iconPath = {
		light: path.join(__filename, '..', '..', 'media', 'light', 'database.svg'),
		dark: path.join(__filename, '..', '..', 'media', 'dark', 'database.svg'),
	};

	contextValue = 'size';

	constructor(
		value: string,
		parentId: number,
	) {
		super(value, TreeItemCollapsibleState.None, parentId);

		this.tooltip = undefined;
		this.description = 'Size';
	}
}

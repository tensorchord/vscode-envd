// Copyright 2022 The envd Authors
// Copyright 2022 The tilt Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {type Uri, window, workspace} from 'vscode';
import {info, Module, warn} from './logger';
import {getPipEnvdPath} from './operation/cmd-back';

export const fallbackEnvdPath = 'envd';
export const fallbackPythonPath = 'python3';

export function getConfig(uri?: Uri) {
	const section = 'envd';
	if (!uri) {
		if (window.activeTextEditor) {
			uri = window.activeTextEditor.document.uri;
		}
	}

	return workspace.getConfiguration(section, uri);
}

export type Port = number | undefined;
export function getServerPort(): Port {
	return getConfig().get<Port>('server.port');
}

export function getTrace(): boolean {
	return getConfig().get<boolean>('server.trace')!;
}

export function getcheckVersion(): boolean {
	return getConfig().get<boolean>('intall.checkVersion')!;
}

export enum EnvdLocation {
	PIP,
	PATH,
}
export function getEnvdLocation(): EnvdLocation {
	const mode = getConfig().get<string>('intall.envdLocation');
	switch (mode) {
		case 'pip package manager':
			return EnvdLocation.PIP;
		case 'raw path':
			return EnvdLocation.PATH;
		default:
			warn(`invalid config option "${mode ?? 'undefined'}" for envd.intall.envdLocation, fallback to "pip package manager"`, Module.CONFIG);
			return EnvdLocation.PIP;
	}
}

export enum VersionSource {
	PYPI = 'PYPI',
	GITHUB = 'GITHUB',
}
export function getVersionSource(): VersionSource {
	const mode = getConfig().get<string>('intall.versionCheckSource');
	switch (mode) {
		case 'pypi':
			return VersionSource.PYPI;
		case 'Github':
			return VersionSource.GITHUB;
		default:
			warn(`invalid config option "${mode ?? 'undefined'}" for envd.intall.versionCheckSource, fallback to "pypi"`, Module.CONFIG);
			return VersionSource.PYPI;
	}
}

export function getPythonPath(): string {
	const pythonPath = getConfig().get<string>('intall.python.pythonPath');
	if (!pythonPath) {
		warn(`invalid config option "${pythonPath ?? 'undefined'}" for envd.intall.pip.pythonPath, fallback to ${fallbackPythonPath}`, Module.CONFIG);
		return fallbackPythonPath;
	}

	return pythonPath;
}

export function getPypiMirror(): string | undefined {
	const pypiMirror = getConfig().get<string>('intall.python.indexUrl');
	if (!pypiMirror) {
		return undefined;
	}

	info(`pypi mirror exists, will use "${pypiMirror}" at pip install`, Module.CONFIG);

	return pypiMirror;
}

export function getEnvdPath(): string {
	const mode = getEnvdLocation();
	const pythonPath = getPythonPath();
	let path: string | undefined;
	switch (mode) {
		case EnvdLocation.PIP:
			path = getPipEnvdPath(pythonPath);
			break;
		case EnvdLocation.PATH:
			path = getConfig().get<string>('intall.path.envdPath');
			break;
		default:
			warn('invalid config option "undefined" for envd.intall.envdLocation, unable to deduced envd path, fallback to "envd"', Module.CONFIG);
			break;
	}

	if (!path) {
		return fallbackEnvdPath;
	}

	return path;
}

export function getShowStatusBarButton(): boolean {
	return getConfig().get<boolean>('showStatusBarButton')!;
}

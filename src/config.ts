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

export const envd = 'envd';

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

export function getEnvdPath(): string {
	const path = getConfig().get<string>('envd.path');
	if (!path) {
		return envd;
	}

	return path;
}

export function getShowStatusBarButton(): boolean {
	return getConfig().get<boolean>('showStatusBarButton')!;
}

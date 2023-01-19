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

import {type ExtensionContext, window, commands} from 'vscode';
import {EnvdLspClient} from './envd-lsp-client';
import {envdChannel, Module, warn, info} from './logger';
import {attachSSH, attachWindow, askDestroyEnvironment, askRemoveImage, askRemoveContext, envdUseContext, attachEndpoint} from './vscode-ops';
import {type ContextCurrent, type ContextOther} from './sidebar/context-entry';
import {type Environment} from './sidebar/env-entry';
import {type Image} from './sidebar/img-entry';
import {type EndPointEntry} from './sidebar/shared-entry';
import {CtxProvider} from './sidebar/sidebar-context';
import {EnvProvider} from './sidebar/sidebar-env';
import {ImgProvider} from './sidebar/sidebar-img';
import {getcheckVersion, getShowStatusBarButton} from './config';
import {VersionManager} from './version-manager';

let client: EnvdLspClient;

export async function activate(context: ExtensionContext) {
	client = new EnvdLspClient(context, envdChannel);
	client.start();

	const manager = new VersionManager();
	const enableEnvdCheck = getcheckVersion();
	void manager.check(enableEnvdCheck);

	const sidebarEnable = getShowStatusBarButton();
	if (sidebarEnable) {
		registerSidebar();
	}
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	return client.stop();
}

function registerSidebar() {
	const envProvider = new EnvProvider();
	const imgProvider = new ImgProvider();
	const ctxProvider = new CtxProvider();
	window.registerTreeDataProvider('envd-environment', envProvider);
	window.registerTreeDataProvider('envd-image', imgProvider);
	window.registerTreeDataProvider('envd-context', ctxProvider);

	commands.registerCommand('envd-environment.refresh', () => {
		envProvider.refresh();
	});
	commands.registerCommand('envd-image.refresh', () => {
		imgProvider.refresh();
	});
	commands.registerCommand('envd-context.refresh', () => {
		ctxProvider.refresh();
	});

	commands.registerCommand('environment.attach-ssh', (node: Environment) => {
		const info = envProvider.getEnvInfo(node.label as string);
		if (!info) {
			warn('Get environment infomation failed', Module.MANAGER);
			return;
		}

		attachSSH(info);
	});
	commands.registerCommand('environment.attach-window', (node: Environment) => {
		const info = envProvider.getEnvInfo(node.label as string);
		if (!info) {
			warn('Get environment infomation failed', Module.MANAGER);
			return;
		}

		void attachWindow(info);
	});
	commands.registerCommand('endpoint.attach-endpoint', (node: EndPointEntry) => {
		attachEndpoint(node.label as string);
	});
	commands.registerCommand('environment.destroy', async (node: Environment) => {
		const info = envProvider.getEnvInfo(node.label as string);
		if (!info) {
			warn('Get environment infomation failed', Module.MANAGER);
			return;
		}

		await askDestroyEnvironment(info);
		envProvider.refresh();
		imgProvider.refresh();
	});

	commands.registerCommand('image.remove', async (node: Image) => {
		const info = imgProvider.getImgInfo(node.label as string);
		if (!info) {
			warn('Get image infomation failed', Module.MANAGER);
			return;
		}

		await askRemoveImage(info);
		imgProvider.refresh();
	});

	commands.registerCommand('context.use', async (node: ContextCurrent | ContextOther) => {
		const info = ctxProvider.getCtxInfo(node.label as string);
		if (!info) {
			warn('Get context infomation failed', Module.MANAGER);
			return;
		}

		await envdUseContext(info);
		ctxProvider.refresh();
	});
	commands.registerCommand('context.remove', async (node: ContextCurrent | ContextOther) => {
		const info = ctxProvider.getCtxInfo(node.label as string);
		if (!info) {
			warn('Get context infomation failed', Module.MANAGER);
			return;
		}

		await askRemoveContext(info);
		ctxProvider.refresh();
	});
}

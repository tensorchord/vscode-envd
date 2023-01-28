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

import net from 'net';
import path from 'path';
import process from 'process';
import {type ChildProcess, spawn} from 'child_process';
import {
	commands,
	type Disposable,
	type ExtensionContext,
	type OutputChannel,
	window,
	workspace,
} from 'vscode';
import {
	LanguageClient,
	type LanguageClientOptions,
	type StreamInfo,
} from 'vscode-languageclient/node';

import {PlaceholderErrorHandler, EnvdErrorHandler} from './error-handlers';
import {getServerPort, getTrace, type Port} from './config';
import {Module} from './logger';

export const extensionLang = 'envd';
const extensionName = 'envd';
const maxRestartCount = 5;
const envdUnavailableNotification = 'envd language server could not be started';
const envdUnavailableMessage
    = 'Could not find a version of envd to use with the envd extension. '
    + 'Please visit https://envd.tensorchord.ai/docs/get-started to install envd.'
    + 'Autocomplete will not function without a compatible version of envd installed.';

export let lspPath: string;
switch (process.platform) {
	case 'darwin':
		lspPath = path.join(__dirname, '../bin/envd-lsp_Darwin_all');
		break;
	case 'linux':
		lspPath = path.join(__dirname, '../bin/envd-lsp_Linux_x86_64');
		break;
	default:
		break;
}

export class EnvdLspClient extends LanguageClient {
	static clientOptions(ch: OutputChannel): LanguageClientOptions {
		return {
			documentSelector: [{scheme: 'file', language: extensionLang}],
			synchronize: {
				// Notify the server about file changes to relevant files contained in the workspace
				fileEvents: workspace.createFileSystemWatcher('**/*.envd'),
			},
			outputChannel: ch,
			traceOutputChannel: ch,
			errorHandler: new PlaceholderErrorHandler(),
		};
	}

	private _usingDebugServer = false;

	public constructor(private readonly context: ExtensionContext, ch: OutputChannel) {
		super(
			extensionLang,
			extensionName,
			async () => this.startServer(),
			EnvdLspClient.clientOptions(ch),
		);
		this.registerCommands();
		this.installErrorHandler();
	}

	public get usingDebugServer() {
		return this._usingDebugServer;
	}

	public start(): Disposable {
		const disp = super.start();
		this.info('envd LSP Server started');
		return disp;
	}

	public registerCommands() {
		this.context.subscriptions.push(
			commands.registerCommand('envd.restartServer', () => {
				this.info('Restarting server');
				this.restart();
			}),
		);
	}

	public restart(): void {
		void this.stop()
			.catch(e => {
				this.warn(e);
			})
			.then(() => this.start());
	}

	public info(message: string) {
		super.info(`${Module.LSP} ` + message);
	}

	public warn(message: string) {
		super.warn(`${Module.LSP} ` + message);
	}

	public error(message: string) {
		super.error(`${Module.LSP} ` + message);
	}

	private async startServer(): Promise<ChildProcess | StreamInfo> {
		const port = await this.checkForDebugLspServer();
		if (port) {
			this.info('Connect to debug server');
			this._usingDebugServer = true;
			this.outputChannel.show(true);
			const socket = net.connect({host: '127.0.0.1', port});
			return {writer: socket, reader: socket};
		}

		try {
			const args: string[] = [];
			this.info('Starting child process');
			const trace = getTrace();
			switch (trace) {
				case true:
					this.outputChannel.show(true);
					args.push('--debug');
					break;
				default:
					break;
			}

			args.push('lsp');
			return spawn(lspPath, args);
		} catch (e) {
			this.warn(envdUnavailableMessage);
			this.outputChannel.show();
			void window.showErrorMessage(envdUnavailableNotification);
			throw e;
		}
	}

	private async checkForDebugLspServer(): Promise<Port> {
		const port = getServerPort();
		if (port === undefined) {
			return undefined;
		}

		return new Promise(resolve => {
			const checkListen = () => {
				const server = net.createServer();
				server.on('error', () => {
					resolve(port);
				});
				server.on('listening', () => {
					server.close();
					resolve(undefined);
				});
				server.listen(port, '127.0.0.1');
			};

			if (this.usingDebugServer) {
				// Wait for server to restart
				setTimeout(checkListen, 2500);
			} else {
				checkListen();
			}
		});
	}

	private installErrorHandler() {
		const placeholder = this.clientOptions
			.errorHandler as PlaceholderErrorHandler;
		placeholder.delegate = new EnvdErrorHandler(this, maxRestartCount);
	}
}

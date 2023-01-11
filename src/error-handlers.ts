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

import {
	CloseAction,
	type ErrorAction,
	type ErrorHandler,
	type Message,
} from 'vscode-languageclient';
import {type EnvdLspClient} from './envd-lsp-client';

export class PlaceholderErrorHandler implements ErrorHandler {
	public delegate!: ErrorHandler;

	error(error: Error, message: Message, count: number): ErrorAction {
		return this.delegate.error(error, message, count);
	}

	closed(): CloseAction {
		return this.delegate.closed();
	}
}

export class EnvdErrorHandler extends PlaceholderErrorHandler {
	constructor(private readonly client: EnvdLspClient, maxRestartCount: number) {
		super();
		this.delegate = this.client.createDefaultErrorHandler(maxRestartCount);
	}

	closed(): CloseAction {
		// Default error handler backs off after several restarts;
		// always restart when using the debug server
		if (this.client.usingDebugServer) {
			return CloseAction.Restart;
		}

		return this.delegate.closed();
	}
}

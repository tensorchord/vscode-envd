import {window} from 'vscode';

export const envdChannel = window.createOutputChannel('envd');

export enum Module {
	LSP = '[LSP]',
	MANAGER = '[MANAGER]',
	INSTALL = '[INSTALL]',
	CONFIG = '[CONFIG]',
}

export function info(message: string, module: Module) {
	const time = new Date().toLocaleTimeString('en-US');
	envdChannel.appendLine(`[Info  - ${time}] ${module} ${message}`);
}

export function warn(message: string, module: Module) {
	const time = new Date().toLocaleTimeString('en-US');
	envdChannel.appendLine(`[Warn  - ${time}] ${module} ${message}`);
}

export function error(message: string, module: Module) {
	const time = new Date().toLocaleTimeString('en-US');
	envdChannel.appendLine(`[Error  - ${time}] ${module} ${message}`);
}

export function errorMessage(err: unknown) {
	if (typeof err === 'string') {
		return err;
	}

	if (err instanceof Error) {
		return err.message;
	}

	return 'unknown';
}

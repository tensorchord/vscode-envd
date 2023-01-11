import {commands, extensions, type MessageOptions, window, Uri, env, type Terminal} from 'vscode';
import * as logger from './logger';
import {getEnvdPath} from './config';
import {type CtxInfo, type EnvInfo, type ImgInfo} from './envd-handler';

/**
 * VSCode workflow for do an operation, works with VSCode window API
 */

/**
 * Attach into a environment by ssh in VSCode terminal
 * @param info infomation of environment
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function attachSSH(info: EnvInfo) {
	logger.info(`Attach environment ${info.name} to ssh`, logger.Module.MANAGER);
	const terminal = window.createTerminal(info.ssh_target);
	terminal.show();
	terminal.sendText(`ssh ${info.ssh_target}`);
}

type OpenWindowsArgs = {
	host: string;
	userName?: string;
	port?: number;
};

/**
 * Attach into a environment by ssh at new VSCode window
 * @param info infomation of environment
 */
export async function attachWindow(info: EnvInfo) {
	logger.info(`Attach environment ${info.name} to VSCode`, logger.Module.MANAGER);
	const extensionName = 'ms-vscode-remote.remote-ssh';
	// Guide the users to install Microsoft Remote SSH.
	const extensionAvailable = extensions.getExtension(extensionName);
	if (!extensionAvailable) {
		logger.info(`Request installation of "${extensionName}" extension`, logger.Module.MANAGER);
		await commands.executeCommand('extension.open', extensionName);
		const message = 'It is recommended to install Microsoft Remote-SSH to enable attach to VSCode. Do you want to install it now?';
		const choice = await window.showInformationMessage(message, 'Install', 'Not now');
		if (choice === 'Install') {
			logger.info(`Install "${extensionName}" extension`, logger.Module.MANAGER);
			await commands.executeCommand('workbench.extensions.installExtension', extensionName);
		} else {
			logger.info('Installation is cancelled', logger.Module.MANAGER);
			return;
		}
	}

	const openWindowArgs: OpenWindowsArgs = {
		host: info.ssh_target,
	};
	await commands.executeCommand(
		'opensshremotes.openEmptyWindow', openWindowArgs);
}

/**
 * Open a endpoint at browser
 * @param endpoint endpoint url address
 */
export function attachEndpoint(endpoint: string) {
	logger.info(`Attach endpoint ${endpoint}`, logger.Module.MANAGER);
	const [_, address] = endpoint.split(': ');
	void env.openExternal(Uri.parse(address));
}

/**
 *
 * @param info
 */
export async function envdUseContext(info: CtxInfo) {
	logger.info(`Request to use ${info.context} context`, logger.Module.MANAGER);
	if (info.current) {
		const warnMessage = `The context ${info.context} is already in use`;
		void window.showWarningMessage(warnMessage);
		logger.warn(warnMessage, logger.Module.MANAGER);
	}

	const envdPath = getEnvdPath();
	useContext(envdPath, info.context);
}

/**
 * User ask to destroy a environment, need them to confirm operation
 * @param info infomation of environment
 */
export async function askDestroyEnvironment(info: EnvInfo) {
	logger.info(`Request destroy of ${info.name} environment`, logger.Module.MANAGER);
	const header = 'Destroy Environment';
	const options: MessageOptions = {detail: `The environment ${info.name} will be permanently deleted, this operation can't be undone.`, modal: true};
	await window.showInformationMessage(header, options, ...['Ok']).then(item => {
		if (item === 'Ok') {
			const envdPath = getEnvdPath();
			destroyEnvironment(envdPath, info.name);
			logger.info('Destroy finished', logger.Module.MANAGER);
		} else {
			logger.info('Destroy is cancelled', logger.Module.MANAGER);
		}
	});
}

/**
 * User ask to remove a image, need them to confirm operation
 * @param info infomation of image
 */
export async function askRemoveImage(info: ImgInfo) {
	logger.info(`Request remove of ${info.name} image`, logger.Module.MANAGER);
	const header = 'Destroy Image';
	const options: MessageOptions = {detail: `The image ${info.name} will be permanently deleted, this operation can't be undone.`, modal: true};
	await window.showInformationMessage(header, options, ...['Ok']).then(item => {
		if (item === 'Ok') {
			const envdPath = getEnvdPath();
			const [name, tag] = info.name.split(':');
			removeImage(envdPath, name, tag);
			logger.info('Remove finished', logger.Module.MANAGER);
		} else {
			logger.info('Remove is cancelled', logger.Module.MANAGER);
		}
	});
}

/**
 * User ask to remove a context, need them to confirm operation
 * @param info infomation of context
 */
export async function askRemoveContext(info: CtxInfo) {
	logger.info(`Request remove of ${info.context} context`, logger.Module.MANAGER);
	if (info.current) {
		const showInfo = 'Current context couldn\'t be removed, please use another context first.';
		logger.info(showInfo, logger.Module.MANAGER);
		void window.showErrorMessage(showInfo);
		return;
	}

	const header = 'Destroy context';
	const options: MessageOptions = {detail: `The context ${info.context} will be permanently deleted, this operation can't be undone.`, modal: true};
	await window.showInformationMessage(header, options, ...['Ok']).then(item => {
		if (item === 'Ok') {
			const envdPath = getEnvdPath();
			removeContext(envdPath, info.context);
			logger.info('Remove finished', logger.Module.MANAGER);
		} else {
			logger.info('Remove is cancelled', logger.Module.MANAGER);
		}
	});
}

function createOrActivateTerminal(): Terminal {
	const terminalName = 'ENVD Worker';
	let terminal: Terminal;
	const terminals = window.terminals.filter(terminal => terminal.name === terminalName);
	if (terminals.length === 0) {
		terminal = window.createTerminal(terminalName);
	} else {
		terminal = terminals[0];
	}

	terminal.show();
	return terminal;
}

/**
 * Commands instruct `Envd` to do some operation,
 * will be runned foreground for user to check `Envd` logs.
 * We open a VSCode terminal and send command to it,
 * the error won't be handled as they could be inspected from terminal
 */

function useContext(envdPath: string, ctxName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} context use --name ${ctxName}`;
	terminal.sendText(command);
}

function destroyEnvironment(envdPath: string, envName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} destroy --name ${envName}`;
	terminal.sendText(command);
}

function removeImage(envdPath: string, imgName: string, imgTag: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} image remove --image ${imgName} --tag ${imgTag}`;
	terminal.sendText(command);
}

export function removeContext(envdPath: string, ctxName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} context rm --name ${ctxName}`;
	terminal.sendText(command);
}

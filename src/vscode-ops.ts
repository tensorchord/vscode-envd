import {commands, extensions, type MessageOptions, window, Uri, env} from 'vscode';
import * as logger from './logger';
import {EnvdLocation, getEnvdLocation, getEnvdPath, getPypiMirror, getPythonPath} from './config';
import {type CtxInfo, type EnvInfo, type ImgInfo} from './operation/cmd-back';
import {destroyEnvironment, pipInstallEnvd, removeContext, removeImage, useContext} from './operation/cmd-show';
import {installLsp} from './operation/network';
import {lspPath} from './envd-lsp-client';

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

export async function askInstallEnvd(installVersion: string, localVersion?: string): Promise<boolean> {
	const manageMode = getEnvdLocation();
	if (manageMode === EnvdLocation.PATH) {
		logger.warn('envd install is disabled at "raw path" manage mode, you could unset "Version Check" at configure to hide this message', logger.Module.INSTALL);
		return false;
	}

	if (localVersion) {
		logger.info(`Request install envd of version ${installVersion}, and replace ${localVersion}`, logger.Module.INSTALL);
	} else {
		logger.info(`Request install envd of version ${installVersion}`, logger.Module.INSTALL);
	}

	const message = `Will install envd of version ${installVersion}. Do you want to do it now?`;
	const choice = await window.showInformationMessage(message, 'Install', 'Not now');
	if (choice === 'Install') {
		logger.info(`install envd of version ${installVersion}`, logger.Module.INSTALL);
		const pythonPath = getPythonPath();
		const indexUrl = getPypiMirror();
		pipInstallEnvd(pythonPath, installVersion, indexUrl);
		return true;
	}

	logger.info('installation is cancelled', logger.Module.INSTALL);
	return false;
}

export async function askInstallLsp(installVersion: string, localVersion?: string): Promise<boolean> {
	if (localVersion) {
		logger.info(`Request install LSP Server of version ${installVersion}, and replace ${localVersion}`, logger.Module.INSTALL);
	} else {
		logger.info(`Request install LSP Server of version ${installVersion}`, logger.Module.INSTALL);
	}

	const message = `Will install LSP Server of version ${installVersion}. Do you want to do it now?`;
	const choice = await window.showInformationMessage(message, 'Install', 'Not now');
	if (choice === 'Install') {
		logger.info(`install LSP Server of version ${installVersion}`, logger.Module.INSTALL);
		await installLsp(lspPath, installVersion);
		return true;
	}

	logger.info('installation is cancelled', logger.Module.INSTALL);
	return false;
}

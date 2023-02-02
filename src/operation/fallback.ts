/**
 * Operations handled by other extensions
 */
import {commands, window} from 'vscode';
import {Module, info} from '../logger';
import {type EnvInfo} from './cmd-back';

type OpenWindowsArgs = {
	host: string;
	userName?: string;
	port?: number;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function attachWindowBySSH(env: EnvInfo) {
	info(`Attach environment ${info.name} to VSCode`, Module.MANAGER);
	const extensionName = 'ms-vscode-remote.remote-ssh';
	const command = 'opensshremotes.openEmptyWindow';
	const extensionAvailable = await hasCommand(command);

	if (!extensionAvailable) {
		// Guide users to install Microsoft Remote SSH.
		info(`Request installation of "${extensionName}" extension`, Module.MANAGER);
		await commands.executeCommand('extension.open', extensionName);
		const message = 'It is recommended to install Microsoft Remote-SSH to enable attach to VSCode. Do you want to install it now?';
		const choice = await window.showInformationMessage(message, 'Install', 'Not now');
		if (choice === 'Install') {
			info(`Install "${extensionName}" extension`, Module.MANAGER);
			await commands.executeCommand('workbench.extensions.installExtension', extensionName);
		} else {
			info('Installation is cancelled', Module.MANAGER);
			return;
		}
	}

	const openWindowArgs: OpenWindowsArgs = {
		host: env.ssh_target,
	};
	await commands.executeCommand(command, openWindowArgs);
}

export async function attachWindowByContainer(env: EnvInfo) {
	// Workaround for SSH connection to server
	info(`Attach environment ${info.name} to VSCode`, Module.MANAGER);
	const extensionName = 'remote-containers.attachToRunningContainer';
	const command = 'opensshremotes.openEmptyWindow';
	const extensionAvailable = await hasCommand(command);
	if (!extensionAvailable) {
		info(`Request installation of "${extensionName}" extension`, Module.MANAGER);
		await commands.executeCommand('extension.open', extensionName);
		const message = 'It is recommended to install Microsoft Dev Container to enable attach to VSCode. Do you want to install it now?';
		const choice = await window.showInformationMessage(message, 'Install', 'Not now');
		if (choice === 'Install') {
			info(`Install "${extensionName}" extension`, Module.MANAGER);
			await commands.executeCommand('workbench.extensions.installExtension', extensionName);
		} else {
			info('Installation is cancelled', Module.MANAGER);
			return;
		}
	}

	await commands.executeCommand(command, env.name);
}

async function hasCommand(command: string): Promise<boolean> {
	const extensionAvailable = await commands.getCommands(true).then(values => {
		for (const value of values) {
			if (value === command) {
				return true;
			}
		}

		return false;
	});
	return extensionAvailable;
}

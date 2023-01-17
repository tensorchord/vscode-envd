import {compareVersions} from 'compare-versions';
import {commands, window} from 'vscode';
import {EnvdManage, getEnvdManage, getEnvdPath, getVersionSource, VersionSource} from './config';
import {lspPath} from './envd-lsp-client';
import {error, errorMessage, info, Module, warn} from './logger';
import {checkEnvdVersion, getLspVersion, unexistVersion} from './operation/cmd-back';
import {getGithubOnlineVersion, getPypiOnlineVersion, installLsp} from './operation/network';
import {askInstallEnvd, askInstallLsp} from './vscode-ops';

export class VersionManager {
	public constructor() {
		this.registerCommands();
	}

	public registerCommands() {
		commands.registerCommand('envd.switchEnvdVersion', async () => {
			void window.showQuickPick(
				await this.getVersions(), {
					ignoreFocusOut: true,
					title: 'Install envd',
					placeHolder: 'Input version to install, like "0.2.5"',
				}).then(version => {
				if (version === undefined) {
					info('envd install is cancelled', Module.INSTALL);
				} else {
					void askInstallEnvd(version);
				}
			});
		});
		commands.registerCommand('envd.switchLspVersion', async () => {
			void window.showQuickPick(
				await this.getVersions(), {
					ignoreFocusOut: true,
					title: 'Install LSP Server',
					placeHolder: 'Input LSP Server version to install, like "0.2.5"',
				}).then(version => {
				if (version === undefined) {
					info('envd install is cancelled', Module.INSTALL);
				} else {
					void askInstallLsp(version);
				}
			});
		});
		commands.registerCommand('envd.upgradeAll', () => {
			void this.check(true);
		});
	}

	public async check(enableEnvdCheck: boolean) {
		if (!enableEnvdCheck) {
			info('skip version check procedure', Module.INSTALL);
			return;
		}

		await this.manageEnvdVersion();
		await this.manageLspVersion();
	}

	private async manageEnvdVersion() {
		// Envd version manage will onlt enabled when use pip to install envd
		const manageMode = getEnvdManage();
		if (manageMode === EnvdManage.PATH) {
			warn('version check procedure is disabled at "raw path" manage mode, you could unset "Version Check" at configure to hide this message', Module.INSTALL);
		}

		// Get online lastest version
		const envdPath = getEnvdPath();
		const latest = await this.getLatestVersion();

		// Get local envd version
		let localVersion: string;
		try {
			localVersion = checkEnvdVersion(envdPath);
		} catch (err) {
			const message = errorMessage(err);
			info(`check envd version failed, error: ${message}`, Module.INSTALL);
			localVersion = unexistVersion;
		}

		// Compare local and latest version and trigger install when necessary
		switch (compareVersions(localVersion, latest)) {
			case 1:
				warn(`local envd version ${localVersion} is newer than remote release ${latest}, might have error`, Module.INSTALL);
				break;
			case 0:
				break;
			case -1:
				info(`local envd version ${localVersion} is out of date, new release ${latest} is available`, Module.INSTALL);
				await askInstallEnvd(latest, localVersion);
				break;
			default:
				break;
		}
	}

	private async manageLspVersion() {
		// Check local LSP Server version
		let localLspVersion: string;
		try {
			localLspVersion = getLspVersion(lspPath);
		} catch (err) {
			const message = errorMessage(err);
			info(`check LSP Server version failed, error: ${message}`, Module.INSTALL);
			localLspVersion = unexistVersion;
		}

		// Check local envd version
		const envdPath = getEnvdPath();
		let localVersion: string;
		try {
			localVersion = checkEnvdVersion(envdPath);
		} catch (err) {
			const message = errorMessage(err);
			info(`check envd version failed, error: ${message}, install latest lsp version`, Module.INSTALL);
			// If no local envd found, try install latest
			const latest = await this.getLatestVersion();
			// Set localVersion to let it install latest
			localVersion = latest;
		}

		// If envd and LSP Server version dismatch, try install right version of LSP Server
		switch (compareVersions(localLspVersion, localVersion)) {
			case 1:
				warn(`LSP Server version ${localLspVersion} is newer than envd version ${localVersion}, might have error`, Module.INSTALL);
				break;
			case 0:
				break;
			case -1:
				info(`LSP Server version ${localLspVersion} does not match envd version ${localVersion}`, Module.INSTALL);
				await askInstallLsp(localVersion, localLspVersion);
				break;
			default:
				break;
		}

		info(`Envd: ${localVersion}, LSP Server: ${localLspVersion}`, Module.INSTALL);
	}

	private async getVersions(): Promise<string[]> {
		const source = getVersionSource();
		let onlineVersions: string[];
		try {
			switch (source) {
				case VersionSource.GITHUB:
					onlineVersions = await getGithubOnlineVersion();
					break;
				default:
					onlineVersions = await getPypiOnlineVersion();
					break;
			}
		} catch (err) {
			const message = errorMessage(err);
			error(`fetch envd metadata from ${source} failed, error: ${message}`, Module.INSTALL);
			throw err;
		}

		return onlineVersions;
	}

	private async getLatestVersion(): Promise<string> {
		const onlineVersions = await this.getVersions();
		const latest = onlineVersions[0];
		info(`latest release is ${latest}`, Module.INSTALL);
		return latest;
	}
}

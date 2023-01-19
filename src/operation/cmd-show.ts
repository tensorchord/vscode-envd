/**
 * Commands instruct `Envd` to do some operations,
 * will be runned foreground for user to check `Envd` logs.
 * We open a VSCode terminal and send command to it,
 * the error won't be handled as they could be inspected from terminal
 */
import {window, type Terminal} from 'vscode';

export function useContext(envdPath: string, ctxName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} context use --name ${ctxName}`;
	terminal.sendText(command);
}

export function destroyEnvironment(envdPath: string, envName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} destroy --name ${envName}`;
	terminal.sendText(command);
}

export function removeImage(envdPath: string, imgName: string, imgTag: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} image remove --image ${imgName} --tag ${imgTag}`;
	terminal.sendText(command);
}

export function removeContext(envdPath: string, ctxName: string) {
	const terminal = createOrActivateTerminal();
	const command = `${envdPath} context rm --name ${ctxName}`;
	terminal.sendText(command);
}

export function pipInstallEnvd(pythonPath: string, version: string, indexUrl?: string) {
	const trimVersion = version.replace('v', '');
	const terminal = createOrActivateTerminal();
	let command: string;
	if (indexUrl === undefined) {
		command = `${pythonPath} -m pip install envd==${trimVersion} --user`;
	} else {
		command = `${pythonPath} -m pip install envd==${trimVersion} --index-url ${indexUrl} --user`;
	}

	terminal.sendText(command);
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

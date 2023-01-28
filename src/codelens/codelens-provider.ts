import path from 'path';
import {Range, CodeLens, type Command, type CodeLensProvider, type DocumentSelector} from 'vscode';
import {type CancellationToken, type TextDocument} from 'vscode';
import {SemanticTokensRequest, type SemanticTokensParams} from 'vscode-languageclient/node';
import {type EnvdLspClient, extensionLang} from '../envd-lsp-client';
import {error, errorMessage, Module} from '../logger';

enum Tokens {
	BUILD = 'build',
	INCLUDE = 'include',
}

const tokenTypesLegend: string[] = [
	Tokens.BUILD, Tokens.INCLUDE,
];
const tokenModifiersLegend: string[] = [];

const tokenTypes = new Map<string, number>(tokenTypesLegend.map((tokenType, index) => [tokenType, index]));
const tokenModifiers = new Map<string, number>(tokenModifiersLegend.map((tokenModifier, index) => [tokenModifier, index]));

export class EnvdUpEnvCodeLens extends CodeLens {
	constructor(
		public readonly dirPath: string,
		public readonly fileName: string,
		public readonly funcName: string,
		range: Range,
	) {
		const command: Command = {
			title: 'up environment',
			command: 'envd-codelens.up-environment',
			arguments: [dirPath, fileName, funcName],
		};
		super(range, command);
	}
}

export class EnvdBuildEnvCodeLens extends CodeLens {
	constructor(
		public readonly dirPath: string,
		public readonly fileName: string,
		public readonly funcName: string,
		range: Range,
	) {
		const command: Command = {
			title: 'build environment',
			command: 'envd-codelens.build-environment',
			arguments: [dirPath, fileName, funcName],
		};
		super(range, command);
	}
}

type ParsedToken = {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: number;
	tokenModifiers: number;
};

export class EnvdCodeLensProvider implements CodeLensProvider {
	static selector: DocumentSelector = [{scheme: 'file', language: extensionLang}];

	constructor(private readonly client: EnvdLspClient) {}

	async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
		const allTokens = await this.parseTextFromLsp(document, token);
		if (allTokens === undefined) {
			return [];
		}

		return this.buildCodeLens(document, allTokens);
	}

	private async parseTextFromLsp(document: TextDocument, token: CancellationToken): Promise<ParsedToken[] | undefined> {
		const params: SemanticTokensParams = {
			textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(document),
		};
		const data = await this.client.sendRequest(SemanticTokensRequest.type, params, token)
			.then(result => result?.data, (err: unknown) => {
				const message = errorMessage(err);
				error(`LSP SemanticTokens Request failed: ${message}`, Module.LSP);
				return undefined;
			});
		if (data === undefined) {
			return undefined;
		}

		const tokens: ParsedToken[] = [];
		const tokenLen = Math.ceil(data.length / 5);
		for (let i = 0; i < tokenLen; i++) {
			const start = 5 * i;
			tokens.push({
				line: data[start],
				startCharacter: data[start + 1],
				length: data[start + 2],
				tokenType: data[start + 3],
				tokenModifiers: data[start + 4]});
		}

		return tokens;
	}

	private encodeTokenType(token: string): number {
		const iden = tokenTypes.get(token);
		if (iden === undefined) {
			throw Error(`bad semantic token ${token}`);
		}

		return iden;
	}

	private buildCodeLens(document: TextDocument, allTokens: ParsedToken[]): CodeLens[] {
		const dirPath = path.dirname(document.uri.fsPath);
		const fileName = path.basename(document.uri.fsPath);
		const lines = allTokens
			.filter((token, _index, _array) => token.tokenType === this.encodeTokenType(Tokens.BUILD))
			.map(token => {
				const lineno = token.line;
				return lineno;
			});
		const allCodeLens: CodeLens[] = [];
		lines.forEach(lineno => {
			const range = new Range(lineno, 0, lineno, 0);
			const funcName = this.getFuncNameAtLine(document, lineno);
			allCodeLens.push(
				new EnvdUpEnvCodeLens(dirPath, fileName, funcName, range),
			);
			allCodeLens.push(
				new EnvdBuildEnvCodeLens(dirPath, fileName, funcName, range),
			);
		});
		return allCodeLens;
	}

	private getFuncNameAtLine(document: TextDocument, lineno: number): string {
		// Match line like `def build()` and get function name
		const regexp = /^def (\S+)\s*\(\s*\S*\s*(?:,\s*\S+)*\):$/g;
		const {text} = document.lineAt(lineno);
		const matches = [...text.matchAll(regexp)];
		if (matches.length !== 1) {
			error(`line ${lineno} from LSP Server not meet specifications: ${text}`, Module.LSP);
		}

		const funcName = matches[0][1];
		return funcName;
	}
}


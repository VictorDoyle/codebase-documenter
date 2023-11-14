import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeFunction } from './utils/analyzeFunction';
import { getAllTsFiles } from './utils/getAllTSFiles';

export function activate(context: vscode.ExtensionContext) {
    // generate local doc
    let disposable = vscode.commands.registerCommand('extension.generateFunctionDocumentation', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            const functionInfo = analyzeFunction(text);

            if (functionInfo) {
                const doc = await generateDocumentation(functionInfo);
                editor.edit(editBuilder => {
                    editBuilder.insert(selection.start, doc);
                });
            } else {
                vscode.window.showInformationMessage('No valid function selected.');
            }
        }
    });

    context.subscriptions.push(disposable);

    // generate file doc output to root
	let generateHelperDisposable = vscode.commands.registerCommand('extension.generateFunctionHelper', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showInformationMessage('No workspace folder found.');
			return;
		}
	
		let functionDictionary: Record<string, string> = {};
	
		for (const folder of workspaceFolders) {
            const folderPath = folder.uri.fsPath;
            const tsFiles = getAllTsFiles(folderPath);

            for (const filePath of tsFiles) {
                const fileContent = fs.readFileSync(filePath, 'utf8');

                // extract definitions from files
                const docRegex = /\/\*\*(.*?)\*\//gs;
                let match;
                while ((match = docRegex.exec(fileContent)) !== null) {
                    const doc = match[1].trim();
                    const nameMatch = doc.match(/\*\s(.*) -/);
                    if (nameMatch && nameMatch[1]) {
                        let formattedDoc = doc.replace(/\* @param {(.+?)} (\w+) - (.+)/g, 'Takes parameter {$1} $2 - $3');
                        functionDictionary[nameMatch[1]] = formattedDoc;
                    }
                }
            }
        }
	
		let markdownContent = '# Dictionary of Functions\n\n';
		for (const [functionName, doc] of Object.entries(functionDictionary)) {
			markdownContent += `## ${functionName}\n${doc}\n\n`;
		}
	
		// write to functionHelper.md
		const mdFilePath = path.join(workspaceFolders[0].uri.fsPath, 'functionHelper.md');
		fs.writeFileSync(mdFilePath, markdownContent);
		vscode.window.showInformationMessage('Function Helper Markdown generated.');
	});
	
	context.subscriptions.push(generateHelperDisposable);
	
}

async function generateDocumentation({ name, params }: { name: string, params: any[] }): Promise<string> {
    let functionDescription = 'Function description goes here...';
    const paramsDoc = params.map(param => ` * @param {${param.type}} ${param.name} - Parameter description goes here...`);

    return `
/**
 * ${name} - ${functionDescription}
${paramsDoc.join('\n')}
 * Custom Description: 
 */
`;
}

export function deactivate() {}
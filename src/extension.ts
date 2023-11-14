import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeFunction } from './utils/analyzeFunction';
import { getAllTsFiles } from './utils/getAllTSFiles';
import { extractDocsFromFiles } from './utils/docExtractor';

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
    
        const folderPath = workspaceFolders[0].uri.fsPath;
        const tsFiles = getAllTsFiles(folderPath);
        const documentation = extractDocsFromFiles(tsFiles);
    
        console.log("Extracted documentation:", documentation); 
        let markdownContent = '# Dictionary of Functions\n\n';
        Object.keys(documentation).sort().forEach(functionName => {
            console.log(`Adding documentation for ${functionName}`); 
            markdownContent += `## ${functionName}\n${documentation[functionName]}\n\n`;
        });
        
        console.log("Final Markdown Content:", markdownContent);
        const mdFilePath = path.join(folderPath, 'functionHelper.md');
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
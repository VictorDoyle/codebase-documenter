import * as vscode from 'vscode';
import { analyzeFunction } from './utils/analyzeFunction';

export function activate(context: vscode.ExtensionContext) {
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
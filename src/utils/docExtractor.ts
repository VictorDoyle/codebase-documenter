import * as fs from 'fs';


export function extractDocsFromFiles(files: string[]): Record<string, string> {
    let documentation: Record<string, string> = {};

    files.forEach(filePath => {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const docRegex = /\/\*\*([\s\S]*?)\*\/[\s\S]*?(export function|export class|function|class)\s+(\w+)/gm;
        let match;

        while ((match = docRegex.exec(fileContent)) !== null) {
            let doc = match[1].trim();
            const functionName = match[3];

            // Process @param and @returns
            doc = doc.replace(/@param {(\w+)} (\w+) - ([\s\S]*?)(?=(\n \* @|$))/g, 'Parameter: $2 - $1\n    - $3\n');
            doc = doc.replace(/@returns {(\w+)} - ([\s\S]*?)(?=(\n \* @|$))/g, 'Expected Return: $1 - $2\n');
            doc = doc.replace(/@type {(\w+)} - ([\s\S]*?)(?=(\n \* @|$))/g, 'Type: $1 - $2\n');
            doc = doc.replace(/@example(.*?)((?=(\n \* @|$)))/gs, 'Example: $1\n');
            doc = doc.replace(/@remarks(.*?)((?=(\n \* @|$)))/gs, 'Remarks: $1\n');
            doc = doc.replace(/@see(.*?)((?=(\n \* @|$)))/gs, 'See: $1\n');
            doc = doc.replace(/@deprecated(.*?)((?=(\n \* @|$)))/gs, 'Deprecated: $1\n');
            doc = doc.replace(/@throws {(\w+)} - ([\s\S]*?)(?=(\n \* @|$))/g, 'Throws: $1 - $2\n');
            doc = doc.replace(/@private/g, '**Private**\n');
            doc = doc.replace(/@public/g, '**Public**\n');
            doc = doc.replace(/@protected/g, '**Protected**\n');
            doc = doc.replace(/@abstract/g, '**Abstract**\n');
            doc = doc.replace(/@constructor/g, '**Constructor**\n');
            doc = doc.replace(/@static/g, '**Static**\n');
            doc = doc.replace(/@author(.*?)((?=(\n \* @|$)))/gs, 'Author: $1\n');
            doc = doc.replace(/@version(.*?)((?=(\n \* @|$)))/gs, 'Version: $1\n');
            doc = doc.replace(/@since(.*?)((?=(\n \* @|$)))/gs, 'Since: $1\n');
            doc = doc.replace(/@todo(.*?)((?=(\n \* @|$)))/gs, 'Todo: $1\n');
            doc = doc.replace(/@license(.*?)((?=(\n \* @|$)))/gs, 'License: $1\n');
            doc = doc.replace(/@property {(\w+)} (\w+) - ([\s\S]*?)(?=(\n \* @|$))/g, 'Property: $2 - $1\n    - $3\n');
            
            // Process @public and @private
            const visibility = doc.includes('@public') ? '**Public**' : doc.includes('@private') ? '**Private**' : '';
            doc = visibility + '\n' + doc.replace(/@(public|private)/g, '');

            documentation[functionName] = doc;
        }
    });

    return documentation;
}
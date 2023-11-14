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

            // Process @public and @private
            const visibility = doc.includes('@public') ? '**Public**' : doc.includes('@private') ? '**Private**' : '';
            doc = visibility + '\n' + doc.replace(/@(public|private)/g, '');

            documentation[functionName] = doc;
        }
    });

    return documentation;
}
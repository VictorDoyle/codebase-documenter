import ts from 'typescript';

interface FunctionInfo {
    name: string;
    params: { name: string, type: string }[];
}

export function analyzeFunction(text: string): FunctionInfo | null {
    const sourceFile = ts.createSourceFile('tempFile.ts', text, ts.ScriptTarget.Latest, true);

    let functionInfo: FunctionInfo | null = null;

    ts.forEachChild(sourceFile, node => {
        if (ts.isFunctionDeclaration(node) && node.name) {
            const functionName = node.name.getText(sourceFile);
            const parameters = node.parameters.map(param => {
                const paramName = param.name.getText(sourceFile);
                const paramType = param.type ? param.type.getText(sourceFile) : 'any';
                return { name: paramName, type: paramType };
            });

            functionInfo = { name: functionName, params: parameters };
            return; 
        }
    });

    return functionInfo;
}

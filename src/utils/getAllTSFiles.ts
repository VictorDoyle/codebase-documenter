import * as fs from 'fs';
import * as path from 'path';

export function getAllTsFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') { //skip node modules
                arrayOfFiles = getAllTsFiles(fullPath, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.ts')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

import {readdir, readFile} from 'node:fs/promises';
import {resolve, relative, sep} from 'node:path';

const sourceRoot = resolve('src');
const productionExtensions = new Set(['.ts', '.tsx']);
const errors = [];

async function sourceFiles(directory) {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(entries.map(async (entry) => {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) return sourceFiles(path);
        if (!productionExtensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) return [];
        if (/\.test\.tsx?$/.test(entry.name) || path.includes(`${sep}test${sep}`)) return [];
        return [path];
    }));
    return nested.flat();
}

function normalized(path) {
    return relative(process.cwd(), path).split(sep).join('/');
}

function report(path, message) {
    errors.push(`${normalized(path)}: ${message}`);
}

const files = await sourceFiles(sourceRoot);
for (const path of files) {
    const relativePath = normalized(path);
    const source = await readFile(path, 'utf8');
    const isApi = relativePath.startsWith('src/api/');
    const allowsBrowserGlobals = relativePath.startsWith('src/components/platform/')
        || relativePath === 'src/api/client.ts'
        || relativePath === 'src/index.tsx';

    if (!isApi && /from\s*['\"]axios['\"]/.test(source)) {
        report(path, 'Axios is restricted to the typed API boundary.');
    }
    if (/from\s*['\"][^'\"]*\/(?:models|orm)\//.test(source)) {
        report(path, 'Legacy model and ORM imports are forbidden.');
    }
    if (relativePath.startsWith('src/domain/') && /from\s*['\"][^'\"]*(?:pages|components)\//.test(source)) {
        report(path, 'Domain modules must remain independent of UI features and components.');
    }
    if (!allowsBrowserGlobals && /\bwindow\s*(?:\.|\[)/.test(source)) {
        report(path, 'Browser globals must be accessed through a platform adapter.');
    }
    if (!allowsBrowserGlobals && /\bdocument\s*\.(?:body|createElement|getElementById|querySelector|addEventListener|exitFullscreen)/.test(source)) {
        report(path, 'Browser globals must be accessed through a platform adapter.');
    }
}

if (errors.length > 0) {
    console.error('Frontend boundary check failed:\n' + errors.map(error => `- ${error}`).join('\n'));
    process.exitCode = 1;
} else {
    console.log(`Frontend boundary check passed for ${files.length} production TypeScript files.`);
}

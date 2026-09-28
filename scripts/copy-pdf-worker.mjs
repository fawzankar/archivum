import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const source = join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destination = join(root, 'public', 'pdf.worker.min.mjs');
await mkdir(join(root, 'public'), { recursive: true });
await cp(source, destination);
console.log('Copied pdf.worker.min.mjs');

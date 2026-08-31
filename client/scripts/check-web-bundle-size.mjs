import {gzipSync} from 'node:zlib';
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const baselineGzipBytes = 75.68 * 1000;
const maximumGrowth = 1.1;
const assetsDirectory = join(process.cwd(), 'dist', 'assets');
const appBundles = readdirSync(assetsDirectory)
    .filter((fileName) => /^index-[\w-]+\.js$/.test(fileName));

if (appBundles.length !== 1) {
    throw new Error(`Expected exactly one application bundle, found ${appBundles.length}.`);
}

const bundlePath = join(assetsDirectory, appBundles[0]);
const gzipBytes = gzipSync(readFileSync(bundlePath)).length;
const maximumBytes = Math.floor(baselineGzipBytes * maximumGrowth);
const formatKilobytes = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;

if (gzipBytes > maximumBytes) {
    throw new Error(
        `Initial application bundle is ${formatKilobytes(gzipBytes)} gzip; `
        + `the parity budget is ${formatKilobytes(maximumBytes)} (10% above ${formatKilobytes(baselineGzipBytes)}).`,
    );
}

console.log(`Initial application bundle: ${formatKilobytes(gzipBytes)} gzip (budget ${formatKilobytes(maximumBytes)}).`);

#! /usr/bin/env node

//
// Simple node script which builds a list of all static files for service worker pre-caching
//

const fs = require('fs')

/**
 * An array of file names to exclude (not full paths and no clever ant-matching)
 */
const ignore = Object.freeze([
    'generated', 'uploads', 'workers', 'package.json', 'package-lock.json',
    'tsconfig.json', 'precache.json', 'service-worker.js', 'node_modules', 'build-tools',
    'uploads'
])

/**
 * Recursively search for files and return a flat map of all paths
 * 
 * Anything in {@link ignore} or anything implicitally secret (i.e. beginning with '.') is ignored
 * 
 * @param {string} [path='.'] the current path to look in (default is '.')
 * @returns {Array<string>}
 */
function readDir(path = '.') {
    const files = fs.readdirSync(path, { withFileTypes: true })

    return files
        .filter(f => (f.isFile() || f.isDirectory()) && f.name.indexOf('.') !== 0 && !ignore.includes(f.name))
        .map(f => {
            const filepath = `${path}/${f.name}`
            // If a file, return the full path without the leading '.', otherwise step into the directory
            return (f.isFile()) ? filepath.substring(1) : readDir(filepath).flat()
        }).flat()
}

const files = readDir()
console.log(JSON.stringify(files, null, 2))
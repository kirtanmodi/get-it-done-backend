// This script will install all dependencies specified in `package.json` in `./layers/` directory
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Reading "package.json"');
const packageJsonRoot = path.join(__dirname, '..', 'package.json');
const layersPath = path.join(__dirname, '..', 'layers', 'nodejs');
const packageJsonLayersPath = path.join(layersPath, 'package.json');
let dependenciesFromRoot = JSON.parse(fs.readFileSync(packageJsonRoot).toString())['dependencies'];

if (dependenciesFromRoot) {
    console.log('Changing dependencies in "./layers/nodejs/package.json"');

    // if path (./layers/nodejs/package.json) not exists create one
    if (!fs.existsSync(packageJsonLayersPath)) {
        fs.mkdirSync(layersPath, { recursive: true });
        fs.writeFileSync(packageJsonLayersPath, JSON.stringify({
            "name": "layers",
            "version": "1.0.0",
            "description": "Layers for this package",
            "keywords": [],
            "author": "",
            "license": "ISC",
        }, null, 2));
    }
    const destinationFile = JSON.parse(fs.readFileSync(packageJsonLayersPath).toString());

    destinationFile['dependencies'] = dependenciesFromRoot;
    fs.writeFileSync(packageJsonLayersPath, JSON.stringify(destinationFile, null, 2));

    console.log('Executing `npm i` in "./layers/nodejs"');
    exec('cd layers/nodejs && npm i', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
} else {
    console.log('No dependency installed at this moment');
}













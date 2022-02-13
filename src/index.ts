import { exportData } from "./export";
import { readExported } from "./read-export";

const cmd = process.argv.slice(0, 2).join(' ');
const action = process.argv[2];
if (action !== 'export' && action !== 'read-export') {
    console.error(`Valid action not provided. Usage: ${cmd} <export|read-export> ...actionArgs`);
    process.exit(1);
}

if (action === 'export') {
    exportData();
} else {
    readExported();
}

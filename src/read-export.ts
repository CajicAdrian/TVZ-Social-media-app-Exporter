import { isEncryped, readFile } from "./export-format";

interface Args {
    filename: string;
    password: string | null;
}

function parseArgs(): Args {
    // node, script name, export|read-export
    const cmd = process.argv.slice(0, 3).join(' ');
    // The actual arguments
    const args = process.argv.slice(3);
    const usage = `Usage: ${cmd} <filename> [password]`;

    if (args.length !== 1 && args.length !== 2) {
        console.error(`Error parsing arguments.\n\n${usage}`);
        process.exit(1);
    }

    const [filename] = args;
    const password = args[1] ?? null;

    const encrypted = isEncryped(filename);

    if (encrypted && !password) {
        console.error('File encrypted but no password provided');
        process.exit(1);
    } else if (!encrypted && password) {
        console.error('File not encrypted but password provided');
        process.exit(1);
    }

    return { filename, password };
}

export function readExported() {
    const args = parseArgs();

    const exported = readFile(args.filename, args.password);
    console.log(JSON.parse(exported));
}

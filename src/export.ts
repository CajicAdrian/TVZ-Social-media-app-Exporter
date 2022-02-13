import { writeFile } from "./export-format";
import { exportOverTcp } from "./tcp-client";
import { ConnectionConfig } from "./types";
import { exportOverUdp } from "./udp-client";

interface Args {
    protocol: 'tcp'|'udp';
    connection: ConnectionConfig;
    password: string | null;
}

function parseArgs(): Args {
    // node, script name, export|read-export
    const cmd = process.argv.slice(0, 3).join(' ');
    // The actual arguments
    const args = process.argv.slice(3);
    const usage = `Usage: ${cmd} <udp|tcp> <hostname> <port> [password]`;

    if (args.length !== 3 && args.length !== 4) {
        console.error(`Error parsing arguments.\n\n${usage}`);
        process.exit(1);
    }

    const [protocol, host, port] = args;
    const password = args[3] ?? null;

    if (protocol !== 'udp' && protocol !== 'tcp') {
        console.error(`Invalid protocol ${protocol}\n\n${usage}`);
        process.exit(1);
    }

    return {
        protocol,
        password,
        connection: {
            host,
            port: parseInt(port, 10),
        },
    }
}

async function getData(args: Args): Promise<string> {
    if (args.protocol === 'udp') {
        console.log('Exporting over udp...');
        return exportOverUdp(args.connection);
    } else {
        console.log('Exporting over tcp...');
        return exportOverTcp(args.connection);
    }
}

export async function exportData() {
    const args = parseArgs();
    const data = await getData(args);
    const time = (new Date()).toISOString();
    const filename = `export-${time}.exp`;

    writeFile(data, filename, args.password);
    console.log('Data saved to: ', filename);
}

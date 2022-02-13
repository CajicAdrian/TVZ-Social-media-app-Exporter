import { Socket } from 'net';
import { ConnectionConfig } from './types';

function createTcp(config: ConnectionConfig): Promise<Socket> {
    const client = new Socket();
    client.setEncoding('utf8');

    return new Promise((resolve) => {
        client.connect(config.port, config.host, () => {
            resolve(client);
        });
    });
}

export async function exportOverTcp(config: ConnectionConfig): Promise<string> {
    const con = await createTcp(config);

    const ret: Promise<string> = new Promise((resolve) => {
        con.once('data', (data) => {
            con.destroy();
            resolve(data.toString('utf8'));
        });
    });
    con.write('export');

    return ret;
}

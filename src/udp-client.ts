import { createSocket, Socket } from 'dgram';
import { ConnectionConfig } from './types';

function createUdp(): Promise<Socket> {
    const udpSrv = createSocket('udp4');

    return new Promise((resolve) => {
        udpSrv.bind(() => resolve(udpSrv));
    });
}

export async function exportOverUdp(config: ConnectionConfig): Promise<string> {
    const sock = await createUdp();

    const ret: Promise<string> = new Promise((resolve) => {
        sock.once('message', (data) => {
            sock.close();
            resolve(data.toString('utf8'));
        });
    });
    sock.send('export', config.port, config.host);

    return ret;
}

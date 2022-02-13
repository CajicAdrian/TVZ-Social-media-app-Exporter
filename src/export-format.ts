import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { closeSync, createWriteStream, openSync, readFileSync, readSync } from 'fs';

// Format exportane datoteke:
// [1 byte] enkripcija. 1 = da, 0 = ne
// [16 byte] binarni inicijalizacijski vektor. Segment je uvijek prisutan, pun nula ako se ne koristi enkripcija
// [ostatak] Raw JSON  exporta, opcionalno s enkripcijom

function encryptData(data: Buffer, key: string, iv: Buffer): Buffer {
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    return Buffer.concat([cipher.update(data), cipher.final()]);
}

function decryptData(encrypted: Buffer, key: string, iv: Buffer): string {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]).toString('utf8');
}

function makeKey(password: string): string {
    return createHash('sha256').update(password).digest('base64').slice(0, 32);
}

export function writeFile(data: string, path: string, password: string|null) {
    const output = createWriteStream(path, { flags: 'w+' });

    if (password) {
        const key = makeKey(password);
        const iv = randomBytes(16);
        const encrypted = encryptData(Buffer.from(data, 'utf-8'), key, iv);

        output.write(Buffer.from([1])); // Write first one byte to signify encryption
        output.write(iv); // Write IV
        output.write(encrypted); // Write encrypted data
    } else {
        output.write(Buffer.from([0])); // Write first zero byte to signify no encryption
        output.write(Buffer.alloc(16)); // Write zeroes for 16-bit IV
        output.write(data);
    }
}

export function isEncryped(path: string): boolean {
    const fd = openSync(path, 'r');
    const buff = Buffer.alloc(1);
    readSync(fd, buff);    
    closeSync(fd);

    return buff[0] === 1;
}

export function readFile(path: string, password: string|null): string {
    const wholeFile: Buffer = readFileSync(path);
    const ivBuff = wholeFile.slice(1, 17);
    const encContent = wholeFile.slice(17);

    if (!password) {
        return encContent.toString('utf8');
    }

    const key = makeKey(password);
    return decryptData(encContent, key, ivBuff);
}

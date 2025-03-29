import {
    decode as _fromBase64Url,
    encode as _toBase64Url,
} from "@cfworker/base64url";

export function concatBuffer(...buffers: ArrayBuffer[]) {
    const length = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const tmp = new Uint8Array(length);

    let prev = 0;
    for (let buffer of buffers) {
        tmp.set(new Uint8Array(buffer), prev);
        prev += buffer.byteLength;
    }

    return tmp.buffer;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const encode = encoder.encode.bind(encoder);
export const decode = decoder.decode.bind(decoder);

export const toBase64Url = _toBase64Url;
export const fromBase64Url = _fromBase64Url;

export const stringToBuffer = (str: string) =>
    Uint8Array.from(str, (e) => e.charCodeAt(0)).buffer;

export const bufferToString = (buffer: ArrayBuffer) =>
    String.fromCharCode(...new Uint8Array(buffer));

export const safeEncode = (data: string): ArrayBuffer =>
    stringToBuffer(fromBase64Url(data));
export const safeDecode = (data: ArrayBuffer): string =>
    toBase64Url(bufferToString(data));

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

export const toBase64Url = _toBase64Url;
export const fromBase64Url = _fromBase64Url;

const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const encode = encoder.encode.bind(encoder);
export const decode = decoder.decode.bind(decoder);
export const byteStringToBuffer = (byteString: string) =>
    Uint8Array.from(byteString, (e) => e.charCodeAt(0)).buffer;

export const bufferToByteString = (buffer: ArrayBuffer) =>
    String.fromCharCode(...new Uint8Array(buffer));

export const safeDecode = (data: string) =>
    byteStringToBuffer(fromBase64Url(data));
export const safeEncode = (data: ArrayBuffer): string =>
    toBase64Url(bufferToByteString(data));

// // @ts-ignore
// window.safeDecode = safeDecode;
// // @ts-ignore
// window.safeEncode = safeEncode;
// // @ts-ignore
// window.decode = decode;
// // @ts-ignore
// window.encode = encode;
// // @ts-ignore
// window.toBase64Url = toBase64Url;
// // @ts-ignore
// window.fromBase64Url = fromBase64Url;
// // @ts-ignore
// window.byteStringToBuffer = byteStringToBuffer;
// // @ts-ignore
// window.bufferToByteString = bufferToByteString;

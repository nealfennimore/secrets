import * as utils from "./utils.js";

export interface HashPayload {
    salt: ArrayBuffer;
    entropy: ArrayBuffer;
    id: string;
}

export function encodeHashPayload({ salt, entropy, id }: HashPayload) {
    const payload = JSON.stringify({
        salt: utils.safeEncode(salt),
        entropy: utils.safeEncode(entropy),
        id,
    });
    return utils.toBase64Url(payload);
}

export function decodeHashPayload(): HashPayload {
    const { salt, entropy, id } = JSON.parse(
        utils.fromBase64Url(window.location.hash.slice(1))
    );
    return {
        salt: utils.safeDecode(salt),
        entropy: utils.safeDecode(entropy),
        id,
    };
}

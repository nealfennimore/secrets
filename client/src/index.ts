import { AES, KDF, Random, SHA } from "@nfen/webcrypto-ts";

function concatBuffer(...buffers: ArrayBuffer[]) {
    const length = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const tmp = new Uint8Array(length);

    let prev = 0;
    for (let buffer of buffers) {
        tmp.set(new Uint8Array(buffer), prev);
        prev += buffer.byteLength;
    }

    return tmp.buffer;
}

async function encrypt(
    key: AES.AesGcmProxiedCryptoKey,
    plaintext: ArrayBuffer
) {
    const iv = await Random.IV.generate(16);
    const ciphertext = await key.encrypt({ iv }, plaintext);
    return {
        iv,
        ciphertext,
    };
}
async function decrypt(
    key: AES.AesGcmProxiedCryptoKey,
    iv: ArrayBuffer,
    ciphertext: ArrayBuffer
) {
    return await key.decrypt({ iv }, ciphertext);
}

async function generateKey(password: ArrayBuffer) {
    const salt = await Random.Salt.generate(16);
    const entropy = await Random.getValues(16);
    return await deriveKey(salt, entropy, password);
}

async function deriveKey(
    salt: ArrayBuffer,
    entropy: ArrayBuffer,
    password: ArrayBuffer
) {
    const keyMaterial = await KDF.PBKDF2.generateKeyMaterial(
        "raw",
        concatBuffer(entropy, password)
    );

    const key = (await keyMaterial.deriveKey(
        {
            hash: SHA.Alg.Variant.SHA_256,
            salt,
        },
        {
            name: AES.Alg.Mode.AES_GCM,
            length: 256,
        }
    )) as AES.AesGcmProxiedCryptoKey;

    return {
        key,
        salt,
        entropy,
    };
}

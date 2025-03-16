import type { AesGcmProxiedCryptoKey } from "@nfen/webcrypto-ts/lib/aes/shared";
import { Alg as AesAlg } from "@nfen/webcrypto-ts/lib/aes/shared";
import * as PBKDF2 from "@nfen/webcrypto-ts/lib/kdf/pbkdf";
import { getValues, IV, Salt } from "@nfen/webcrypto-ts/lib/random";
import { digest } from "@nfen/webcrypto-ts/lib/sha/sha_256";
import { Alg as ShaAlg } from "@nfen/webcrypto-ts/lib/sha/shared";
import { concatBuffer } from "./utils.js";

export async function hashPassword(password: ArrayBuffer) {
    return await digest(password);
}

export async function encrypt({
    key,
    plaintext,
}: {
    key: AesGcmProxiedCryptoKey;
    plaintext: ArrayBuffer;
}) {
    const iv = await IV.generate(16);
    const ciphertext = await key.encrypt({ iv }, plaintext);
    return {
        iv,
        ciphertext,
    };
}
export async function decrypt({
    key,
    iv,
    ciphertext,
}: {
    key: AesGcmProxiedCryptoKey;
    iv: ArrayBuffer;
    ciphertext: ArrayBuffer;
}) {
    return await key.decrypt({ iv }, ciphertext);
}

export interface KeyDerivationParams {
    salt: ArrayBuffer;
    entropy: ArrayBuffer;
    password: ArrayBuffer;
}
export interface KeyGenerationMaterials {
    salt: ArrayBuffer;
    entropy: ArrayBuffer;
    key: AesGcmProxiedCryptoKey;
}

export async function generateKey(
    password: ArrayBuffer
): Promise<KeyGenerationMaterials> {
    const salt = await Salt.generate(16);
    const entropy = await getValues(16);
    const key = await deriveKey({ salt, entropy, password });
    return { salt, entropy, key };
}

export async function deriveKey({
    salt,
    entropy,
    password,
}: KeyDerivationParams) {
    const keyMaterial = await PBKDF2.generateKeyMaterial(
        "raw",
        concatBuffer(entropy, password)
    );

    return (await keyMaterial.deriveKey(
        {
            hash: ShaAlg.Variant.SHA_256,
            salt,
        },
        {
            name: AesAlg.Mode.AES_GCM,
            length: 256,
        }
    )) as AesGcmProxiedCryptoKey;
}

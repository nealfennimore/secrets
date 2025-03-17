const makeRequest = (endpoint: string, payload: object = {}) =>
    fetch(
        new Request(`https://secrets.api.neal.codes/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
    );

interface ErrorResponse {
    status: Number;
    message: string;
}

export namespace API {
    interface RetrievePayload {
        id: string;
    }
    interface RetrieveResponse {
        ciphertext: Array<Number>;
        iv: Array<Number>;
    }

    export async function retrieve(payload: RetrievePayload) {
        const response = await makeRequest("retrieve", payload);
        if (response.ok) {
            const { iv, ciphertext } =
                (await response.json()) as RetrieveResponse;
            return {
                iv: Uint8Array.from(iv).buffer,
                ciphertext: Uint8Array.from(ciphertext).buffer,
            };
        }
        const error = (await response.json()) as ErrorResponse;
        throw new Error(error?.message);
    }
    interface StorePayload {
        ciphertext: Array<Number>;
        iv: Array<Number>;
    }
    interface StoreResponse {
        id: string;
    }

    export async function store({
        ciphertext,
        iv,
    }: {
        ciphertext: ArrayBuffer;
        iv: ArrayBuffer;
    }) {
        const payload: StorePayload = {
            iv: Array.from(new Uint8Array(iv)),
            ciphertext: Array.from(new Uint8Array(ciphertext)),
        };
        const response = await makeRequest("store", payload);
        if (response.ok) {
            return (await response.json()) as StoreResponse;
        }
        const error = (await response.json()) as ErrorResponse;
        throw new Error(error?.message);
    }
}

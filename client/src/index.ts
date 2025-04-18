import { API } from "./api.js";
import * as Crypto from "./crypto.js";
import * as dom from "./dom.js";
import * as url from "./url.js";
import { decode, encode } from "./utils.js";

let cache = (function () {
    class Cache {
        private cache: Map<string, API.RetrieveUsableResponse> = new Map();
        private counter: number = 0;

        get(key: string): API.RetrieveUsableResponse | null {
            if (++this.counter >= 30) {
                this.clear();
                throw new Error("Too many attempts.");
            }
            return this.cache.get(key) || null;
        }
        has(key: string): boolean {
            return this.cache.has(key);
        }
        set(key: string, value: API.RetrieveUsableResponse) {
            if (!this.cache.has(key)) {
                this.cache.set(key, value);
            }
        }
        clear() {
            this.cache.clear();
            this.counter = 0;
        }
    }

    return new Cache();
})();

async function handleDecryption(e: SubmitEvent) {
    hideError();
    e.preventDefault();
    if (dom.Decrypt.form.reportValidity() && window.location.hash) {
        try {
            dom.Decrypt.formBtn.setAttribute("disabled", "disabled");
            const { id, salt, entropy } = url.encodeHashPayload();

            let response: API.RetrieveUsableResponse;
            if (!cache.has(id)) {
                response = await API.retrieve({ id });
                cache.set(id, response);
            } else {
                response = cache.get(id) as API.RetrieveUsableResponse;
            }

            const { iv, ciphertext } = response;
            const password = await Crypto.hashPassword(
                encode(dom.Decrypt.password.value.trim())
            );
            const key = await Crypto.deriveKey({
                salt,
                entropy,
                password,
            });
            const plaintext = await Crypto.decrypt({ key, iv, ciphertext });

            dom.Decrypt.secret.value = decode(plaintext);
            dom.Decrypt.form.classList.add("hidden");
            dom.Decrypt.aside.classList.remove("hidden");
            history.replaceState(
                "",
                document.title,
                window.location.pathname + window.location.search
            );

            cache.clear();
        } catch (err: any) {
            showError(err);
        } finally {
            dom.Decrypt.formBtn.removeAttribute("disabled");
        }
    }
    return false;
}

async function handleEncryption(e: SubmitEvent) {
    hideError();
    e.preventDefault();
    if (dom.Encrypt.form.reportValidity()) {
        try {
            dom.Encrypt.formBtn.setAttribute("disabled", "disabled");
            const password = await Crypto.hashPassword(
                encode(dom.Encrypt.password.value.trim())
            );
            const { key, salt, entropy } = await Crypto.generateKey(password);
            const plaintext = encode(dom.Encrypt.secret.value);
            const payload = await Crypto.encrypt({ key, plaintext });
            const { id } = await API.store(payload);
            const hash = url.decodeHashPayload({ salt, entropy, id });
            dom.Encrypt.url.value = `${location.origin}#${hash}`;
            dom.Encrypt.form.classList.add("hidden");
            dom.Encrypt.aside.classList.remove("hidden");
        } catch (err: any) {
            showError(err);
        } finally {
            dom.Encrypt.formBtn.removeAttribute("disabled");
        }
    }
    return false;
}

const copy = (input: HTMLInputElement | HTMLTextAreaElement) =>
    function onCopy(e: Event) {
        if (e.target) {
            // @ts-ignore
            const $defaultMessage =
                input.parentNode?.querySelector(".default-message");
            // @ts-ignore
            const $successMessage =
                input.parentNode?.querySelector(".success-message");

            navigator.clipboard.writeText(input.value).then(() => {
                $defaultMessage?.classList.add("hidden");
                $successMessage?.classList.remove("hidden");

                // reset to default state
                setTimeout(() => {
                    $defaultMessage?.classList.remove("hidden");
                    $successMessage?.classList.add("hidden");
                }, 2000);
            });
        }
    };

function showError(e: any) {
    const text = dom.error.querySelector("#error-text");
    if (text) {
        text.textContent = e?.message;
    }
    dom.error.classList.remove("hidden");
}

function hideError() {
    dom.error.classList.add("hidden");
}

function setup() {
    dom.Encrypt.form.reset();
    dom.Decrypt.form.reset();

    dom.Encrypt.form.addEventListener("submit", handleEncryption);
    dom.Decrypt.form.addEventListener("submit", handleDecryption);

    dom.Encrypt.url.value = "";
    dom.Decrypt.secret.value = "";

    if (window.location.hash) {
        dom.Decrypt.section.classList.remove("hidden");
    } else {
        dom.Encrypt.section.classList.remove("hidden");
    }

    dom.Encrypt.copy.addEventListener("click", copy(dom.Encrypt.url));
    dom.Decrypt.copy.addEventListener("click", copy(dom.Decrypt.secret));

    dom.loader.classList.add("hidden");
    dom.error.querySelector("button")?.addEventListener("click", hideError);
}

setup();

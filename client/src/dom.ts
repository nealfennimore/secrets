export const loader = document.querySelector("section#loader") as HTMLElement;
export const error = document.querySelector("aside#error") as HTMLElement;

export namespace Encrypt {
    export const section = document.querySelector(
        "section#encrypt"
    ) as HTMLElement;
    export const form = section.querySelector(
        "form#encrypt-form"
    ) as HTMLFormElement;
    export const formBtn = form.querySelector("button") as HTMLButtonElement;
    export const password = form.querySelector(
        "input#encrypt-password"
    ) as HTMLInputElement;

    export const secret = form.querySelector(
        "textarea#encrypt-secret"
    ) as HTMLTextAreaElement;
    export const aside = section.querySelector(
        "aside#encrypt-aside"
    ) as HTMLElement;
    export const url = aside.querySelector(
        "input#encrypt-url"
    ) as HTMLInputElement;
    export const copy = aside.querySelector(
        "button#encrypt-url-btn"
    ) as HTMLButtonElement;
}

export namespace Decrypt {
    export const section = document.querySelector(
        "section#decrypt"
    ) as HTMLElement;

    export const form = section.querySelector(
        "form#decrypt-form"
    ) as HTMLFormElement;

    export const formBtn = form.querySelector("button") as HTMLButtonElement;
    export const password = section.querySelector(
        "input#decrypt-password"
    ) as HTMLInputElement;

    export const aside = section.querySelector(
        "aside#decrypt-aside"
    ) as HTMLElement;
    export const secret = aside.querySelector(
        "textarea#decrypt-secret"
    ) as HTMLTextAreaElement;

    export const copy = aside.querySelector(
        "button#decrypt-secret-btn"
    ) as HTMLButtonElement;
}

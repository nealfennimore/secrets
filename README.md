# Secrets

## Overview

An application that enables secure text sharing between parties using password-based encryption. The application uses PBKDF2 for key derivation and AES-GCM for secure encryption and decryption.

## Features

- Strong password-based key derivation (PBKDF2)
- AES-GCM encryption for confidentiality and authenticity
- Random entropy for enhanced security
- Simple to generate a URL with a hash parameter for private viewing

## Usage

1. Input the secret to be encrypted
2. Enter a password for encryption and click Encrypt
3. Share the URL and password with the intended recipient
4. Recipient uses the same password to decrypt the message

## Storage

All secrets are stored encrypted with their IV. The client stores the entropy and the salt used to derive the key within a `location.hash` parameter for private viewing. A user must provide a password to properly generate the decryption key.

The following information is stored for 24 hours in a Cloudflare KV store. If the secret is accessed beforehand it is deleted upon retrieval. There is a 32KB limit on all secrets stored.

```mermaid
erDiagram
    secrets {
        string uuid "Secret ID"
        object secret "ciphertext and IV"
    }
```

## Encryption

```mermaid
---
title: Overview
---
flowchart TB
    PWD@{ shape: manual-input, label: "Password"}
    SECRET@{ shape: manual-input, label: "Secret"}
    SHA256@{ shape: rounded, label: "Hashed with SHA256" }

    ENT@{ shape: rect, label: "Entropy (16 bytes)"}
    SALT@{ shape: rect, label: "Salt (16 bytes)"}
    KEYMAT@{ shape: rect, label: "PBKDF2 Key Material"}

    IV@{ shape: rect, label: "IV (16 bytes)"}
    AES@{ shape: lean-l, label: "AES-GCM 256" }
    
    KDF_JOIN@{ shape: join, label: "PBKDF2" }
    ENTROPY_JOIN@{ shape: join, label: "ENTROPY_JOIN" }
    AES_JOIN@{ shape: join, label: "AES" }

    CIPHER@{ shape: lean-l, label: "Ciphertext" }

    PWD --> SHA256
    SHA256 --> ENTROPY_JOIN
    ENT --> ENTROPY_JOIN
    ENTROPY_JOIN --> KEYMAT
    KEYMAT --> KDF_JOIN
    SALT --> KDF_JOIN
    KDF_JOIN --> AES
    AES --> AES_JOIN
    IV --> AES_JOIN
    SECRET --> AES_JOIN
    AES_JOIN --> CIPHER
```

## Limitations

- Requires secure password sharing channel

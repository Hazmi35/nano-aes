import { Buffer } from "node:buffer";
import type { CipherCCM, CipherGCM, DecipherCCM, DecipherGCM, KeyObject } from "node:crypto";
import { createCipheriv, createDecipheriv, createSecretKey, randomBytes } from "node:crypto";
import { combine, split } from "../util/BufferUtil.js";

const modes = ["cbc", "ctr", "gcm"] as const;
const keySizes = [128, 192, 256] as const;

/**
 * Options for the NanoAES class.
 */
export type NanoAESChiperOptions = {

    /**
     * The key to use for encryption/decryption
     */
    key?: Buffer | KeyObject | string;

    /**
     * The mode to use for encryption/decryption. Default: "cbc"
     */
    mode?: typeof modes[number];

    /**
     * The key size to use for encryption/decryption. Default: matches the size of the key
     */
    keySize?: typeof keySizes[number];
};
export type AuthenticatedCipher = CipherCCM | CipherGCM;
export type AuthenticatedDecipher = DecipherCCM | DecipherGCM;

/**
 * Simple & lightweight AES (Advanced Encryption Standard) module. Wrapper for Node.js crypto module.
 *
 * @param opt - Options for the NanoAES class.
 * @throws If the key is not provided.
 * @throws If the key is not a string or a KeyObject.
 * @throws If the mode is not supported.
 * @throws If the key size is not supported.
 */
export class NanoAES {
    private readonly key!: KeyObject;
    private readonly algorithm!: string;
    public constructor(public opt?: NanoAESChiperOptions) {
        if (opt?.key === undefined) throw new TypeError("Key is required!");
        if (opt.mode === undefined) opt.mode = "cbc";

        switch (typeof opt.key) {
            case "string":
                this.key = createSecretKey(opt.key, "utf8");
                break;
            case "object":
                this.key = Buffer.isBuffer(opt.key) ? createSecretKey(opt.key) : opt.key;
                break;
            default:
                throw new TypeError("Key must be a string or a KeyObject!");
        }

        if (opt.keySize === undefined) this.opt!.keySize = this.key.symmetricKeySize! * 8 as NanoAESChiperOptions["keySize"];

        if (!modes.includes(this.opt!.mode!)) throw new TypeError(`Supported Modes are only ${modes.join(", ")}`);

        // @ts-expect-error - keySizes is a readonly array
        if (!keySizes.includes(this.opt?.keySize)) throw new TypeError(`Supported key sizes are only ${keySizes.join(", ")}`);

        this.algorithm = ["aes", this.opt!.keySize, this.opt!.mode!.toLowerCase()].join("-");

        Object.defineProperties(this, {
            algorithm: {
                enumerable: false,
                writable: false
            },
            key: {
                enumerable: false,
                writable: false
            }
        });

        Object.defineProperties(this.opt, {
            key: {
                enumerable: false,
                writable: false
            }
        });
    }

    /**
     * Encrypts the given data.
     *
     * @param data - The data to encrypt.
     * @returns The encrypted data.
     * @throws If the input is not a Buffer or a string.
     * @throws If encryption fails.
     */

    public encrypt(data: Buffer | string): Buffer {
        if (!Buffer.isBuffer(data) && typeof data !== "string") throw new TypeError("Input must be a Buffer or string");

        try {
            const IV = randomBytes(16);
            const cipher = createCipheriv(this.algorithm, this.key, IV);

            const encrypted = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
            const buffers = [encrypted, IV];
            if (this.isAuthenticated()) buffers.push((cipher as CipherCCM | CipherGCM).getAuthTag());

            return combine(buffers, ";;");
        } catch (error) {
            throw new Error(`Encryption failed: ${(error as Error).message}`);
        }
    }

    /**
     * Decrypts the given data.
     *
     * @param encryptedData - The data to decrypt.
     * @returns The decrypted data.
     * @throws If the input is not a Buffer.
     * @throws If the input is not a valid encrypted data.
     * @throws iF the auth tag is not found, but mode is an authenticated mode.
     * @throws If decryption fails.
     */
    public decrypt(encryptedData: Buffer): Buffer {
        if (!Buffer.isBuffer(encryptedData)) throw new TypeError("Input must be a Buffer");

        try {
            const [cipherText, IV, authTag] = split(encryptedData, ";;");
            if (!cipherText || !IV) throw new TypeError("Invalid encrypted data!");

            const decipher = createDecipheriv(this.algorithm, this.key, IV);

            if (this.isAuthenticated()) {
                if (!authTag) throw new TypeError("No auth tag found, but mode is an authenticated mode!");
                (decipher as AuthenticatedDecipher).setAuthTag(authTag);
            }

            return Buffer.concat([decipher.update(cipherText), decipher.final()]);
        } catch (error) {
            throw new Error(`Decryption failed: ${(error as Error).message}`);
        }
    }

    private isAuthenticated(): boolean {
        return this.opt!.mode === "gcm";
    }

    /**
     * Generates a random key.
     *
     * @param size - The size of the key to generate.
     * @returns The generated key.
     */
    public static generateKey(size: NanoAESChiperOptions["keySize"] = 192): KeyObject {
        if (!keySizes.includes(size)) throw new TypeError(`Supported key sizes are only ${keySizes.join(", ")}`);

        return createSecretKey(randomBytes(Number(size) / 8));
    }
}

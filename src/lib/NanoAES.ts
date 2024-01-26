import { Buffer } from "node:buffer";
import type { CipherCCM, CipherGCM, DecipherCCM, DecipherGCM } from "node:crypto";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { combine, split } from "../util/BufferUtil.js";

const modes = ["cbc", "ctr", "gcm"];
export type INanoAESCipherOpt = {
    mode: "cbc" | "ctr" | "gcm";
    keySize: 128 | 192 | 256;
};
export type AuthenticatedCipher = CipherCCM | CipherGCM;
export type AuthenticatedDecipher = DecipherCCM | DecipherGCM;

export class NanoAES {
    public algorithm!: string;
    public constructor(private readonly key: string, public opt: INanoAESCipherOpt) {
        this.algorithm = ["aes", this.opt.keySize, this.opt.mode.toLowerCase()].join("-");

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

        if (!modes.includes(this.opt.mode)) throw new Error(`Supported Modes are only ${modes.join(", ")}`);

        if (Buffer.from(key).length !== Number(this.opt.keySize) / 8) throw new Error(`Invalid key size for ${this.algorithm}!`);
    }

    public encrypt(data: Buffer | string): Buffer {
        if (!Buffer.isBuffer(data) && typeof data !== "string") throw new Error("Input must be a Buffer or string");

        try {
            const IV = randomBytes(16);
            const cipher = createCipheriv(this.algorithm, Buffer.from(this.key), IV);

            const encrypted = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
            const buffers = [encrypted, IV];
            if (this.isAuthenticated()) buffers.push((cipher as CipherCCM | CipherGCM).getAuthTag());

            return combine(buffers, ";;");
        } catch (error) {
            throw new Error(`Encryption failed: ${(error as Error).message}`);
        }
    }

    public decrypt(encryptedData: Buffer): Buffer {
        if (!Buffer.isBuffer(encryptedData)) throw new Error("Input must be a Buffer");

        try {
            const [cipherText, IV, authTag] = split(encryptedData, ";;");
            if (!cipherText || !IV) throw new Error("Invalid encrypted data!");

            const decipher = createDecipheriv(this.algorithm, Buffer.from(this.key), IV);

            if (this.isAuthenticated()) {
                if (!authTag) throw new Error("No auth tag found, but mode is an authenticated mode!");
                (decipher as AuthenticatedDecipher).setAuthTag(authTag);
            }

            return Buffer.concat([decipher.update(cipherText), decipher.final()]);
        } catch (error) {
            throw new Error(`Decryption failed: ${(error as Error).message}`);
        }
    }

    private isAuthenticated(): boolean {
        return this.opt.mode === "gcm";
    }

    public static generateKey(size: 128 | 192 | 256): Buffer {
        return randomBytes(Number(size) / 8);
    }
}

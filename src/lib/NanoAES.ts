/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CipherCCM, CipherGCM, createCipheriv, createDecipheriv, DecipherCCM, DecipherGCM, randomBytes } from "crypto";
import { combine, split } from "../util/BufferUtil.js";

const modes = ["cbc", "ctr", "gcm"];
export interface INanoAESCipherOpt {
    mode: "cbc" | "ctr" | "gcm";
    keySize: "128" | "192" | "256";
}
export type AuthenticatedCipher = CipherCCM | CipherCCM;
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
        const IV = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, Buffer.from(this.key), IV);

        const encrypted = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
        const buffers = [encrypted, IV];
        if (this.isAuthenticated()) buffers.push((cipher as CipherCCM | CipherGCM).getAuthTag());

        return combine(buffers, ";;");
    }

    public decrypt(encryptedData: Buffer): Buffer {
        const [cipherText, IV, authTag] = split(encryptedData, ";;");
        const decipher = createDecipheriv(this.algorithm, Buffer.from(this.key), IV);

        if (this.isAuthenticated()) {
            if (!authTag) throw new Error("No auth tag found, but mode is an authenticated mode!");
            (decipher as AuthenticatedDecipher).setAuthTag(authTag);
        }

        return Buffer.concat([decipher.update(cipherText), decipher.final()]);
    }

    private isAuthenticated(): boolean {
        return this.opt.mode === "gcm";
    }
}

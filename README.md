# nano-aes

Simple & lightweight AES (Advanced Encryption Standard) module. Wrapper for Node.js crypto module.

Features:
- Supports CBC, CTR, and GCM mode.
- Supports 128, 192, and 256 key sizes/length.
- Uses a secure randomized IV from a cryptographically strong pseudorandom data
- Lightweight with no dependencies (With only ~9.9kB of unpacked size!)
- Easy to use
- Supported both from ESM and CommonJS (We bundle for both)
- Backwards compatible down to Node.js v14 and even v12! _*1_

## Example
```js
const { NanoAES } = require("nano-aes");
// or with ESM
import { NanoAES } from "nano-aes";

// Key size is 192 bits / 24 byte
const AESCipher = new NanoAES("abcdefghijklmnopqrstuvwx", { keySize: 192, mode: "ctr" });
// Or you can a random key generate from the static method
const AESCipher = new NanoAES(NanoAES.generateKey(192), { keySize: 192, mode: "ctr" });

const encrypted = AESCipher.encrypt("Hello World!").toString("hex");
const decrypted = AESCipher.decrypt(Buffer.from(encrypted, "hex")).toString("utf8");

console.log(encrypted); // [Some Encrypted Data]
console.log(decrypted); // Hello World!
```

### Footnote
_*1_ The officially supported Node.js version is from v14, but you can still use this module in Node.js v12. But it is not recommended.

Node.js v12 are **EOL** and doesn't receive OpenSSL updates, which what `node:crypto` module used, which means no security updates.

See what OpenSSL version your Node.js is linked to with `process.versions.openssl`
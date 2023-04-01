# nano-aes

Simple & lightweight AES (Advanced Encryption Standard) module. Wrapper for Node.js crypto module.

Features:
- Supports CBC, CTR, and GCM mode.
- Supports 128, 192, and 256 key sizes/length.
- Uses a secure randomized IV from a cryptographically strong pseudorandom data
- Lightweight with no dependencies
- Easy to use

## Example
```js
const { NanoAES } = require("nano-aes");
// or
import { NanoAES } from "nano-aes";

// Key size is 192 bits / 24 byte
const AESCipher = new NanoAES("abcdefghijklmnopqrstuvwx", { keySize: 192, mode: "ctr" });
// Or you can generate from the static method
NanoAES.generateKey(192);

const encrypted = AESCipher.encrypt("Hello World!").toString("hex");
const decrypted = AESCipher.decrypt(Buffer.from(encrypted, "hex")).toString("utf8");

console.log(encrypted); // [Some Encrypted Data]
console.log(decrypted); // Hello World!
```

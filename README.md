# nano-aes

Simple and lightweight AES (Advanced Encryption Standard) module. A Wrapper for Node.js crypto module.

Currently supports: CBC, CTR and GCM mode with 128, 192, 256 key sizes

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
const decrypted = AESCipher.decrypt(encrypted).toString("utf8");

console.log(decrypted); // Hello World!
```

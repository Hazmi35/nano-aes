import { common, extend, modules, node, stylistic, typescript } from "@hazmi35/eslint-config";

export default [
    ...extend(
        common,
        [{ rule: "unicorn/filename-case", option: ["warn", { ignore: ["NanoAES.ts"] }] }]
    ),
    ...modules,
    ...node,
    ...stylistic,
    ...typescript
];

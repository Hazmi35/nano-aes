import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    target: "es2022",
    minify: "terser",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true
});

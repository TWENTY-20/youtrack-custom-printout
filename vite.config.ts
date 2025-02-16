import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";


// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    if (mode === "backend") {
        return {
            build: {
                lib: {
                    entry: "./src/backend.js",
                    formats: ["cjs"],
                    emptyOutDir: true,
                    name: "backend",
                    fileName: "backend.js"
                },
                rollupOptions: {
                    output: {
                        entryFileNames: "backend.js",
                        dir: "build"
                    }
                }
            }
        };
    }


    return {

        plugins: [
            react(),
            viteStaticCopy({
                targets: [
                    { src: "./logo.svg", dest: "." },
                    { src: "./manifest.json", dest: "." },
                    { src: "./entity-extensions.json", dest: "." },
                    { src: "./settings.json", dest: "." },
                ]
            })
        ],
        root: './src',
        base: '',
        publicDir: 'public',
        build: {
            outDir: '../build',
            emptyOutDir: false,
            copyPublicDir: false,
            sourcemap: false,
            target: ['es2022'],
            assetsDir: 'widgets/assets',
            rollupOptions: {
                input: {
                    // List every widget entry point here
                    fullPage: 'src/widgets/issue-option/index.html',
                }
            }
        },
        esbuild: {
            supported: {
                "top-level-await": true
            }
        },
    };
});

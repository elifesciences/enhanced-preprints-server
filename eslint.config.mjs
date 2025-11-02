import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import noOnlyTests from "eslint-plugin-no-only-tests";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupPluginRules } from "@eslint/compat";
import deprecationPlugin from "eslint-plugin-deprecation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "**/node_modules",
    "**/.github",
    "data",
    "**/.yarn",
    "**/.eslintignore",
    "**/.eslintrc.js",
]), {
    extends: compat.extends("airbnb/base", "airbnb-typescript/base"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        "no-only-tests": noOnlyTests,
        "deprecation": fixupPluginRules(deprecationPlugin),
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "deprecation/deprecation": 1,
        "import/prefer-default-export": 0,

        "max-len": ["error", {
            code: 240,
        }],

        "no-only-tests/no-only-tests": ["error", {
            focus: ["only"],
        }],
        "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    },
}]);
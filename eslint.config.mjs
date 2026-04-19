// @ts-check
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintPluginPrettier from "eslint-plugin-prettier"
import prettier from "eslint-config-prettier"
import importX from "eslint-plugin-import-x"
import pluralize from "pluralize"
import path from "node:path"

/** @type {import('eslint').Rule.RuleModule} */
const namingRule = {
  create(context) {
    return {
      Program() {
        const fullPath = context.filename

        // If it's not a file in src, ignore it
        if (!fullPath.includes("src")) {
          return
        }

        // If it's index.ts, ignore it
        if (/index\.ts$/.test(fullPath)) {
          return
        }

        const segments = fullPath.split(path.sep)
        const srcIndex = segments.lastIndexOf("src")

        // The "First Folder" is the one immediately after 'src'
        const firstFolder = segments[srcIndex + 1]
        const fileName = path.basename(fullPath)

        // If the file is directly in src, ignore it
        if (firstFolder === fileName) {
          return
        }

        // Plural Check (only for the first folder below src)
        if (pluralize.isSingular(firstFolder) && !pluralize.isPlural(firstFolder)) {
          context.report({
            loc: { line: 1, column: 0 },
            message: 'Top-level folder "{{dir}}" must be plural.',
            data: { dir: firstFolder },
          })
          return
        }

        // Suffix Logic
        const collections = ["routes", "utils", "types"]
        const isCollection = collections.includes(firstFolder)
        const suffix = isCollection
          ? pluralize.plural(firstFolder)
          : pluralize.singular(firstFolder)

        if (!fileName.endsWith(`.${suffix}.ts`)) {
          context.report({
            loc: { line: 1, column: 0 },
            message: 'File in "{{dir}}" must end with .{{suffix}}.ts',
            data: { dir: firstFolder, suffix },
          })
        }
      },
    }
  },
}

export default [
  {
    ignores: ["dist/**", "node_modules/**", "prisma.config.ts", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        sourceType: "module",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "import-x": importX,
      local: {
        rules: {
          "naming-convention": namingRule,
        },
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-undef": "off",
      "prefer-const": "error",
      "no-console": "warn",
      "no-debugger": "warn",
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
          semi: false,
          trailingComma: "all",
          printWidth: 100,
          tabWidth: 2,
        },
      ],
      "import-x/no-default-export": "error",
      "import-x/exports-last": "error",
      "local/naming-convention": "error",
    },
  },
  prettier,
]

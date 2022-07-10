module.exports = {
  root: true,
  ignorePatterns: [
    '.yarn',
    '.pnp.cjs',
    'cdk.out',
    '**/coverage/**',
    '**/dist/**',
    '**/node_modules/**',

    // GraphQL generated files
    '*.generated.ts',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    // Point to the tsconfigs that specify which files should be linted.
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  settings: {
    react: { version: 'detect' },
    jest: {
      version: 27,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:node/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  rules: {
    /**
     * eslint
     */

    // Not returning in array methods is either a mistake or a misuse of them.
    'array-callback-return': 'error',

    // Allow doing x != null to check for undefined or null.
    eqeqeq: ['error', 'always', { null: 'ignore' }],

    // Usually awaits in loops can be refactored for parallelisation.
    'no-await-in-loop': 'error',

    // Use custom logger implementations instead.
    'no-alert': 'error',
    // 'no-console': 'error',

    // These return values are ignored - having them is probably a mistake.
    'no-constructor-return': 'error',
    'no-promise-executor-return': 'error',

    // Reduce unnecessary complexity in if statements. Else keywords are seldom needed and add clutter.
    'no-else-return': ['error', { allowElseIf: false }],
    'no-lonely-if': 'error',

    // Generally not a good idea to extend native objects except for polyfills.
    'no-extend-native': 'error',

    // eval === evil.
    'no-eval': 'error',
    'no-implied-eval': 'error',

    // Consistent code style.
    'no-useless-rename': 'warn',
    'object-shorthand': 'warn',
    'prefer-destructuring': 'warn',
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],

    /**
     * eslint-plugin-eslint-comments
     */

    // Sometimes it's necessary to disable rules but please explain why.
    'eslint-comments/require-description': 'error',

    /**
     * @typescript-eslint/eslint-plugin
     */

    // Ban some more types in addition to the defaults.
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          // The Except type is stricter than Omit and doesn't prevent the compiler from picking up rename refactors automatically.
          // https://github.com/sindresorhus/type-fest/blob/main/source/except.d.ts
          Omit: {
            message: [
              'Prefer the `Except` type imported from `type-fest` instead, which is a stricter version of `Omit` that disallows the omitted keys from being present on the resulting type.',
            ].join('\n'),
            fixWith: 'Except',
          },
        },
      },
    ],

    // Consistent code style.
    '@typescript-eslint/consistent-indexed-object-style': 'warn',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/consistent-type-definitions': 'warn',

    // Incredibly useful rule that should be an error rather than a warning.
    '@typescript-eslint/explicit-module-boundary-types': 'error',

    // Unbound class methods re-map 'this' at runtime which TypeScript won't pick up on.
    '@typescript-eslint/unbound-method': 'error',

    // Single extends are useful for composition, as a union type is not necessarily equivalent to
    // an interface with a single supertype.
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],

    // Using explicit types are not necessarily a bad thing in parameters and properties as they can
    // provide useful documentation.
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      {
        ignoreParameters: true,
        ignoreProperties: true,
      },
    ],

    // Allows having unused vars in destructuring which is useful for excluding properties when
    // shallow copying with object spread.
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
      },
    ],

    // TypeScript-specific version of eslint's no-use-before-define rule.
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],

    /**
     * eslint-plugin-import
     */

    // Generally enforce ESM syntax across the codebase (with exceptions, see overrides below).
    'import/no-commonjs': 'error',

    // Enforce a single consistent style of exports. Why named are preferred over default:
    // * No need to decide which export should be the default.
    // * Default exports can be imported under any name, making it difficult to scan which modules import it.
    'import/no-default-export': 'error',

    // Exporting mutable values is a terrible idea.
    'import/no-mutable-exports': 'error',

    // Cleaner import paths.
    'import/no-useless-path-segments': 'error',

    // Consistent ordering of imports.
    'sort-imports': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          // Include 'node:' protocol imports as part of builtin.
          {
            pattern: 'node:**',
            group: 'builtin',
          },
          {
            pattern: 'node:**/**',
            group: 'builtin',
          },
        ],
      },
    ],

    /**
     * eslint-plugin-jest
     */

    // Consistent code style.
    'jest/consistent-test-it': [
      'error',
      {
        fn: 'it',
        withinDescribe: 'it',
      },
    ],

    // Prevent conditionals in tests - usually a sign that the test is doing too much.
    'jest/no-if': 'error',
    'jest/no-test-return-statement': 'error',

    // This reports better errors when the promise rejects.
    'jest/prefer-expect-resolves': 'error',

    // Avoids having to restore mocks manually.
    'jest/prefer-spy-on': 'error',

    // Disallows empty tests by explicitly marking tests as WIP.
    'jest/prefer-todo': 'error',

    // Requires all tests to be in a top-level describe.
    // 'jest/require-top-level-describe':'error',

    /**
     * eslint-plugin-node
     */

    // Promises > callbacks.
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',

    // We transpile ES syntax where appropriate so no need to lint it.
    'node/no-unsupported-features/es-syntax': 'off',

    // This is taken care of by TypeScript.
    'node/no-missing-import': 'off',

    /**
     * eslint-plugin-react
     */

    // These prevent some React bugs and performance issues.
    'react/jsx-no-constructed-context-values': 'error',
    'react/no-array-index-key': 'error',
    'react/no-danger': 'error',
    'react/no-unstable-nested-components': 'error',

    // Correct use of fragments.
    'react/jsx-no-useless-fragment': 'error',

    // Consistent React code style.
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-boolean-value': 'warn',
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-handler-names': 'warn',

    // Causes false positives for forwardRef components.
    // https://github.com/yannickcr/eslint-plugin-react/issues/3140
    'react/prop-types': 'off',

    /**
     * eslint-plugin-unicorn
     */

    // Abbreviations are fine, we can handle specific issues in PR reviews.
    'unicorn/prevent-abbreviations': 'off',

    // It's so easy to mess these up.
    'unicorn/custom-error-definition': 'error',

    // This is a contentious one that needs some further discussion around it.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v39.0.0/docs/rules/no-null.md#why
    'unicorn/no-null': 'off',

    // TODO: Enable this rule.
    'unicorn/filename-case': 'off',

    // Support in Node versions is not great yet and the 'import/order' rule takes care of
    // separating them so it's clear they're built-ins.
    // Node support: https://nodejs.org/api/esm.html#node-imports
    'unicorn/prefer-node-protocol': 'off',

    // This rule should ideally be enabled to allow for pure ESM code.
    // https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77
    // However, overall compatibility isn't quite there yet. Once ts-node ESM support is stable and
    // and we can use 'type: "module"' in package.json, we could enable this rule to prevent
    // runtime errors.
    // https://github.com/TypeStrong/ts-node/issues/1007
    // TODO: Enable when ESM support (particularly import.meta) is better across tooling.
    'unicorn/prefer-module': 'off',

    // This is a frontend app so should not use Node built-ins.
    'import/no-nodejs-modules': 'error',

    // This conflicts with TypeScript when you need to call setState with undefined.
    'unicorn/no-useless-undefined': 'off',
  },
  overrides: [
    {
      // TypeScript
      files: '**/*.{ts,tsx}',
      rules: {
        'no-undef': 'off',
      },
    },
    {
      // TypeScript TSX
      files: '**/*.tsx',
      rules: {
        // T extends unknown is sometimes necessary in .tsx files to avoid being confused with JSX.
        '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      },
    },
    {
      // JavaScript
      files: '**/*.{js,cjs,mjs}',
      rules: {
        // Can cause false positives in JS files.
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md#configuring-in-a-mixed-jsts-codebase
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      // JavaScript (.cjs)
      files: '**/*.cjs',
      rules: {
        // Assuming .cjs files are not being transformed, these allow CommonJS syntax.
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-commonjs': 'off',

        // And these disallow ESM syntax.
        'node/no-unsupported-features/es-syntax': 'error',
      },
    },
    {
      // TypeScript CommonJS
      files: '**/*.cts',
      rules: {
        // eslint-plugin-unicorn ignores .cjs files from this rule but not .cts files yet.
        'unicorn/prefer-module': 'off',
      },
    },
    {
      // Test files
      files: '**/*.@(test|spec).{js,jsx,ts,tsx}',
      rules: {
        // Adds support for understanding when it's ok to pass unbound methods to expect calls.
        // https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/unbound-method.md#how-to-use
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',

        // Scoping within describe blocks can be better for test organisation.
        'unicorn/consistent-function-scoping': 'off',
      },
    },
    {
      // Test files
      files: '**/@(jest.config|vite.config|webpack.config).{js,jsx,ts,tsx}',
      rules: {
        // These config files require default exports.
        'import/no-default-export': 'off',
      },
    },
    {
      // Server stuff
      files: ['./scripts/*.*', './src/server/*.*', './src/server/**/*.*'],
      rules: {
        'import/no-nodejs-modules': 'off',
      },
    },
  ],
};

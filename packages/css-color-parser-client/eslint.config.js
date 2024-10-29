import stylistic from '@stylistic/eslint-plugin';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginVue from 'eslint-plugin-vue';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  eslintPluginPrettierRecommended,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 140,
          endOfLine: 'auto',
        },
      ],
    },
  },
];

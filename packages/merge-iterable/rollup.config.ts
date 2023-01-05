import { stripCode } from '@codecb/rollup-plugin-strip-code';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import ts from 'rollup-plugin-ts';

const isDev =
  process.env['NODE_ENV'] === 'development' || !!process.env['ROLLUP_WATCH'];

const config = defineConfig({
  input: './src/index.ts',
  external: [/^node/],
  output: {
    dir: './dist',
    format: 'esm',
  },
  plugins: [
    stripCode({
      comments: [
        isDev
          ? { end: '#proOnlyEnd', start: '#proOnlyStart' }
          : { end: '#devOnlyEnd', start: '#devOnlyStart' },
      ],
    }),
    ts(),
    !isDev && terser({ compress: { passes: 2 } }),
  ],
});

export default config;

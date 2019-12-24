import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import external from 'rollup-plugin-peer-deps-external';

import pkg from './package.json';

const toCamelCaseName = (name) => name.split('-')
  .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
  .join('');

const scopePkgNameMatch = /^@[^/]+\/(.+)$/.exec(pkg.name);
let pkgName = pkg.name;

if (scopePkgNameMatch) {
  [, pkgName] = scopePkgNameMatch;
}

export default {
  input: 'src/index.js',
  output: [
    process.env.INCLUDE_UMD === 'true' && {
      name: toCamelCaseName(pkgName),
      file: `dist/${pkgName}.js`,
      format: 'umd',
      banner: `/* ${toCamelCaseName(pkgName)} v${pkg.version} by ${pkg.author} */`,
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'esm',
    },
  ].filter(Boolean),
  plugins: [
    external(),
    babel({
      runtimeHelpers: true,
      exclude: /node_modules/,
    }),
    resolve(),
    commonjs(),
  ],
};

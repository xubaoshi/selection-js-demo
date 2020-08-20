import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import css from 'rollup-plugin-css-only'
import { uglify } from 'rollup-plugin-uglify'

var env = process.env.NODE_ENV

var config = {
  input: 'src/index.js',
  output: {
    file: 'dist/selection.js',
    format: 'umd',
    name: 'UaTool',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    css({
      // Default behaviour is to write all styles to the bundle destination where .js is replaced by .css
      output: null,
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        pure_funcs: ['console.log'],
      },
      warnings: false,
    })
  )
}

export default config

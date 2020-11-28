import pug from "pug"
import babel from "@rollup/plugin-babel"
import postcss from "rollup-plugin-postcss"
import html from "@open-wc/rollup-plugin-html"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import { main } from "./package.json"

export default {
  input: main,
  output: { dir: "." },
  plugins: (() => {
    const extensions = [".js", ".ts"]

    const plugins = [
      postcss({ extract: true, minimize: false }),
      babel({ extensions, babelHelpers: "bundled" }),
      resolve({ extensions, preferBuiltins: true }),
      commonjs(),
    ]

    plugins.push(
      html({
        name: "index.html",
        inject: false,
        template: ({ bundle }) =>
          pug
            .compileFile("index.pug", { pretty: true })()
            .replace(
              "<!--bundle-->",
              bundle.entrypoints.map(({ importPath }) => `<script src="${importPath}"></script>`)
            ),
        minify: false,
      })
    )

    return plugins
  })(),
}

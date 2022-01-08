# rollup-plugin-rename-node-modules

🍣 A Rollup plugin to rename the `node_modules` created when bundling some external libries while using `preserveModules`

#### Why?

When you enable `preserveModules` but also want to bundle some stuff from dependencies (in my case it was `css` files so that `Next.js` can use my library),
`rollup` will put the files under `node_modules` folder under your output dir. This works locally just fine, but if you try to `npm publish` this output dir,
`npm` will automatically ignore `node_modules` inside the output dir so your package will not work when distributed through `npm`. I don't know if this is
a bug or a desired behavior, but this plugin fixes this by renaming the `node_modules` folder to something else and also check each file and rename any
relative imports pointing to this `node_modules` to the corrected path.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v8.0.0+) and Rollup

## Install

Using npm:

```bash
npm install rollup-plugin-rename-node-modules --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import renameNodeModules from "rollup-plugin-rename-node-modules";

export default {
  input: "src/index.js",
  output: {
    dir: "output",
    format: "cjs",
  },
  plugins: [renameNodeModules("ext")],
};
```

It takes a string and will rename files and mentions of `node_module` to the provided string. By default it's `external`. Since v1.3.0, you can also pass in a function that takes a `string` and returns a `string`.

It has an optional second parameter `sourceMap` which defaults to `true` and can disable source map generation:

```js
plugins: [renameNodeModules("ext", false)]
```

### Credit

Base idea taken from https://github.com/GiG/rollup-plugin-rename-extensions

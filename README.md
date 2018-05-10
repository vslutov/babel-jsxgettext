# @vslutov/jsxgettext-stream

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![js-standard-style][standard-image]][standard-url]


A tool like [jsxgettext](https://www.npmjs.com/package/jsxgettext), but works for `es6` + `jsx` that babel support.

Fork of [fraserxu/babel-jsxgettext](https://github.com/fraserxu/babel-jsxgettext). Improvements:
- Interface is compatible with gnu xgettext
- Gulp stream support

## Usage

```
$ npm install @vslutov/jsxgettext-stream --save-dev
```

### Gulp usage

```JavaScript
const xgettext = require("@vslutov/jsxgettext-stream")
const poConcat = require("gulp-po-concat")

gulp.task('i18n:pot', () =>
  gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe(xgettext({plugins: ['flow', 'objectRestSpread']}))
    .pipe(poConcat({domain: 'messages'}))
    .pipe(gulp.dest('src/i18n'))
)
```

### Program API

```JavaScript
var parser = require('@vslutov/jsxgettext-stream/parser')

/**
 * The parser function
 * @param  {Array}    inputs  The path to source JavaScript files
 * @param  {Array}    plugins Babel plugins, see https://github.com/babel/babel/tree/master/packages/babylon
 * @return {Promise}
 */
const main = async () {
  inputs = input_fnames.map(path => ({ path, contents: fs.readFileSync(path) }))
  const po_contents = await parser(inputs, [])
}
```


### Command line usage

Install globally with npm `npm install jsxgettext-stream -g`

```
  A tool like jsxgettext, but works for es6 + jsx that babel support

  Options
    --help                     Show this help
    --version                  Current version of package
    -p | --plugins             String - Babylon plugins list (`jsx` is always included)'
    -i | --input               String - The path to soure JavaScript file
    -o | --output              String - The path of the output PO file

  Usage
    $ jsxgettext-stream --help
    $ jsxgettext-stream <input> <output>

  Examples
    $ jsxgettext-stream ./test/*.js ./test.po
    $ jsxgettext-stream --plugins "classProperties,objectRestSpread" ./test/*.js test.po
```

### License
MIT

[npm-image]: https://img.shields.io/npm/v/@vslutov/jsxgettext-stream.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@vslutov/jsxgettext-stream
[downloads-image]: http://img.shields.io/npm/dm/@vslutov/jsxgettext-stream.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/@vslutov/jsxgettext-stream
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: https://github.com/feross/standard

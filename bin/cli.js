#!/usr/bin/env node

var path = require('path')
var meow = require('meow')
var parser = require('../')

var cli = meow(`
  Options
    --help                     Show this help
    --version                  Current version of package
    -p, --plugins              String - Babylon plugins list ('jsx' is always included)
    -i, --input                String - The path to soure JavaScript file
    -o, --output               String - The path of the output PO file

  Usage
    $ babel-jsxgettext <input> <output>

  Examples
    $ babel-jsxgettext ./test/*.js test.po',
    $ babel-jsxgettext --plugins "classProperties,objectRestSpread" ./test/*.js test.po',
`)

let plugins = cli.flags.p || cli.flags.plugins || ''
plugins = plugins.split(',')
const output = path.join(process.cwd(), cli.flags.o || cli.flags.output || 'messages.pot')

parser(cli.input, output, plugins, function (err) {
  if (err) throw err
  console.log('Job completed!')
})

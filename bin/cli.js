#!/usr/bin/env node

const path = require('path')
const meow = require('meow')
const fs = require('mz/fs')
const parser = require('../parser')

const main = async () => {
  const cli = meow(`
    Options
      --help                     Show this help
      --version                  Current version of package
      -p, --plugins              String - Babylon plugins list ('jsx' and 'objectRestSpread' are always included)
      -i, --input                String - The path to soure JavaScript file
      -o, --output               String - The path of the output PO file

    Usage
      $ babel-jsxgettext <input> <output>

    Examples
      $ babel-jsxgettext ./test/*.js -o test.po',
      $ babel-jsxgettext --plugins "classProperties,objectRestSpread" ./test/*.js -o test.po',
  `)

  const plugins = (cli.flags.p || cli.flags.plugins || '').split(',')
  const output = cli.flags.o || cli.flags.output || 'messages.po'

  const inputs = []
  for (file of cli.input) {
    const resolvedFilePath = path.join(process.cwd(), file)
    const src = await fs.readFile(resolvedFilePath, 'utf8')
    inputs.push(src)
  }

  const buffer = await parser(inputs, plugins)

  if (output === '-') {
    process.stdout.write(buffer)
  } else {
    await fs.writeFile(path.join(process.cwd(), output), buffer)
  }
}

if (typeof require != 'undefined' && require.main==module) {
  main();
}

#!/usr/bin/env node

const path_join = require('path').join
const meow = require('meow')
const fs = require('mz/fs')
const parser = require('../parser')

const USAGE = `
Options
  --help                     Show this help
  --version                  Current version of package
  -p, --plugins              String - Babylon plugins list ('jsx' is always included)
  -i, --input                String - The path to soure JavaScript file
  -o, --output               String - The path of the output PO file

Usage
  $ jsxgettext-stream <input> <output>

Examples
  $ jsxgettext-stream ./test/*.js -o test.po',
  $ jsxgettext-stream --plugins "classProperties,objectRestSpread" ./test/*.js -o test.po
`

const main = async () => {
  const cli = meow(USAGE)

  const plugins = (cli.flags.p || cli.flags.plugins || '').split(',')
  const output = cli.flags.o || cli.flags.output || 'messages.po'

  const inputs = []
  for (file of cli.input) {
    const path = path_join(process.cwd(), file)
    const contents = await fs.readFile(path)
    inputs.push({path, contents})
  }

  const buffer = await parser(inputs, plugins)

  if (output === '-') {
    process.stdout.write(buffer)
  } else {
    await fs.writeFile(path_join(process.cwd(), output), buffer)
  }
}

if (typeof require != 'undefined' && require.main==module) {
  main()
}

const fs = require('fs')
const path = require('path')
const gettextParser = require('gettext-parser')
const babylon = require('babylon')
const walk = require('babylon-walk')

const functionNames = require('./lib/constant').DEFAULT_FUNCTION_NAMES
const DEFAULT_HEADERS = require('./lib/constant').DEFAULT_HEADERS

/**
 * The parser function
 * @param  {String}   input  The path to soure JavaScript file
 * @param  {String}   output The path of the output PO file
 * @param  {Function} cb     The callback function
 */
function parser (inputs, output, plugins, cb) {
  const data = {
    charset: 'UTF-8',
    headers: DEFAULT_HEADERS,
    translations: {
      context: {}
    }
  }

  const defaultContext = data.translations.context

  const headers = data.headers
  headers['plural-forms'] = headers['plural-forms'] || DEFAULT_HEADERS['plural-forms']
  headers['content-type'] = headers['content-type'] || DEFAULT_HEADERS['content-type']

  const nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1]

  inputs
    .forEach(function (file) {
      const resolvedFilePath = path.join(process.cwd(), file)
      const src = fs.readFileSync(resolvedFilePath, 'utf8')

      let ast
      try {
        ast = babylon.parse(src, {
          allowHashBang: true,
          ecmaVersion: Infinity,
          sourceType: 'module',
          plugins: ['jsx', 'objectRestSpread'].concat(plugins)
        })
      } catch (e) {
        throw new Error(`SyntaxError in ${file} (line: ${e.loc.line}, column: ${e.loc.column})`)
      }

      walk.simple(ast.program, {
        CallExpression: function (node) {
          if (functionNames.hasOwnProperty(node.callee.name) ||
            (node.callee.property && functionNames.hasOwnProperty(node.callee.property.name))) {
            const functionName = functionNames[node.callee.name] || functionNames[node.callee.property.name]
            const translate = {}

            const args = node.arguments
            for (var i = 0, l = args.length; i < l; i++) {
              const name = functionName[i]

              if (name && name !== 'count' && name !== 'domain') {
                const arg = args[i]
                const value = arg.value

                if (value) {
                  const line = node.loc.start.line
                  translate[name] = value
                  translate['comments'] = {
                    reference: file + ':' + line
                  }
                }

                if (name === 'msgid_plural') {
                  translate.msgstr = []
                  for (var p = 0; p < nplurals; p++) {
                    translate.msgstr[p] = ''
                  }
                }
              }
            }

            let context = defaultContext
            const msgctxt = translate.msgctxt

            if (msgctxt) {
              data.translations[msgctxt] = data.translations[msgctxt] || {}
              context = data.translations[msgctxt]
            }

            context[translate.msgid] = translate
          }
        }
      })
    })

  fs.writeFile(output, gettextParser.po.compile(data), function (err) {
    if (err) {
      cb(err)
    }
    cb(null)
  })
}

module.exports = parser

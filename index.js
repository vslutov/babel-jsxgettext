var fs = require('fs')
var path = require('path')
var gettextParser = require('gettext-parser')
var babylon = require('babylon')
var walk = require('acorn/dist/walk')

var functionNames = require('./lib/constant').DEFAULT_FUNCTION_NAMES
var DEFAULT_HEADERS = require('./lib/constant').DEFAULT_HEADERS
var jsxBase = require('./lib/base')

/**
 * The parser function
 * @param  {String}   input  The path to soure JavaScript file
 * @param  {String}   output The path of the output PO file
 * @param  {Function} cb     The callback function
 */
function parser (inputs, output, cb) {
  var data = {
    charset: 'UTF-8',
    headers: DEFAULT_HEADERS,
    translations: {
      context: {}
    }
  }

  var defaultContext = data.translations.context

  var headers = data.headers
  headers['plural-forms'] = headers['plural-forms'] || DEFAULT_HEADERS['plural-forms']
  headers['content-type'] = headers['content-type'] || DEFAULT_HEADERS['content-type']

  var nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1]

  Object.setPrototypeOf(jsxBase, walk.base)

  inputs
    .map(function (file) {
      file = path.join(process.cwd(), file)
      return fs.readFileSync(file, 'utf8')
    })
    .forEach(function (src) {
      var ast = babylon.parse(src, {
        allowHashBang: true,
        ecmaVersion: Infinity,
        sourceType: 'module',
        plugins: {jsx: true},
        features: {
          'es7.classProperties': true
        }
      })

      walk.simple(ast.program, {
        CallExpression: function (node) {
          if (functionNames.hasOwnProperty(node.callee.name) ||
            node.callee.property && functionNames.hasOwnProperty(node.callee.property.name)) {
            var functionName = functionNames[node.callee.name] || functionNames[node.callee.property.name]
            var translate = {}

            var args = node.arguments
            for (var i = 0, l = args.length; i < l; i++) {
              var name = functionName[i]

              if (name && name !== 'count' && name !== 'domain') {
                var arg = args[i]
                var value = arg.value

                if (value) {
                  translate[name] = value
                }

                if (name === 'msgid_plural') {
                  translate.msgstr = []
                  for (var p = 0; p < nplurals; p++) {
                    translate.msgstr[p] = ''
                  }
                }
              }
            }

            var context = defaultContext
            var msgctxt = translate.msgctxt
            if (msgctxt) {
              data.translations[msgctxt] = data.translations[msgctxt] || {}
              context = data.translations[msgctxt]
            }

            context[translate.msgid] = translate
          }
        }
      }, jsxBase)
    })

  fs.writeFile(output, gettextParser.po.compile(data), function (err) {
    if (err) {
      cb(err)
    }
    cb(null)
  })
}

module.exports = parser

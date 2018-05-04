const PluginError = require("plugin-error")
const through = require("through2")
const path = require("path")

const parser = require("./parser")
const pluginName = "jsxgettext-stream"

module.exports = (config) => {
  config = Object.assign({
    plugins: []
  }, config)

  return through.obj(function (file, enc, cb) {
    const { contents } = file

    if (file.isNull()) {
      this.push(file)
      return cb()
    }

    if (file.isStream()) {
      this.emit("error", new PluginError(pluginName, 'Streaming not supported'))
      return cb()
    }

    file.contents = parser(contents, config.plugins)

    this.push(file)
    cb()
  })
}

const PluginError = require("plugin-error")
const through = require("through2")
const path = require("path")

const parser = require("./parser")
const pluginName = "jsxgettext-stream"

module.exports = ({plugins = []} = {}) => {

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      this.push(file)
      return cb()
    }

    if (file.isStream()) {
      this.emit("error", new PluginError(pluginName, 'Streaming not supported'))
      return cb()
    }

    const self = this
    parser([file], plugins).then(result => {
      file.contents = result
      cb(null, file)
    }).catch(e => cb(e, null))
  })
}

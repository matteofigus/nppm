const async = require('async')
const fs = require('fs-extra')
const npm = require('npm')
const path = require('path')
const semver = require('semver')

const defaults = {
  path: './nppm_node_modules',
  temp: '__temp'
}

const nppm = {}

const getPath = (options) => {
  let dest = options.path || defaults.path

  if (dest.slice(-1) !== path.sep) { dest += path.sep }

  return dest
}

const getTempPath = options => path.resolve(getPath(options), options.temp || defaults.temp)

const getFinalPath = (options, moduleAtVersion) => path.resolve(getPath(options), moduleAtVersion)

nppm.install = (options, callback) => {
  let tempPath = getTempPath(options)
  const results = []

  npm.load({}, (err) => {
    async.eachSeries(options.dependencies, (dependency, next) => {
      console.log(`installing ${dependency}`)

      if (err) { return next(err) }

      npm.commands.install(tempPath, [dependency], (err, result) => {
        if (err) { return next(err) }

        const moduleAndVersion = result[0][0]
        const installationPath = result[0][1]

        const current = {
          name: dependency.split('@')[0],
          requestedVersion: dependency.split('@')[1] || '',
          version: moduleAndVersion.split('@')[1],
          path: getFinalPath(options, moduleAndVersion)
        }

        results.push(current)

        const move = cb => fs.move(installationPath, current.path, cb)

        fs.access(current.path, (err) => {
          if (!err) {
            return fs.remove(current.path, (err) => {
              if (err) { return next(err) }

              move(next)
            })
          }

          move(next)
        })
      })
    }, (err) => {
      if (err) { return callback(err) }

      fs.remove(tempPath, (err) => callback(err, results))
    })
  })
}

nppm.init = (options, callback) => {
  if (typeof (options) === 'function') {
    callback = options
    options = {}
  }

  const src = getPath(options)
  fs.readdir(src, (err, result) => {
    if (err) { return callback(err) }

    async.filter(result, (file, next) => {
      fs.lstat(path.resolve(src, file), (err, info) => {
        next(err, info.isDirectory() && file.indexOf('@') > 0)
      })
    }, (err, dirs) => {
      const dependencies = {}
      for (let i = 0; i < dirs.length; i++) {
        const dep = dirs[i].split('@')[0]
        const version = dirs[i].split('@')[1]
        dependencies[dep] = dependencies[dep] || []
        dependencies[dep].push(version)
      }
      nppm.require = (dependency) => {
        const dep = dependency.split('@')[0]
        const version = dependency.split('@')[1] || ''

        if (!dependencies[dep] || dependencies[dep].length === 0) { return undefined }

        const matched = semver.maxSatisfying(dependencies[dep], version)

        return matched ? require(path.resolve(src, `${dep}@${matched}`)) : undefined
      }
      callback(err, dirs)
    })
  })
}

module.exports = nppm

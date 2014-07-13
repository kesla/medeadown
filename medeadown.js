var fs = require('fs')

  , AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
  , Medea = require('medea')

  , MedeaDOWN = function (location) {
      if (!(this instanceof MedeaDOWN))
        return new MedeaDOWN(location)

      AbstractLevelDOWN.call(this, location)
      this.db = new Medea()
    }

require('util').inherits(MedeaDOWN, AbstractLevelDOWN)

MedeaDOWN.prototype._open = function (options, callback) {
  var self = this

  this.db.open(this.location, callback)
}

MedeaDOWN.prototype._close = function (callback) {
  this.db.close(callback)
}

MedeaDOWN.prototype._put = function (key, value, options, callback) {
  this.db.put(key, value, callback)
}

MedeaDOWN.prototype._get = function (key, options, callback) {
  var asBuffer = options.asBuffer !== false

  this.db.get(key, function (err, value) {
    if (!err && value === undefined)
      err = new Error('NotFound:')

    if (value && !asBuffer)
      value = value.toString()

    callback(err, value)
  })
}

MedeaDOWN.prototype._del = function (key, options, callback) {
  this.db.remove(key, callback)
}

// Not really a batch - need support in Medea for this to work
MedeaDOWN.prototype._batch = function (array, options, callback) {
  var db = this.db

  require('run-parallel')(
      array.map(function (operation) {
        return function (done) {
          if (operation.type === 'put')
            db.put(operation.key, operation.value, done)
          else
            db.remove(operation.key, done)
        }
      })
    , callback
  )
}

module.exports = MedeaDOWN
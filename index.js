// Generated by CoffeeScript 1.4.0
(function() {
  var Mongoose, Schema, Session, SessionSchema, SessionStore, defaultCallback, key, mongoose, value,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mongoose = require('mongoose');

  mongoose = new Mongoose.Mongoose();

  for (key in Mongoose) {
    value = Mongoose[key];
    if (!(mongoose[key] != null) && Mongoose.hasOwnProperty(key)) {
      mongoose[key] = value;
    }
  }

  Schema = mongoose.Schema;

  SessionSchema = new Schema({
    sid: {
      type: String,
      required: true,
      unique: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    },
    expires: {
      type: Date,
      index: true
    }
  });

  Session = mongoose.model('Session', SessionSchema);

  defaultCallback = function(err) {};

  SessionStore = (function(_super) {

    __extends(SessionStore, _super);

    function SessionStore(options) {
      var _base, _base1, _ref, _ref1;
      this.options = options != null ? options : {};
      if ((_ref = (_base = this.options).url) == null) {
        _base.url = "mongodb://localhost/sessions";
      }
      if ((_ref1 = (_base1 = this.options).interval) == null) {
        _base1.interval = 60000;
      }
      if (mongoose.connection.readyState === 0) {
        mongoose.connect(this.options.url);
        setInterval(function() {
          return Session.remove({
            expires: {
              '$lte': new Date()
            }
          }, defaultCallback);
        }, this.options.interval);
      }
    }

    SessionStore.prototype.get = function(sid, cb) {
      if (cb == null) {
        cb = defaultCallback;
      }
      return Session.findOne({
        sid: sid
      }, function(err, session) {
        var data;
        if (err || !session) {
          return cb(err);
        } else {
          data = session.data;
          try {
            if (typeof data === 'string') {
              data = JSON.parse(data);
            }
            return cb(null, data);
          } catch (err) {
            return cb(err);
          }
        }
      });
    };

    SessionStore.prototype.set = function(sid, data, cb) {
      var expires, session;
      if (cb == null) {
        cb = defaultCallback;
      }
      if (!data) {
        return this.destroy(sid, cb);
      } else {
        try {
          if (data.cookie) {
            expires = data.cookie.expires;
          }
          if (expires == null) {
            expires = null;
          }
          session = {
            sid: sid,
            data: data,
            expires: expires
          };
          return Session.update({
            sid: sid
          }, session, {
            upsert: true
          }, cb);
        } catch (err) {
          return cb(err);
        }
      }
    };

    SessionStore.prototype.destroy = function(sid, cb) {
      if (cb == null) {
        cb = defaultCallback;
      }
      return Session.remove({
        sid: sid
      }, cb);
    };

    SessionStore.prototype.all = function(cb) {
      if (cb == null) {
        cb = defaultCallback;
      }
      return Session.find({}, 'sid expires', function(err, sessions) {
        var now, session;
        if (err || !sessions) {
          return cb(err);
        } else {
          now = Date.now();
          sessions = sessions.filter(function(session) {
            if (!session.expires || session.expires.getTime() > now) {
              return true;
            }
          });
          return cb(null, (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = sessions.length; _i < _len; _i++) {
              session = sessions[_i];
              _results.push(session.sid);
            }
            return _results;
          })());
        }
      });
    };

    SessionStore.prototype.clear = function(cb) {
      if (cb == null) {
        cb = defaultCallback;
      }
      return Session.collection.drop(cb);
    };

    SessionStore.prototype.length = function(cb) {
      if (cb == null) {
        cb = defaultCallback;
      }
      return Session.count({}, cb);
    };

    return SessionStore;

  })(require('connect').session.Store);

  module.exports = SessionStore;

  module.exports.Session = Session;

}).call(this);

var uuid = require('uuid-pure').newId;
var resware = require('resware');
var cookieParser = require('connect').cookieParser();
var Hash = require('hashish');

exports = module.exports = function (options) {
    options = options || {};
    var store = options.store;
    var cookieName = options.cookieName || 'session_id';
    var sessions = exports.wrap(store, options.sessions || {});
    
    if (store && store.all) {
        store.all(function (err, xs, ys) {
            if (err) console.error(err)
            else if (Array.isArray(xs) && Array.isArray(ys)) {
                if (typeof xs[0] === 'string') {
                    // the supermarket way
                    sessions = exports.wrap(store, Hash.zip(xs, ys));
                }
                else {
                    // the nstore way
                    var keys = ys.map(function (y) { return y.key });
                    sessions = exports.wrap(store, Hash.zip(keys, xs));
                }
            }
            else {
                // a guess
                sessions = exports.wrap(store, xs);
            }
        })
    }
    
    return function (req, res, next) {
        // hackishly load some middlewares if not already loaded
        if (!res.setCookie) resware.wrap(res);
        if (!req.cookies) cookieParser(req, res, function () {});
        
        var id = req.cookies[cookieName];
        if (!id || !sessions[id]) {
            id = uuid(64);
            res.setCookie(cookieName, id, { path : options.path || '/' });
            req.cookies[cookieName] = id;
            sessions[id] = {};
        }
        
        req.sessionID = id;
        req.sessions = sessions;
        
        Object.defineProperty(req, 'session', {
            get : function () {
                return sessions[id];
            },
            set : function (s) {
                sessions[id] = s;
            },
        });
        
        next();
    }
};

var Proxy = require('node-proxy');
exports.wrap = function (store, sessions) {
    var taint = {};
    var set = store ? (store.set || store.save).bind(store) : null;
    
    function update (key) {
        if (!taint[key] && store) {
            process.nextTick(function () {
                if (sessions.hasOwnProperty(key)) {
                    set(key, sessions[key], function (err) {
                        if (err) console.error(err)
                    });
                }
                else {
                    store.remove(key);
                }
                taint[key] = undefined;
            });
        }
        taint[key] = true;
    }
    
    function wrapRoot (rootKey, obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        var setTaint = update.bind({}, rootKey);
        var wrap = wrapRoot.bind({}, rootKey);
        
        return Proxy.create({
            get : function (recv, name) {
                if (name === 'toJSON' && !obj.hasOwnProperty(name)) {
                    return function () { return obj };
                }
                else return wrap(obj[name]);
            },
            set : function (recv, name, value) {
                setTaint();
                obj[name] = value;
                return wrap(obj[name]);
            },
            enumerate : function () {
                return Object.keys(obj)
            },
            delete : function (name) {
                if (obj.propertyIsEnumerable(name)) {
                    setTaint();
                }
                delete obj[name];
            },
            fix : function () {
                return undefined;
            },
        }, Object.getPrototypeOf(obj))
    }
    
    return Proxy.create({
        get : function (recv, name) {
            if (name === 'toJSON' && !sessions.hasOwnProperty(name)) {
                return function () { return sessions }
            }
            else return wrapRoot(name, sessions[name])
        },
        set : function (recv, name, value) {
            sessions[name] = value;
            update(name);
            return wrapRoot(name, value);
        },
        enumerate : function () {
            return Object.keys(sessions)
        },
        delete : function (name) {
            update(name);
            delete session[name];
        },
        fix : function () {
            return undefined;
        },
    }, Object.getPrototypeOf(sessions));
};

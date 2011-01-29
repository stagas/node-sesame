sesame
======

Sesame is a session middleware for express/connect for amazingly simple
sessions. To update sessions, just modify `req.session`.

example
=======

    var connect = require('connect');
    var webserver = connect.createServer();
    webserver.use(require('sesame')());
    
    webserver.use(connect.router(function (app) {
        app.get('/', function (req, res) {
            req.session.times = (req.session.times || 0) + 1;
            
            res.writeHead(200, { 'Content-Type' : 'text/plain' });
            res.end(req.session.times + ' times!');
        });
    }));
    
    console.log('Listening on 9090');
    webserver.listen(9090);

Run this program and it will repeatedly increment a counter. Woo!
However!

When you restart the above server or when it crashes you'll lose all of your
sessions! Never fear, with sesame it's super easy to persist sessions across
restarts! Just swap out

    webserver.use(require('sesame')());

with this to use nStore:

    webserver.use(require('sesame')({
        store : require('nStore')(__dirname + '/nstore.db')
    }));

or if you want to use supermarket:

    webserver.use(require('sesame')({ 
        store : new(require('supermarket'))({
            filename : __dirname + '/supermarket.db', json : true,
        })
    }));

If your favorite database backend isn't listed you should send me a pull
request!

Check out
[the examples/ directory](https://github.com/substack/node-sesame/tree/master/examples)
for more examples.

the secret sauce
================

Wait a moment! How can you just throw a database at this AND modify deeply
nested elements in `req.session`, you may be asking yourself?

Under the hood, harmony proxies trap updates to the `req.session` object to keep
the sessions on disk in sync with the in-memory sessions.

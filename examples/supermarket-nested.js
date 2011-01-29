var connect = require('connect');
var webserver = connect.createServer();

webserver.use(require('sesame')({
    store : new(require('supermarket'))({
        filename : __dirname + '/supermarket-nested.db',
        json : true,
    })
}));

webserver.use(connect.router(function (app) {
    app.get('/', function (req, res) {
        if (!req.session.foo) {
            req.session.foo = { bar : { baz : 1 } };
        }
        req.session.foo.bar.baz *= 2;
        
        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end('baz: ' + req.session.foo.bar.baz);
    });
}));

console.log('Listening on 9090');
webserver.listen(9090);

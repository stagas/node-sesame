var connect = require('connect');
var webserver = connect.createServer();

webserver.use(require('sesame')({
    store : new(require('supermarket'))({
        filename : __dirname + '/supermarket.db',
        json : true,
    })
}));

webserver.use(connect.router(function (app) {
    app.get('/', function (req, res) {
        req.session.times = (req.session.times || 0) + 1;
        
        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end(req.session.times + ' times!');
    });
}));

console.log('Listening on 9090');
webserver.listen(9090);

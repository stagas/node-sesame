var connect = require('connect');
var webserver = connect.createServer();
webserver.use(require('sesame')());

webserver.use(connect.router(function (app) {
    app.get('/', function (req, res) {
        req.session.times = (req.session.times || 0) + 1;
        
        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        
        res.write('req.session = ' + JSON.stringify(req.session) + '\r\n');
        res.write('req.sessions = ' + JSON.stringify(req.sessions) + '\r\n');
        res.write('req.sessionID = ' + JSON.stringify(req.sessionID) + '\r\n');
        res.end(req.session.times + ' times!');
    });
}));

console.log('Listening on 9090');
webserver.listen(9090);

var express = require('express');
var app = express.createServer();
app.use(require('sesame')());

app.get('/', function (req, res) {
    req.session.times = (req.session.times || 0) + 1;
    
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end(req.session.times + ' times!');
});

console.log('Listening on 9090');
app.listen(9090);

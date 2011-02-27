var assert = require('assert');
var sesame = require('sesame');

exports.json = function () {
    var req = sesame.wrap(null, {
        zzz : { a : 1, b : 2 }
    });
    
    assert.eql(
        JSON.stringify(req.zzz),
        JSON.stringify({ a : 1, b : 2 })
    );
    
    assert.eql(
        JSON.stringify(req),
        JSON.stringify({ zzz : { a : 1, b : 2 } })
    );
};

'use strict';

var WikipediaStream = require('../lib/wikipediastream.js');

suite('Stream Test', function(){
    test('We can get at least one piece of data', function(done){
        var ws = new WikipediaStream();
        this.timeout(60000);

        ws.on("data", function(data){
            if(data.url){
                done();
            }
        });
    });
});

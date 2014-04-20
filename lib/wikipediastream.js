/*
 * github-timeline-stream
 * http://github.com/arscan/github-timeline-stream
 *
 * Copyright (c) 2014 Rob Scanlon
 * Licensed under the MIT license.
 */

'use strict';

var stream = require('stream');
var util = require('util');
var irc = require('irc');

var stripColors = function(text){

    var ret = text.replace(/\u0003\d{1,2}/g,'');
    ret = ret.replace(/\u0003/g,'');

    return ret;
};

var locationIsIP4  = function(loc){
    return !!/^\d+\.\d+\.\d+\.\d+$/.exec(loc);
};

/* create a message */

var parse = function(m,c){
    var ob = {};
    var ret = "";

    m = stripColors(m);

    ob["language"] = c.substring(1,3);

    var rePattern = new RegExp(/\[\[([^\]]*)\]\]/);
    ret = rePattern.exec(m);

    if(ret.length > 0){
        ob["page"] = ret[1];
    }

    rePattern = new RegExp(/\[\[[^\]]*\]\]([^h]*)/);
    ret = rePattern.exec(m);

    if(ret && ret.length > 0 && ret[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '').length > 0 && ret[1].length < 5){
        ob["type"] = (ret[1].replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    }

    rePattern = new RegExp(/(http\:\/\/[^\*]*)/);
    ret = rePattern.exec(m);

    if(ret && ret.length > 0){
        ob["url"] = (ret[1]);
    }

    rePattern = new RegExp(/http\:\/\/[^\s]*\s?\*\s?([^\*]*)*/);
    ret = rePattern.exec(m);
    if(ret && ret.length > 0 && ret[1]){
        var newval = ret[1].replace(/\s\s*$/, '');
        if(locationIsIP4(newval)){
            ob["ip"] = newval;
        } else {
            ob["user"] = newval;
        }
    }

    rePattern = new RegExp(/\(([(\+\-]\d+)\)/);
    ret = rePattern.exec(m);
    if(ret && ret.length > 0){
        ob["size"] = (ret[1]);
    }

    return ob;
    
};


function WikipediaStream (_opts) {

    var _this = this;
    var opts = {};

    var defaults = {
        server: "irc.wikimedia.org",
        user: "nodeuser",
        languages: [
            "en",
            "nl",
            "de",
            "sv",
            "fr",
            "it",
            "ru",
            "es",
            "pls",
            "war",
            "ceb",
            "vi",
            "ja",
            "pt",
            "zh"
        ]
    };

    for(var o in defaults){
        if(_opts === undefined || !_opts[o]){
            opts[o] = defaults[o];
        } else {
            opts[o] = _opts[o];
        }
    }

    var channels = [];

    for(var i = 0; i< opts.languages.length; i++){
        channels.push("#" + opts.languages[i] + ".wikipedia");
    }

    var client = new irc.Client(opts.server, opts.user, {channels: channels, debug: false});

    client.on('error', function(error){
        console.log("ERROR: " + error);
    });

    client.on('message', function (from, to, message) {
        _this.push(parse(message, to));

    });

    stream.Readable.call(this, { objectMode : true });

}

util.inherits(WikipediaStream, stream.Readable);

WikipediaStream.prototype._read = function(){};

module.exports = WikipediaStream;

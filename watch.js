#!/usr/local/bin/node
/*
./watch.js mad-men -s2 -e1

or add to ~/.bashrc:
watch()(
	PATH_TO_THIS_FILE/watch.js $@
)
*/

var DEFAULT_WEB_APP = '/Applications/Google Chrome.app'
,series = 'mad-men'
,season = 1
,episode = 1

var http = require('http')
,Url = require('url')
,cp = require('child_process')


var argv = process.argv.slice(2)
argv.forEach(function(arg){
	if (arg.indexOf('-') != 0)
		return series = arg
	var argVal = arg.substr(2)
	switch (arg.substr(1,1)) {
		case 's': season = argVal; break
		case 'e': episode = argVal; break
	}
})
console.log(['series: '+series,'season: '+season,'episode: '+episode].join('\n'))

console.log('searching for episode list...')
getUrl('http://watch8now.info/stream/'+series+'-s'+season+'e'+episode+'.html',function(err,data){
	if (err) return console.error(err)
	var m = data.toString().match(/<a href="([^"]+)".+youwatch\.org/i)
	if (!m) return console.error('Unable to find episode link')
	console.log('searching for video...')
	getUrl(m[1],function(err,data){
		if (err) return console.error(err)
		var m = data.toString().match(/<iframe src="([^"]+)"/i)
		if (!m) return console.error('Unable to find episode iframe')
		var cmd = 'open -a"'+DEFAULT_WEB_APP+'" "'+m[1]+'"'
		//console.log(cmd)
		cp.exec(cmd)
	})
})


function getUrl(url,cb){
	var urlp = Url.parse(url)
	var requestOpts = {
		hostname: urlp.hostname
		,path: urlp.pathname
		,port: urlp.port || 80
		,method: 'GET'
	};
	var buf = new Buffer(0)
	http.request(requestOpts,function(res){
		if (res.statusCode == 404) return done('404')
		res.on('data',function(chunk){
			buf = Buffer.concat([buf,chunk])
		})
		.on('end',function(){
			done(false,buf)
		})
		.on('error',done)
	})
	.on('error',done)
	.end()
	function done(err,data){
		cb(err,data)
		done = function(){}
	}
}


/*
node ~/Dropbox/alec_repo/chrome_extensions/jector/deminify.js

vars
	(.+?) = (.+) => '$1': $2
*/
var fs = require('fs')
,inFile = __dirname+'/'+(process.argv[2]||'~putlocker.js')
,outFile = inFile+'.demin'

var vars = { 'i9': "startTimeout", 'g9': "attachEvent", 't9': "noScrollPlease", 'b9': "write", 'G9': "readyState", 'z9': "__pushupInited", 'q4': "pushupUrl", 'J9': "mahClicks", 'T9': "onClickTrigger", 'h9': "toString", 'm9': "split", 'u9': 2592000000, 'n9': "call", 'C5': "hostname", 'Y5': "host", 'f5': "pathname", 'c5': "pomc", 'Q': "test", 't5': "screen", 'w5': "tryToEscapeIframe", 'A4': "clientY", 'F4': "clientX", 'o': "addEventListener", 'h': "removeChild", 'N4': "startClicks", 'V': "sessionClicks", 'r': "sessionTimeout", 'B9': "prefetch", 'd4': "head", 'P4': "focus", 'E9': "availHeight", 'U9': "availWidth", 'j9': "getTime", 'O4': "zoneId", 'i': "clicksSinceSessionStart", 'W': "seriesStart", 'Z4': "querySelectorAll", 'k4': "match", 'G': "cookie", 'f4': "limLo", 'M4': "SS", 'y': "location", 'R': "open", 'c4': "htmlNode", 'v9': "replace", 'V4': "random", 'W4': "offsetWidth", 'y4': "offsetHeight", 'R4': "left", 'a': "body", 'C4': "flashed", 'L': "join", 'p4': 1, 'e9': "indexOf", 'a4': "substr", 'd9': "async", 'M9': "type", 'I4': "scripts", 'D9': "ppuTimeout", 'o4': "lastPpu", 'b': "clicksSinceLastPpu", 'F': "ppuClicks", 'Y4': "ppuQnty", 'H': "ppuCount", 'd': "domainSeriesForLimLo", 'S': "parentNode", 'X9': "push", 'T': "includes", 'K4': "className", 'D4': "toLowerCase", 'w4': "tagName", 'K9': "inj", 'z': "appendChild", 's9': "retargetingFrameUrl", 'i4': "src", 'q': "style", 't4': "target", 'A': "url", 'r4': "href", 'P': "createElement" }


fs.readFile(inFile, function(err,data){
	if (err)
		return console.log(err)
	var map = sortReplacements(vars)
	console.log(map)
	var newScript = data.toString()
	Object.keys(map).forEach(function(k){
		var v = map[k]
		newScript = newScript.replace(new RegExp('\\('+k+'\\)','g'), "('"+v+"')")
		newScript = newScript.replace(new RegExp('\\['+k+'\\]','g'), "['"+v+"']")
		newScript = newScript.replace(new RegExp(' '+k+',','g'), " '"+v+"',")
	})
	fs.writeFile(outFile, newScript)
})

function sortReplacements(vars){
	var varsArr = Object.keys(vars), map = {}
	varsArr.sort(function(a,b){
		return b.length-a.length
	})
	//console.log(varsArr)
	varsArr.forEach(function(k,i){
		map[k] = vars[k]
	})
	return map
}

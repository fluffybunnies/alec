/*
winner: prog3 (barely)
	but instanceof is not reliable, so winner here really is Array.isArray
*/

IsArray = Test.extend({
	runProgNTimes: 1000000
	,progType: 'array'
	,preTest: function(){
		return [$('div'), void 0, 0, 1, false, true, '', 'wef', {}, [], void 0, null, [], [], [], [], [], []];
	}

	// requires ES5
	,prog1Label: 'Array.isArray'
	,prog1: function(v){
		var res = Array.isArray(v);
		return res?1:0;
	}

	// requires jQuery
	,prog2Label: '$.isArray'
	,prog2: function(v){
		var res = $.isArray(v);
		return res?1:0;
	}

	// not 100% reliable: http://web.mit.edu/jwalden/www/isArray.html
	,prog3Label: 'instanceof Array'
	,prog3: function(v){
		var res = v instanceof Array;
		return res?1:0;
	}

});

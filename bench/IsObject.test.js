/*
winner: prog1

Note: these don't all do the same thing
*/

IsObject = Test.extend({
	runProgNTimes: 1000000
	,progType: 'array'
	,preTest: function(){
		return [$('div'), void 0, 0, 1, false, true, '', 'wef', {}, [], void 0, null, {}, {}, {}, {}, {}, {}];
	}
	,prog1: function(v){
		var res = !!(v && typeof(v) == 'object'); // typeof null == 'object'
		return res?1:0;
	}
	,prog2: function(v){
		var res = $.isPlainObject(v);
		return res?1:0;
	}
	,prog3: function(v){
		var res = v instanceof Object;
		return res?1:0;
	}
});

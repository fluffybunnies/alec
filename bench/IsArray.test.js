/*
winner: prog1
	these actually go in order fastest to slowest
*/

IsArray = Test.extend({
	runProgNTimes: 1000000
	,progType: 'array'
	,preTest: function(){
		return [$('div'), void 0, 0, 1, false, true, '', 'wef', {}, [], void 0, null, [], [], [], [], [], []];
	}
	,prog1: function(v){
		var res = Array.isArray(v);
		return res?1:0;
	}
	,prog2: function(v){
		var res = $.isArray(v);
		return res?1:0;
	}
	,prog3: function(v){
		var res = v instanceof Array;
		return res?1:0;
	}
});

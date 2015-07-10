/*
winner: prog1
*/

IsFunction = Test.extend({
	runProgNTimes: 1000000
	,progType: 'array'
	,preTest: function(){
		return [$('div'), void 0, 0, 1, false, true, new Function, '', 'wef', {}, [], void 0, null, function(){}, function(){}, function(){}, function(){}, function(){}, function(){}];
	}
	,prog1: function(v){
		var res = typeof v == 'function';
		return res?1:0;
	}
	,prog2: function(v){
		var res = v instanceof Function;
		return res?1:0;
	}
});

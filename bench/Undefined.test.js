
var undef;
Undefined = Test.extend({
	runProgNTimes: 100000
	,progType: 'array'
	,preTest: function(){
		var undef;
		return [undef, 0, 1, false, true, '', 'wef', {}, [], void 0, null];
	}
	,prog1: function(v){
		var undef;
		return v === undef;
	}
	,prog2: function(v){
		return typeof v == 'undefined';
	}
	,prog3: function(v){
		return v === undef;
	}
});


Numberify = Test.extend({
	runProgNTimes: 300000
	,progType: 'array'
	,preTest: function(){
		var undef;
		return [Math.random(), 'brfoerf', (Math.random()*1000)+'', null, undef, {}, []];
	}
	,prog1: function(v){
		return Number(v);
	}
	,prog2: function(v){
		return v*1;
	}
	,prog3: function(v){
		return +v;
	}
	,prog4: function(v){
		return parseFloat(v);
	}
	,prog5: function(v){
		return parseInt(v);
	}
});

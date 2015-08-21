/*
winner: prog1 > prog3 >  prog2

Note: This is not a fair test for several reasons,
	including the lack of memoization of prog1 (or did i mean prog3?), which
	would exist in RL
*/

var vals = [1,1];
Fib = Test.extend({
	runProgNTimes: 100000
	,progType: 'array'
	,preTest: function(){
		var arr = [];
		for (var i=63;i>=0;--i)
			arr.push(i);
		arr.sort(function(){
			return Math.random()-0.5;
		});
		//vals = [1,1];
		return arr;
	}
	,prog1: function(n){
		if (typeof vals[n] !== 'undefined')
			return vals[n];
		for (var i=vals.length;i<=n;++i)
			vals[i] = vals[i-2] + vals[i-1];
		return vals[n];
	}
	,prog2: function(n){
		var vals = [1,1];
		if (typeof vals[n] !== 'undefined')
			return vals[n];
		for (var i=vals.length;i<=n;++i)
			vals[i] = vals[i-2] + vals[i-1];
		return vals[n];
	}
	,prog3: function(n){
		if (n <= 63) {
			var f = Math.pow(1.61803398875,n);
			return Math.round(f + f*-0.27639320225295);
		} else {
			var vals = [1,1];
			if (typeof vals[n] !== 'undefined')
				return vals[n];
			for (var i=vals.length;i<=n;++i)
				vals[i] = vals[i-2] + vals[i-1];
			return vals[n];
		}
	}
});

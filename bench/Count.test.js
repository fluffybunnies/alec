
var undef;
Count = Test.extend({
	runProgNTimes: 10000
	,preTest: function(){
		return Array(10000);
	}
	,prog1: function(data){
		for (var i=0;i<data.length;++i) data[i];
	}
	,prog2: function(data){
		var i;
		for (i=0;i<data.length;++i) data[i];
	}
	,prog3: function(data){
		for (var i=0,c=data.length;i<c;++i) data[i];
	}
	,prog4: function(data){
		var i,c;
		for (i=0,c=data.length;i<c;++i) data[i];
	}

	,_prog5: function(data){
		var i;
		for (i=0;i<data.length;i++) data[i];
	}
});

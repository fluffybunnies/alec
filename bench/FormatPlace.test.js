
FormatPlace = Test.extend({
	runProgNTimes: 10000
	,progType: 'array'
	,preTest: function(){
		var numsToTest = [];
		for (var i=0;i<30;++i) {
			numsToTest.push(i);
			numsToTest.push(-i);
			numsToTest.push(''+i);
		}
		return numsToTest;
	}
	,prog1: function(v){
		return formatPlace1(v)
	}
	,prog2: function(v){
		return formatPlace2(v)
	}
	,prog3: function(v){
		return formatPlace3(v)
	}
});


function formatPlace1(num){
	var numPos = Math.abs(num)
		,lastChar = (num+'').split('').pop()
		,suffix
	;
	if (num == 0) return '0th';
	if (numPos > 10 && numPos < 20) suffix = 'th';
	else if (lastChar == 1) suffix = 'st';
	else if (lastChar == 2) suffix = 'nd';
	else if (lastChar == 3) suffix = 'rd';
	else suffix = 'th';
	return num+suffix;
}
function formatPlace2(num){
	var numPos = Math.abs(num)
		,lastChar = (num+'').split('').pop()
		,suffix
	;
	switch (true) {
		case num == 0: return '0th';
		case numPos > 10 && numPos < 20: suffix = 'th'; break;
		case lastChar == 1: suffix = 'st'; break;
		case lastChar == 2: suffix = 'nd'; break;
		case lastChar == 3: suffix = 'rd'; break;
		default: suffix = 'th';
	}
	return num+suffix;
}
function formatPlace3(num){
	var numPos = Math.abs(num)
		,lastChar = (num+'').substr(-1)
		,suffix
	;
	if (num == 0) return '0th';
	if (numPos > 10 && numPos < 20) suffix = 'th';
	else if (lastChar == 1) suffix = 'st';
	else if (lastChar == 2) suffix = 'nd';
	else if (lastChar == 3) suffix = 'rd';
	else suffix = 'th';
	return num+suffix;
}

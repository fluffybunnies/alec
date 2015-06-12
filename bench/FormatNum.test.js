/*
winner: prog3-5, prog2 close but doesnt cover all cases
*/

FormatNum = Test.extend({
	runProgNTimes: 20000
	,progType: 'array'
	,preTest: function(){
		var nums = [];
		for (var i=0;i<10;++i) {
			var n = Math.random()*Math.pow(10,i);
			nums.push(n);
			nums.push(''+n);
			nums.push('-'+n);
			//nums.push('$'+n);
			//nums.push('$'+n+'s');
			nums.push('1,000,000.0000'); // already formatted
			nums.push('$'+n+'swefwefwefwef4433434');
			nums.push('wefwefwefwef4433434$'+n+'s');
			nums.push('wefwefwefwefwefwefwefewf$s'); // no numbers
		}
		return nums;
	}
	,prog1: function(num){
		var pieces = (num+'').match(/^([^0-9\-]*)(\-?)([0-9]+)(.*)/)
			,chars,i,c
		;				
		if (!pieces || !pieces[3])
			return num;
		chars = pieces[3].split('');
		for (i=3,c=chars.length;i<c;i=i+3)
			chars[c-i-1] += ',';
		return pieces[1] + pieces[2] + chars.join('') + (pieces[4] || '');
	}
	,prog2: function(num){
		return (num+'').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
	,prog3: function(num){
		var num = num+'', numNums = 0, numStart, i
		for (i=0;i<num.length;++i) {
			if (isNaN(num[i])) {
				if (num[i] == ',') num = num.slice(0,i)+num.slice(i--+1);
				else if (numNums) break;
			} else if (++numNums == 1)
				numStart = i;
		}
		if (numNums > 3) {
			var n;
			for (i=3;i<numNums;i=i+3) {
				n = numStart+numNums-i;
				num = num.slice(0,n)+','+num.slice(n);
			}
		}
		return num;
	}
	,prog4: function(num){
		var num = num+'', numNums = 0, numStart, i
		for (i=0;i<num.length;++i) {
			if (isNaN(num[i])) {
				if (num[i] == ',') num = num.substr(0,i)+num.substr(i--+1);
				else if (numNums) break;
			} else if (++numNums == 1)
				numStart = i;
		}
		if (numNums > 3) {
			var n;
			for (i=3;i<numNums;i=i+3) {
				n = numStart+numNums-i;
				num = num.substr(0,n)+','+num.substr(n);
			}
		}
		return num;
	}
	,prog5: function(num){
		var num = num+'', numNums = 0, numStart, i
		for (i=0;i<num.length;++i) {
			if (isNaN(num[i])) {
				if (num[i] == ',') num = num.substring(0,i)+num.substring(i--+1);
				else if (numNums) break;
			} else if (++numNums == 1)
				numStart = i;
		}
		if (numNums > 3) {
			var n;
			for (i=3;i<numNums;i=i+3) {
				n = numStart+numNums-i;
				num = num.substring(0,n)+','+num.substring(n);
			}
		}
		return num;
	}
});

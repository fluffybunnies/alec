
ByteLength = Test.extend({
	runProgNTimes: 10000
	,progType: 'array'
	,preTest: function(){
		var strings = [];
		for (var i=0;i<10;++i) {
			strings[i] = '';
			for (var n=0;n<Bench.util.rand(10,10000);++n)
				strings[i] += String.fromCharCode(Bench.util.rand(0,10175));
		}
		return strings;
	}
	,prog1: function(normalVal){
		normalVal = String(normalVal);
		var byteLen = 0, i, c;
		for (i=0; i<normalVal.length; ++i) {
			c = normalVal.charCodeAt(i);
			byteLen += c < (1 << 7) ? 1 :
				c < (1 << 11) ? 2 :
				c < (1 << 16) ? 3 :
				c < (1 << 21) ? 4 :
				c < (1 << 26) ? 5 :
				c < (1 << 31) ? 6 :
				Number.NaN;
		}
		//if (normalVal.length != byteLen) console.log('sup',normalVal.length,byteLen);
		return byteLen;
	}
	,prog2: function(normalVal){
		normalVal = String(normalVal);
		var byteLen = 0, i, c;
		for (i=0; i<normalVal.length; ++i) {
			c = normalVal.charCodeAt(i);
			switch (true) {
				case c < (1 << 7): byteLen += 1; break;
				case c < (1 << 11): byteLen += 2; break;
				case c < (1 << 16): byteLen += 3; break;
				case c < (1 << 21): byteLen += 4; break;
				case c < (1 << 26): byteLen += 5; break;
				case c < (1 << 31): byteLen += 6; break;
				default: byteLen = Number.NaN;
			}
		}
		//if (normalVal.length != byteLen) console.log('sup',normalVal.length,byteLen);
		return byteLen;
	}
});


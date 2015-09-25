/*
winner: 
*/

ReplaceAll = Test.extend({
	runProgNTimes: 10000
	,progType: 'array'
	,preTest: function(){
		var lens = [10, 100, 1000]
			,arr = [], i, n
		for (i=0;i<lens.length;++i) {
			arr[i] = ''
			for (n=0;n<lens[i];++n) {
				//arr[i] += String.fromCharCode(Bench.util.rand(32,255))
				arr[i] += String.fromCharCode(Bench.util.rand(97,122))
			}
		}
		return arr
	}
	,prog1: function(v){
		v = v.replace(/a/g, '#')
		v = v.replace(new RegExp(v.charAt(9)+v.charAt(10),'g'), '$')
		v = v.replace(new RegExp(v.charAt(2),'g'), '%%%%')
		return v.length
	}
	,prog2: function(v){
		v = ReplaceAll.replaceAll(v, 'a', '#')
		v = ReplaceAll.replaceAll(v, v.charAt(9)+v.charAt(10), '$')
		v = ReplaceAll.replaceAll(v, v.charAt(2), '%%%%')
		return v.length
	}
	,replaceAll: function(str, search, replace){
		var index = str.indexOf(search)
		while (index != -1) {
			str = str.substr(0, index) + replace + str.substr(index+search.length)
			index = str.indexOf(search, index+search.length)
		}
		return str
	}
});

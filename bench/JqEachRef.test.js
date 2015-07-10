/*
winner: prog1 == prog3
*/

JqEachRef = Test.extend({
	runProgNTimes: 1000
	//,progType: 'array'
	,preTest: function(){
		var elms = ['div','span','ul','h1','h2','a','button']
			,frag = document.createDocumentFragment()
		for (var i=0;i<1000;++i) {
			frag.appendChild(
				document.createElement( elms[Bench.util.rand(0,elms.length-1)] )
			);
		}
		window._frag = frag;
		return frag;
	}
	,prog1: function(dom){
		var n = 0;
		var $list = $(dom).children('div');
		$list.each(function(){
			var $elm = $(this);
			if ($elm.length == 1) ++n;
		});
		return n;
	}
	,prog2: function(dom){
		var n = 0;
		var $list = $(dom).children('div');
		$list.each(function(i){
			var $elm = $list.eq(i);
			if ($elm.length == 1) ++n;
		});
		return n;
	}
	,prog3: function(dom){
		var n = 0;
		var $list = $(dom).children('div');
		$list.each(function(i){
			var $elm = $($list[i]);
			if ($elm.length == 1) ++n;
		});
		return n;
	}
});

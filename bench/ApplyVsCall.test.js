/*
			add = ['border-left-width','padding-left','padding-right','border-right-width'];1
			if (includeMargin)
				add.push.call(add, 'margin-left', 'margin-right');
			for (i=0,c=add.length;i<c;++i)
				d.w += +(jelm.css(add[i])||'0').replace(nre,'');
			add = ['border-top-width','padding-top','padding-bottom','border-bottom-width'];
			if (includeMargin)
				add.push.call(add, 'margin-top', 'margin-bottom');
*/


ApplyVsCall = Test.extend({
	runProgNTimes: 1000000
	//,progType: 'array'
	,preTest: function(){
	}
	,prog1: function(v){
		var add = ['border-left-width','padding-left','padding-right','border-right-width'];
		add.push.call(add, 'margin-left', 'margin-right');
		add.push.call(add, 'margin-top', 'margin-bottom');
		return add.length;
	}
	,prog2: function(v){
		var add = ['border-left-width','padding-left','padding-right','border-right-width'];
		add.push.apply(add, ['margin-left', 'margin-right']);
		add.push.apply(add, ['margin-top', 'margin-bottom']);
		return add.length;
	}
	,prog3: function(v){
		var add = ['border-left-width','padding-left','padding-right','border-right-width'];
		Array.prototype.push.call(add, 'margin-left', 'margin-right');
		Array.prototype.push.call(add, 'margin-top', 'margin-bottom');
		return add.length;
	}
	,prog4: function(v){
		var add = ['border-left-width','padding-left','padding-right','border-right-width'];
		Array.prototype.push.apply(add, ['margin-left', 'margin-right']);
		Array.prototype.push.apply(add, ['margin-top', 'margin-bottom']);
		return add.length;
	}
});

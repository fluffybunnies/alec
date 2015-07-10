/*
	To do
		- handleBreakingError()
*/

Bench = {

	config: {
		key: 'Bench'
	}
	,$: {}

	,init: function(){
		var z = this;
		if (z.inited) return;
		z.inited = true;
		z.$.b = $('body');
	}

	,run: function(test){
		var z = this;
		$(function(){
			z.init();
			z.loadTest(test,function(err,test){
				if (err)
					return z.handleBreakingError(err);
				test.stats = [];
				test.stats.progs = {};
				z.start(test);
			});
		});
	}

	,loadTest: function(test, cb){
		var z = this;
		if (typeof test == 'object')
			return setTimeout(function(){
				cb(false, Test.extend(test));
			},0);
		var s = document.createElement('script');
		s.async = true;
		s.type = 'text/javascript';
		s.onload = function(){
			cb(window[test] ? false : 'test script loaded but unable to find runner', window[test]);
		}
		s.onerror = function(){ cb('error loading test'); }
		s.src = './'+test+'.test.js';
		document.getElementsByTagName('head')[0].appendChild(s);
	}

	,start: function(test){
		var z = this
			,testNum = test.runTestNTimes
			,progs = z.collectProgs(test)
		;
		z.resetDisplay();
		(function gamut(){
			z.randomize(progs);
			console.log('Prog Order',progs);
			z.runSet(test, progs, function(){
				if (--testNum)
					return gamut();
				z.recordFinalResults(test);
			});
		}());
	}

	,runSet: function(test, progs, cb){
		var z = this
			,$set = z.createTestBox()
			,preTestData
		;
		progs = progs.slice(0);
		test.stats.push([]);

		if (test.preTest)
			preTestData = test.preTest();
		console.log('Pre-test Data', preTestData);

		setTimeout(nextProg, test.delay);

		function nextProg(){
			var progKey = progs.shift()
				,prog = test[progKey]
				,t0 = Date.now()
				,vals, i
			;
			for (i=0;i<test.runProgNTimes;++i) {
				if (test.progType == 'array') {
					vals = [];
					preTestData.forEach(function(v){
						vals.push(prog(v));
					});
				} else {
					vals = prog(preTestData);
				}
			}
			z.recordProgStats(test, progKey, t0, Date.now(), $set, vals);
			if (progs[0])
				return setTimeout(nextProg, test.delay);
			z.recordSetStats(test, $set);
			cb();
		}
	}

	,collectProgs: function(test){
		var progs = [];
		Object.keys(test).forEach(function(k){
			if (/^prog([0-9]+)$/.test(k) && test[k] instanceof Function)
				progs.push(k);
		});
		return progs;
	}

	,randomize: function(list){
		return list.sort(function(){return Math.random()-0.5});
	}

	,createTestBox: function(){
		var z = this
			,x = z.config.key
		;
		return $('<div class="test box"></div>').appendTo(z.$.cont)
	}

	,recordProgStats: function(test, progKey, startTime, endTime, $set, log){
		var z = this
			,x = z.config.key
			,runTime = endTime-startTime
			,stats = test.stats[test.stats.length-1]
			,$score
		;
		$score = $('<div><span>'+runTime+'</span><span>('+progKey+')</span><span>'+log+'</span></div>').appendTo($set);
		stats.push({k:progKey, ms:runTime, $score:$score});
		(test.stats.progs[progKey] || (test.stats.progs[progKey] = [])).push(runTime);
	}

	,recordSetStats: function(test, $set){
		var z = this
			,x = z.config.key
			,stats = test.stats[test.stats.length-1]
		;
		stats.sort(function(a,b){
			return a.ms - b.ms;
		});
		if (!test.stats.wins)
			test.stats.wins = {};
		if (!test.stats.wins[stats[0].k])
			test.stats.wins[stats[0].k] = 0;
		++test.stats.wins[stats[0].k];
		stats[0].$score.addClass('victory');
		z.arrangeSet($set);
	}

	,recordFinalResults: function(test){
		var z = this
			,$winnerBox = $('<div class="winner box"></div>')
			,progs = z.collectProgs(test)
		;
		//console.log('RECORD FINAL RESULTS',test.stats);
		progs.sort(function(a,b){
			return (test.stats.wins[b]||0) - (test.stats.wins[a]||0);
		});
		progs.forEach(function(k){
			$winnerBox.append('<div>'
				+ '<span>Winner:</span>'
				+ '<span>'+k+'</span>'
				+ '<span>Wins: '+(test.stats.wins[k]||0)+'/'+test.stats.length+'</span>'
				+ '<span>Avg ms: '+(test.stats.progs[k].reduce(function(a,b){return a+b})/test.stats.progs[k].length).toFixed(2)+'</span>'
			+ '</div>');
		});
		$winnerBox.children().eq(0).addClass('victory');
		z.$.cont.prepend($winnerBox);
	}

	,arrangeSet: function($set){
		$set.children().sort(function(a,b){
			return a.getElementsByTagName('span')[1].innerHTML > b.getElementsByTagName('span')[1].innerHTML ? 1 : -1;
		}).appendTo($set);
	}

	,resetDisplay: function(){
		var z = this
			,x = z.config.key
		;
		z.$.cont = $('<div class="'+x+'"></div>');
		z.$.b.html(z.$.cont);
	}

	,handleBreakingError: function(err){
		var z = this;
		z.$.b.html('Error: '+err);
	}

	,selector: function(opts){
		var z = this
			,$selector = $('<select class="'+z.config.key+'-selector" />')
		;
		$selector.append('<option>Select a test...</option>');
		for (var i=0;i<opts.length;++i)
			$selector.append('<option value="'+opts[i]+'">'+opts[i]+'</option>');
		$selector.bind('change',function(){
			var k = $selector.val();
			if (k) z.run(k);
		});
		return $selector;
	}

	,util: {
		rand: function(min,max){
			return min+Math.round(Math.random()*(max-min));
		}
	}

}

Test = {
	runTestNTimes: 5
	,runProgNTimes: 100000
	,delay: 1000
	,progType: null // array
	,preTest: function(){}
	,prog1: function(){}
	,prog2: function(){}

	,extend: function(t){
		return $.extend({},this,t);
	}
}


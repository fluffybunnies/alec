
jector = {
	config: {
		key: 'jector'
		,appId: 'bajkihjpmbhhgeoklpbipgcpiffnaibi' // todo: make this dynamic
		,checkDelay: 15
		,checkDelayDecayAt: 100
		,checkDelayDecayRate: function(current,orig){return current*1.5;}
	}
	,init: function(){
		var z = this;
		if (z.inited)
			return false;

		if (/wordpress\.luckyshops\.com/.test(window.location.hostname||''))
			return z.handleWordpress();
		if (/watch-tvseries\.net/.test(window.location.hostname||''))
			return z.handleWatchTvSeries();
	}
	,handleWordpress: function(){
		var z = this;
		console.log(z.config.key, 'wordpress.luckyshops.com');
		// this is handled inside styles.css
		/*z.onJquery(function($){
			$('#post-lock-dialog').fadeOut(400);
		});*/
	}
	,handleWatchTvSeries: function(){
		var z = this;
		console.log(z.config.key, 'watch-tvseries.net');

		// disable cookies
		chrome.runtime.sendMessage(z.config.appId,'disableCookies',function(err,res){
			console.log(z.config.key, 'disableCookies res', err, res);
		});

		// prevent some popups
		window.open = function(){};
		window.PopAdsPopped = true;
		//navigator.mimeTypes['application/x-shockwave-flash'] = true;

		// remove stuff
		z.onJquery(function($){
			for (var i=0;i<10;++i)
				setTimeout(removeStuff,i*1000);
			function removeStuff(){
				$('#contpb,#shareicon,#shareico,[id*=MarketGidComposite]').remove();
				//$('object,script').remove();
				$('iframe,.fb_iframe_widget').each(function(){
					var $el = $(this);
					if ($el.parent().attr('id') != 'cont_player')
						$el.remove();
				});
				//$('*').unbind('click');
			}
		});
	}
	,onJquery: function(cb){
		var z = this;
		if (z.onJquery.$ || window.jQuery)
			return cb(z.onJquery.$||window.jQuery);
		(z.onJquery.queue || (z.onJquery.queue = [])).push(cb);
		if (z.onJquery.queue.length != 1)
			return;
		var checkCount = 0, checkDelay = z.config.checkDelay
			//,max = 139586437119
			,max = 2147483647
		;
		var check = function(){
			if (window.jQuery) {
				z.onJquery.$ = window.jQuery;
				z.onJquery.$.each(z.onJquery.queue,function(i,cb){
					cb(z.onJquery.$);
				});
				delete z.onJquery.queue;
			} else {
				if (++checkCount > z.config.checkDelayDecayAt && z.config.checkDelayDecayRate) {
					checkDelay = z.config.checkDelayDecayRate(checkDelay, z.config.checkDelay);
					if (checkDelay > max) checkDelay = max;
				}
				setTimeout(check,checkDelay);
			}
		}
		check();
	}
}
jector.init();

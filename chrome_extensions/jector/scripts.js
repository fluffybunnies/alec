
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
		if (/(\.|^)solarmovie\./.test(window.location.hostname||''))
			return z.handleSolarMovie();
		if (/(\.|^)putlocker\./.test(window.location.hostname||''))
			return z.handlePutLocker();
	}
	,handleWordpress: function(){
		var z = this;
		z.log('wordpress.luckyshops.com');
		// this is handled inside styles.css
		/*z.onJquery(function($){
			$('#post-lock-dialog').fadeOut(400);
		});*/
	}
	,handleSolarMovie: function(){
		var z = this;
		z.log('solarmovie');

		z.disableCookies();
		//window.open = function(){};
		//window.PopAdsPopped = true;
		//window.adk2onClick = function(){}
		//window.adk2PopUpExistOnPage = false;

		z.onJquery(function($){
			var deleteStuff = function(){
				z.removeElements('iframe',function(elm){
					var src = (elm.getAttribute ? elm.getAttribute('src') : elm.src) || '';
					return src.indexOf('embed_player') == -1;
				});
				$('script,.fb_iframe_widget,[class^=st_],a[target="_blank"]').remove();
			};
			deleteStuff();
			setInterval(deleteStuff,1000);
			//$('*').unbind('click').die('click');
		});
	}
	,handlePutLocker: function(){
		var z = this;
		z.log('putlocker');
		

		z.disableCookies();

		var deleteStuff = function(){
			z.removeElements('iframe');
			z.removeElements('script');
			z.removeElements('fb_iframe_widget', 'className');
		};
		deleteStuff();
		setInterval(deleteStuff,1000);

		z.onJquery(function($){
			alert('jquery!');
		});
	}
	,handleWatchTvSeries: function(){
		var z = this;
		z.log('watch-tvseries.net');

		z.disableCookies();

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

	,disableCookies: function(cb){
		var z = this;
		chrome.runtime.sendMessage(z.config.appId,'disableCookies',function(err,res){
			z.log('disableCookies res', err, res);
			if (cb) cb.apply(null,arguments);
		});
	}
	,removeElements: function(search, by, check){
		if (typeof by == 'function') {
			check = by;
			by = null;
		}
		var z = this, elms = document['getElementsBy'+(by?(by[0].toUpperCase()+by.substr(1)):'TagName')](search), i
		for (i=0;i<elms.length;++i) {
			(!check || check(elms[i])) && elms[i].parentNode.removeChild(elms[i]);
		}
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
				var queue = z.onJquery.queue.slice(0);
				delete z.onJquery.queue;
				z.onJquery.$.each(queue,function(i,cb){
					cb(z.onJquery.$);
				});
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
	,log: function(){
		var args = [this.config.key], i;
		for (i=0;i<arguments.length;++i)
			args.push(arguments[i]);
		console.log.apply(console,arguments);
	}
}
jector.init();

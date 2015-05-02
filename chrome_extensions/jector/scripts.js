
jector = {
	config: {
		key: 'jector'
		,checkSpeed: 15
	}
	,init: function(){
		var z = this;
		if (z.inited)
			return false;

		if (/wordpress\.luckyshops\.com/.test(window.location.hostname||'')) {
			console.log('jector', 'wordpress.luckyshops.com');
			/*z.onJquery(function($){
				$('#post-lock-dialog').fadeOut(400);
			});*/
		} else if (/watch-tvseries\.net/.test(window.location.hostname||'')) {
			console.log('jector', 'watch-tvseries.net');
			z.onJquery(function($){
				removeStuff();
				setTimeout(removeStuff,2000);
				function removeStuff(){
					// remove right ad
					$('#contpb').remove();
					$('[id]').each(function(){
						var $el = $(this);
						if ($el.attr('id').indexOf('MarketGidComposite') == 0)
							$el.remove();
					});
					$('iframe,.fb_iframe_widget').each(function(){
						var $el = $(this);
						if ($el.parent().attr('id') != 'cont_player')
							$el.remove();
					});
					$('#shareico').remove();
				}
			});
		} else if (/rewards\.verizonwireless\.com/.test(window.location.hostname||'')) {
			console.log('jector', 'rewards.verizonwireless.com');
		}
	}
	,onJquery: function(cb){
		var z = this;
		if (z.onJquery.$ || window.jQuery)
			return cb(z.onJquery.$||window.jQuery);
		(z.onJquery.queue || (z.onJquery.queue = [])).push(cb);
		if (z.onJquery.queue.length == 1) {
			var interval = setInterval(function(){
				if (window.jQuery) {
					clearInterval(interval);
					z.onJquery.$ = window.jQuery;
					z.onJquery.$.each(z.onJquery.queue,function(i,cb){
						cb(z.onJquery.$);
					});
					delete z.onJquery.queue;
				}
			},z.config.checkSpeed);
		}
	}
	,loadScript: function(url){
		var s = document.createElement('script');
		s.async = true;
		s.onload = function(){
			this.parentNode.removeChild(this);
		}
		s.src = url;
		(document.head||document.documentElement).appendChild(s);
	}
}
jector.init();


jector = {
	config: {
		key: 'jector'
		,appId: 'bajkihjpmbhhgeoklpbipgcpiffnaibi' // todo: make this dynamic
		,checkDelay: 15
		,checkDelayDecayAt: 100
		,checkDelayDecayRate: function(current,orig){return current*1.5;}
		,requireJqueryVersion: '1.8'
	}
	,init: function(){
		var z = this;
		if (z.inited)
			return false;

		if (/wordpress\.luckyshops\.com/.test(window.location.hostname||''))
			return z.handleWordpress();
		if (/api.wagwalking\.com/.test(window.location.hostname||''))
			return z.handleWagApi();
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
		var z = this
			,nullA = function(){console.log('jector hijacked')}
		z.log('putlocker');

		// replace entire DOM with copy of itself to wipe event listeners
		//document.replaceChild(document.documentElement.cloneNode(true), document.documentElement)
		z.disableCookies();
		window.open = nullA

		var deleteStuff = function(){
			z.log('deleteStuff()')
			//z.removeElements('iframe');
			z.removeElements('script');
			z.removeElements('menu-box', 'className');
			z.removeElements('fb_iframe_widget', 'className');
			z.removeElements('addthis_toolbox', 'className');
			z.removeElementById('MarketGidScriptRootC9737');
			z.removeElementById('_atssh');
			z.removeElementById('twttrHubFrameSecure');
			z.removeElementById('twttrHubFrame');

			//window.onClickTrigger = nullA
		};
		deleteStuff();
		setInterval(deleteStuff,1000);

		/*
	    function k() {
  	      return +new Date();
    	}
			// ...
      if (o9 + 250 > k()) {
          return;
      }
		*/
		/* prevents popup, but breaks play btn
		Date.prototype.valueOf = function(){
			z.log('callee', arguments.callee.caller, arguments.callee.caller.toString().indexOf('function k()'));
			if (arguments.callee.caller.toString().indexOf('function k()') != -1) return 1;
			return this.getTime();
		}*/

		var madeNextBtn = false
		makeNextBtn()
		function makeNextBtn(){
			if (madeNextBtn) return;
			madeNextBtn = true
			z.requireJquery(function($){
				var btnToReplace = $('a.movgr:first')
					,currentPath = window.location.pathname
					,currentEpisode = currentPath.match(/season-([0-9]+)-episode-([0-9]+)/)
					,prevUrl = currentPath.replace(currentEpisode[0], 'season-'+currentEpisode[1]+'-episode-'+(+currentEpisode[2]-1))
					,nextUrl = currentPath.replace(currentEpisode[0], 'season-'+currentEpisode[1]+'-episode-'+(+currentEpisode[2]+1))
					,$newBtns
				btnToReplace.replaceWith($newBtns=$('<a class="movgr jector-prev" href="'+prevUrl+'" title="Prev">Prev</a><a class="movgr jector-next" href="'+nextUrl+'" title="Next">Next</a>'))
				$('head').append('<style type="text/css">.movgr{color:#fff !important; margin:0 0.2em;}</style>')

				$.ajax({
					method: 'HEAD'
					,url: nextUrl
					,cache: true
					,complete: function(res){
						if (res.status == 404)
							$newBtns.eq(1).attr('href',currentPath.replace(currentEpisode[0], 'season-'+(+currentEpisode[1]+1)+'-episode-1'))
					}
				})
			})
		}

		var addedOtherLink = false
		addOtherLink()
		function addOtherLink(){
			if (addedOtherLink) return;
			addedOtherLink = true
			z.requireJquery(function($){
				$('.mainlogo').append('<div style="position:relative;left:188px;top:-34px;">Can\'t find what you\'re looking for? Try <a href="http://watch-tvseries.net">watch-tvseries.net</a></div>')
			})
		}
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

			var addedOtherLink = false
			addOtherLink()
			function addOtherLink(){
				if (addedOtherLink) return;
				addedOtherLink = true
				$('.spbackgrd').append('<div style="text-align:right;font-size:12px;line-height:1.4;padding:0.45em 0.7em 0 0;">Can\'t find what you\'re looking for?<br />Try <a href="http://putlocker.is">putlocker.is</a></div>')
			}

		});
	}
	,handleWagApi: function(){
		var z = this;
		z.onJquery(function($){
			//var al = new AutoLogin('admin-login', $('form[action*=/admin/verify]'), ['username','password']);
			console.log('SSSUUUPPPP',al); window._al=al;
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
	,removeElementById: function(search){
		var el = document.getElementById(search)
		if (el) el.parentNode.removeChild(el)
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


	,requireJquery: function(cb){
		var z = this;
		function gotIt(o){
			setTimeout(function(){
				z.$ = o;
				cb(o);
			},0);
		}
		if (z.isJquery(window.jQuery))
			return gotIt(jQuery);
		if (z.isJquery(window.$))
			return gotIt($);
		z.log('cant find jQuery, loading v'+z.config.requireJqueryVersion+' from google');
		var s = document.createElement('script');
		s.async = true;
		s.onload = function(){
			this.parentNode.removeChild(this);
			gotIt(window.jQuery);
		}
		s.src = '//ajax.googleapis.com/ajax/libs/jquery/'+z.config.requireJqueryVersion+'/jquery.min.js';
		(document.head||document.documentElement).appendChild(s);
	}
	,isJquery: function(o){
		return !!(o && o.ajax instanceof Function);
	}
}
jector.init();


/*
Util = {
	parseCookies: function(cookie){
		cookie = cookie || document.cookie;
		var cookies = cookie.split(';')
			,res = {}
		;
		$.each(cookies,function(i,v){
			var split = v.split('=')
				,key = unescape(split[0][0] == ' ' ? split[0].substr(1) : split[0])
				,val = unescape(split[1]||'')
			;
			if (key != '')
				res[key] = val;
		});
		return res;
	}
	,setCookie: function(key,val,opts){
		var undef,expires,set;
		if (typeof opts == 'number' || typeof opts == 'string') // allow 3rd argument to == expires
			opts = {expires:opts};
		opts = (opts && typeof opts == 'object') ? opts : {};
		if (val == undef)
			opts.expires = -1;
		if (typeof opts.expires == 'number') {
			expires = new Date;
			expires.setMilliseconds(expires.getMilliseconds()+opts.expires);
			expires = expires.toUTCString();
		} else if (typeof opts.expires == 'string') {
			expires = opts.expires;
		}
		set = (document.cookie = [
			escape(key),'=',escape(val)
			,expires == undef ? '' : '; expires='+expires
			,opts.path == undef ? '; path=/' : '; path='+opts.path
			,opts.domain == undef ? '' : '; domain='+opts.domain
			,opts.secure ? ';secure' : ''
		].join(''));
		return document.cookie = set;
	}
	,getCookie: function(key){
		return this.parseCookies()[key];
	}
	,deleteCookie: function(key){
		return this.setCookie(key, null);
	}
	,obfu: function (str, salt){
		var bound = 5, boundLimit = Math.pow(10,bound), hash = '', i, l, charCode;
		str += '';
		for (i=0,l=str.length;i<l;++i) {
			charCode = str.charCodeAt(i);
			if (salt)
				charCode = (charCode + (salt+'').charCodeAt(i%salt.length))%boundLimit;
			charCode = padZ(charCode,bound);
			hash += charCode;
		}
		return hash;
	}
	,deobfu: function(hash, salt){
		var bound = 5, boundLimit = Math.pow(10,bound), str = '', chunk = '', n = 0, i, l;
		hash += '';
		for (i=0,l=hash.length;i<l;++i) {
			chunk += hash[i];
			if (chunk.length == bound) {
				if (salt)
					chunk = Math.abs( (chunk - (salt+'').charCodeAt(n%salt.length))%boundLimit );
				str += String.fromCharCode(chunk);
				chunk = '';
				++n;
			}
		}
		return str;
	}
}


AutoLogin = function(key, $form, fields){
	this.key = key;
	this.fields = $.extend({},fields);
	this.watchForm($form);
};
AutoLogin.prototype.config = {
	cookieName: 'gtm_trck12'
	,cookieLifetime: 60*60*1000
}
AutoLogin.prototype.log = jector.log;
AutoLogin.prototype.watchForm = function($form){
	var z = this;
	$form.bind('submit',function(){
		var vals = {}, key, val, i;
		for (i=0;i<z.fields.length;++i) {
			key = z.fields[i];
			val = $form.find('[name="'+key+'"]').val();
			if (!val)
				return z.log(key+' is empty', 'not saving');
			vals[key] = val;
		}
		z.setCreds(vals);
	});
}
AutoLogin.prototype.setCreds = function(creds){
	var z = this,
		,exp = z.config.cookieLifetime
		,currentCreds = z.getCreds()
		,k
	;
	for (k in creds) {
		if (creds.hasOwnProperty(k))
			currentCreds[
	}
	z._creds.e = +(new Date) + exp;
	Util.setCookie(z.config.credsCookieName, Util.obfu(JSON.stringify(z._creds),z.credsSalt()), exp);
}
AutoLogin.prototype.getCreds = function(){
	var z = this, creds;
	if (z._creds)
		return z._creds;
	try {
		creds = JSON.parse(Util.deobfu(Util.getCookie(z.config.cookieName),z.credsSalt()));
	} catch (e) {}
	return creds && typeof creds == 'object' ? creds : {};
}
AutoLogin.prototype.clearCreds = function(){
	var z = this;
	Util.setCookie(z.config.cookieName,null);
	delete z._creds;
}
AutoLogin.prototype.credsSalt = function(){
	var d = new Date;
	return (d.getFullYear()+d.getMonth()+d.getDate()+d.getHours())*d.getTimezoneOffset() + (''+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours()+d.getTimezoneOffset());
}
AutoLogin.prototype.haveSavedCreds = function(){
	var creds = this.getCreds();
	for (var i=0;i<this.fields.length;++i) {
		if (typeof creds[this.fields] != 'string')
			return false;
	}
	return typeof(creds.e) == 'number';
}
*/



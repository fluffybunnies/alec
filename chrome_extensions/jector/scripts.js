
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



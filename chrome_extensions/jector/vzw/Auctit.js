/*
	To Do
		- Query directly instead of using sendRequest() so we can kill slow processes when lapped
			- The browser will queue up http requests, which we can't have
			- We should actually be able to simply hit the server only
*/


Auctit = {
	config: {
		key: 'Auctit'
		,defaults: {
			auctionHome: 'https://rewards.verizonwireless.com/gateway?t=auctions&auctiontype=rco'
			,monitorInterval: 1000
			,monitorAlertDistance: 60*1000
			,flashTitleSpeed: 1000
			,waitForBidDistance: 2*60*1000
			,waitForBidCheckInterval: 5000
			,savedWaitsCookieName: 'auctit_saved_waits'
			,autoBidCheckInterval: 500
			,autoBidDistance: 5000 //(3*60*60 + 5*60 + 02) * 1000
			,runawayDelay: 15*1000
			,refreshEvery: 5*60*1000
		}
	}
	,flashTitle_interval: null
	,init: function(opts){
		var z = this;
		if (z.inited)
			return;
		z.inited = true;

		z.opts = $.extend({},z.config.defaults,opts);

		z.checkFromRefresh();
		z.loadStyles();

		$(function(){
			z.alib = window.auctionsSync;
			if (!z.alib)
				return console.log(z.config.key, 'missing auctions lib', 'quitting');
			z.$listingCont = $('#auctions-listing:first');
			z.$singleAuctionCont = $('#auctionContent:first');//$('#auctionData:first');

			z.getCustomerBalance();
			//z.monitor();
			z.stayLoggedIn();
			z.setUpWaitForBid();
			z.setUpAutoBidding();

			console.log(z.config.key, 'customerBalance', z.getCustomerBalance());
		});
	}
	,loadStyles: function(){
		var z = this
			,x = z.config.key
		;
		$('body').append('<style type="text/css" x-ref="'+x+'">.auctionItem.'+x+'-highlight{background:rgba(255,255,0,0.4)!important;}</style>');
		$('#globalNavId a.o-logo').unbind('click').attr('onclick','').attr('href',z.opts.auctionHome);
	}
	,onAuctionHome: function(){
		return window.location.href.indexOf(this.opts.auctionHome) == 0;
	}
	,onAuctionPage: function(){
		return window.location.hostname+window.location.pathname == 'rewards.verizonwireless.com/gateway'
			&& /(\?|&)t=auctions(&|$)/.test(window.location.search||'')
	}
	,getCustomerBalance: function(){
		return this.alib.getUserCash ? this.alib.getUserCash() : +$('#rewardsbalancevalue').text().replace(/[^0-9.\-]/g,'');
	}
	,monitor: function(){
		var z = this
			,teasers = []
		;
		if (!z.$listingCont.length)
			return;
		z.$listingCont.find('.auctions .auctionItem').each(function(){
			teasers.push({
				$cont: $(this)
			});
		});
		if (z.opts.monitorInterval) {
			(function check(){
				z.checkTeaserStatus(teasers, z.opts.monitorAlertDistance, function(){
					setTimeout(check,z.opts.monitorInterval);
				});
			})();
		}
	}
	,stayLoggedIn: function(){
		var z = this
			,warning = 5000
			,wait = z.opts.refreshEvery-warning
		;
		if (wait < 0) {
			wait = 0;
			warning = z.opts.refreshEvery;
		}
		setTimeout(function(){
			console.log(z.config.key, 'refreshing to stay logged in...', warning);
			setTimeout(function(){
				var time = z.$singleAuctionCont.length ? z.getAuctionItemTime(z.$singleAuctionCont) : null;
				if (time && time.left && time.left < 6)
					return z.stayLoggedIn();
				z.refreshPage();
			},warning);
		},wait);
		// this stops the redirect, but you still get logged out...
		if (typeof pageTimeout == 'number')
			clearTimeout(pageTimeout);
	}
	,refreshPage: function(){
		var z = this
			,scrollY = z.getViewportScrollY()
		;
		z.setCookie('auctit_scrolly',scrollY,{expires:2500});
		//window.location.reload(true);
		window.location = window.location.href;
	}
	,checkFromRefresh: function(){
		var z = this
			,cookieName = 'auctit_scrolly'
			,scrollY = z.readCookie(cookieName)
		;
		if (!isNaN(scrollY))
			$('html,body').scrollTop(scrollY);
		z.setCookie(cookieName,null);
	}
	,checkTeaserStatus: function(teasers, alertDistance, cb){
		var z = this
			,x = z.config.key
			,oneIsReady = false
			,popAlert = false
		;
		$.each(teasers,function(i,teaser){
			var time = z.getAuctionItemTime(teaser.$cont);
			if (isNaN(time.left))
				return;
			if (time.left < alertDistance) {
				if (!teaser.notify)
					popAlert = true;
				teaser.notify = true;
				teaser.$cont.addClass(x+'-highlight');
				oneIsReady = true;
			} else {
				teaser.notify = false;
				teaser.$cont.removeClass(x+'-highlight');
			}
		});
		if (oneIsReady) {
			z.flashTitle();
			if (popAlert)
				alert('!!!!!!!!!!');
		} else {
			z.killFlashTitle();
		}
		cb();
	}
	,flashTitle: function(){
		var z = this
			,msg = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
			,flag
		;
		if (z.flashTitle_interval !== null)
			return;
		z.flashTitle_origVal = document.title;
		z.flashTitle_interval = setInterval(function(){
			if (flag = !flag)
				document.title = flag ? msg : z.flashTitle_origVal;
		},z.opts.flashTitleSpeed);
	}
	,killFlashTitle: function(){
		var z = this;
		if (z.flashTitle_interval === null)
			return;
		clearInterval(z.flashTitle_interval);
		document.title = z.flashTitle_origVal;
	}
	,getAuctionItemTime: function($item){
		var z = this
			,$time = $item.find('.timeLeft .time')
			,timeLeft = +$time.attr('timeleft')
			,endTime = +$time.attr('endtime')
		;
		return {left:timeLeft, end:endTime};
	}
	,getAuctionItemUrl: function($item){
		var z = this
			,urls = {}
			,url = $item.attr('x-url')
		;
		if (url)
			return url;
		$item.find('a').each(function(){
			var href = $(this).attr('href');
			if (href)
				urls[href] = urls[href] ? urls[href]+1 : 1;
		});
		if (url = z.getMaxKey(urls))
			$item.attr('x-url',url);
		return url;
	}
	,getAuctionItemCurrentBid: function($item){
		return +($item.find('.currBid .bidAmt').text()||'').replace(/,/g,'');
	}
	,getAuctionItemId: function($item){
		var z = this
			,re = /^[0-9]+$/
			,id = $item.attr('x-id')
		;
		if (id)
			return id;
		$.each(($item.attr('class')||'').split(' '), function(i,v){
			if (re.test(v)) {
				id = +v;
				return false;
			}
		});
		if (!id)
			id = ($item.find('a.bidHistory').attr('href')||'').split('auctionId=').pop();
		if (!id)
			id = $item.closest('.panel').siblings('form[name="auctiondetailsform"]').find('[name="auctionid"]').val();
		if (id)
			$item.attr('x-id',id);
		return id;
	}
	,getMaxKey: function(o){
		var z = this, max;
		$.each(o,function(k,v){
			if (!max || v < max[1])
				max = [k,v];
		});
		return max ? max[0] : null;
	}
	,setUpWaitForBid: function(){
		var z = this
			,x = z.config.key
			,markedClass = x+'-waiting'
			,checkInterval
		;
		if (!z.$listingCont)
			return;
		$('body').append('<style type="text/css">\
			.auctions .auctionItem .btn.details {\
				text-indent: 100%;\
			}\
			.auctions .auctionItem .btn.details:before {\
				content: "AutoBid";\
				width: 100%;\
				text-align: center;\
				display: block;\
				position: absolute;\
				left: 0;\
				text-indent: 0;\
			}\
			.auctions .auctionItem.'+markedClass+' {\
				background: rgba(0,20,150,0.2) !important;\
			}\
		</style>');
		z.$listingCont.find('.auctionItem .btn.details').live('click',function(e){
			e.preventDefault();
			var $el = $(this).blur()
				,$item = $el.parents('.auctionItem:first')
			;
			if ($item.hasClass(markedClass))
				$item.removeClass(markedClass);
			else
				$item.addClass(markedClass);
			z.saveWaits();
		});
		if (z.onAuctionPage())
			z.loadSavedWaits();
		checkInterval = setInterval(function(){
			var customerBalance = z.getCustomerBalance();
			z.$listingCont.find('.auctionItem').each(function(){
				var $el = $(this), time, itemCurrentBid, itemUrl;
				if (!$el.hasClass(markedClass))
					return;
				time = z.getAuctionItemTime($el);
				if (time.left > z.opts.waitForBidDistance)
					return;
				if (isNaN(itemCurrentBid = z.getAuctionItemCurrentBid($el)))
					return console.log(z.config.key, 'waitForBidDistance', 'failed to getAuctionItemCurrentBid()', z.getAuctionItemId($el));
				if (customerBalance < itemCurrentBid)
					return console.log(z.config.key, 'waitForBidDistance', 'insufficient funds', z.getAuctionItemId($el));
				if (!(itemUrl = z.getAuctionItemUrl($el)))
					return console.log(z.config.key, 'waitForBidDistance', 'failed to getAuctionItemUrl()', z.getAuctionItemId($el));
				clearInterval(checkInterval);
				console.log(z.config.key, 'waitForBidDistance', 'lets go!', itemUrl);
				window.location = itemUrl;
				return false;
			});
		},z.opts.waitForBidCheckInterval);
	}
	,loadSavedWaits: function(){
		var z = this
			,savedWaits = z.parseCookies()[z.opts.savedWaitsCookieName]
			,$items
		;
		try {
			savedWaits = JSON.parse(savedWaits);
		} catch (e) {}
		if (!(savedWaits && typeof savedWaits == 'object'))
			return;
		$items = z.$listingCont.find('.auctionItem');
		$.each(savedWaits,function(id){
			$items.filter('.'+id).find('.btn.details').trigger('click');
		});
	}
	,saveWaits: function(){
		var z = this
			,x = z.config.key
			,markedClass = x+'-waiting'
			,waits = {}
		;
		z.$listingCont.find('.auctionItem.'+markedClass).each(function(){
			var id = z.getAuctionItemId($(this));
			if (id)
				waits[id] = 1;
		});
		z.setCookie(z.opts.savedWaitsCookieName, JSON.stringify(waits), {expires:30*24*60*60*1000});
	}
	,setWait: function(id,v){
		var z = this, waits;
		try {
			waits = JSON.parse(z.parseCookies()[z.opts.savedWaitsCookieName]);
		} catch (e) {}
		if (!(waits && typeof waits == 'object'))
			waits = {};
		waits[id] = v;
		z.setCookie(z.opts.savedWaitsCookieName, JSON.stringify(waits), {expires:30*24*60*60*1000});
	}
	,setUpAutoBidding: function(){
		var z = this
			,autoBiddingEnabled = false
			,auctionId,savedWaits,checkInterval
			,delayTimeout,undef
		;
		if (!z.$singleAuctionCont.length)
			return;

		z.$singleAuctionCont.$placeBigBtn = z.$singleAuctionCont.find('a.place-bid').html('Autobidding Disabled').unbind('click').attr('onclick','').bind('click',function(e){
			e.preventDefault();
			switchStatus();
		});

		auctionId = z.getAuctionItemId(z.$singleAuctionCont);
		try {
			savedWaits = JSON.parse(z.parseCookies()[z.opts.savedWaitsCookieName]);
		} catch (e) {}
		if (savedWaits && savedWaits[auctionId])
			switchStatus();

		function switchStatus() {
			if (autoBiddingEnabled) {
				z.$singleAuctionCont.$placeBigBtn.html('Autobidding Disabled');
				z.setWait(auctionId);
			} else {
				z.$singleAuctionCont.$placeBigBtn.html('Autobidding in...');
				z.setWait(auctionId,1);
			}
			autoBiddingEnabled = !autoBiddingEnabled;
		}

		checkInterval = setInterval(function(){
			var time = z.getAuctionItemTime(z.$singleAuctionCont);
			if (!autoBiddingEnabled)
				return;
			if (isNaN(time.left)) {
				console.log(z.config.key, 'setUpAutoBidding', 'failed to getAuctionItemTime()', 'going back to auctionHome shortly...');
				if (delayTimeout === undef)
					delayTimeout = setTimeout(function(){
						window.location = z.opts.auctionHome;
					},z.opts.runawayDelay);
				return;
			}
			clearTimeout(delayTimeout);
			delayTimeout = undef;
			if (time.left <= z.opts.autoBidDistance*10 || time.left < 100000) {
				z.$singleAuctionCont.$placeBigBtn.html('Autobidding in '+(time.left/1000).toFixed(2));
			}
			if (time.left <= z.opts.autoBidDistance) {
				console.log(z.config.key, 'setUpAutoBidding', 'lets go!');
				z.bid(true);
				clearInterval(checkInterval);
				checkInterval = setInterval(checkForFinish,5000);
			}
		},z.opts.autoBidCheckInterval);
		function checkForFinish(){
			var time = z.getAuctionItemTime(z.$singleAuctionCont)
				,customerBalance = z.getCustomerBalance()
				,currentBid = z.getAuctionItemCurrentBid(z.$singleAuctionCont)
			;
			if (isNaN(time.left) || time.left < -1000 || customerBalance < currentBid) {
				console.log(z.config.key, 'bid over', 'redirecting back to auctionHome...');
				clearInterval(checkInterval);
				setTimeout(function(){
					window.location = z.opts.auctionHome;
				},5000);
			}
		}
	}
	,bid: function(skeet){
		var z = this
			,orig = z.alib.refreshBid
			,lastBid,nextBid
		;
		if (z.alreadyStartedBidding)
			return console.log(z.config.key, 'already started bidding', 'start a new instance');
		z.alreadyStartedBidding = true;
		z.logCurrentBid();
		z.alib.refreshBid = function(bidDetails, context){
			if (lastBid != bidDetails.nextBid) {
				lastBid = bidDetails.nextBid;
				z.batchBidRequest(bidDetails.auctionId, bidDetails.nextBid);
			}
			return orig.apply(z.alib, arguments);
		}
		if (skeet) {
			nextBid = z.$singleAuctionCont.find('.nextBid .bidAmt').text().replace(/[^0-9.]/g,'');
			if (nextBid)
				z.batchBidRequest(z.alib.settings.pageAuctions[0], nextBid);
		}
	}
	,batchBidRequest: function(auctionId, baseBidAmount){
		var z = this, i;
		// @todo: kill prev batchBidRequest if active. we can fall behind due to own lag
		for (i=0;i<10;++i) {
			z.alib.sendRequest(z.alib.settings.bidRequestUrl, {auctionid:auctionId, bidAmount:+baseBidAmount+i*10}, true);
		}
	}
	,logCurrentBid: function(){
		console.log(this.config.key, 'current bid', this.getAuctionItemCurrentBid(this.$singleAuctionCont));
	}
	,readCookie: function(name){
		return this.parseCookies()[name];
	}
	,parseCookies: function(cookie){
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
		opts = (opts && typeof opts == 'object') ? opts : {};
		if (val === null)
			opts.expires = -1;
		if (typeof opts.expires == 'number') {
			expires = new Date;
			expires.setMilliseconds(expires.getMilliseconds()+opts.expires);
			expires = expires.toUTCString();
		} else if (typeof opts.expires == 'string') {
			expires = opts.expires;
		}
		set = (document.cookie = [
			escape(key),'=',val
			,expires == undef ? '' : '; expires='+expires
			,opts.path == undef ? '; path=/' : '; path='+opts.path
			,opts.domain == undef ? '' : '; domain='+opts.domain
			,opts.secure ? ';secure' : ''
		].join(''));
		return document.cookie = set;
	}
	,getViewportScrollY: function(){
		return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	}
}
Auctit.init();


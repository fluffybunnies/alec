/*
	To Do
		- Query directly instead of using sendRequest() so we can kill slow processes when lapped
			- The browser will queue up http requests, which we can't have
			- We should actually be able to simply hit the server only
		- Increase carousel slide duration, or stop on click/hover
			$('#featuredAuctions .drCarousel').drCarousel({scrollType:'horizontal',autoScroll:true,singleScroll:true,infinite:true,autoScrollDuration:3e3});
			$('#featuredAuctions .drCarousel').drCarousel({scrollType:'horizontal',autoScroll:true,singleScroll:true,infinite:true,autoScrollDuration:10e3});
*/

(function(){
var $ = window.jQuery || window.$;

window.Auctit = {
	config: {
		key: 'Auctit'
		,requireJqueryVersion: '1.8'
		,defaults: {
			auctionHome: 'https://rewards.verizonwireless.com/gateway?t=auctions&auctiontype=rco'

			,bidIncrement: 50

			,monitorInterval: 1000
			,monitorAlertDistance: 60*1000
			,flashTitleSpeed: 1000

			,waitForBidDistance: 2*60*1000
			,waitForBidCheckInterval: 5000
			,savedWaitsCookieName: 'auctit_saved_waits'

			,autoBidCheckInterval: 200
			,autoBidDistance: 4000 //(3*60*60 + 5*60 + 02) * 1000
			,runawayDelay: 15*1000

			//#deprecated01
			//,stayLoggedInRefreshEvery: 5*60*1000
			//,stayLoggedInDeference: 20*1000
			,ordersCookieName: 'auctit_orders'
			,credsCookieName: 'gtm_trck12'
			,credsLifetime: 60*60*1000
		}
	}
	,flashTitle_interval: null
	,init: function(opts){
		var z = this;
		if (z.inited)
			return;
		z.inited = true;

		z.requireJquery(function($){
			z.opts = $.extend({},z.config.defaults,opts);

			z.loadStyles();

			if (z.carryOutOrders())
				return z.log('carrying out orders', 'quitting main thread');
			z.stayLoggedInUniversal();
			if (window.location.hostname != 'rewards.verizonwireless.com')
				return z.log('not on rewards.verizonwireless.com', 'quitting main thread');

			z.checkFromRefresh();

			$(function(){
				z.alib = window.auctionsSync;
				if (!z.alib)
					return z.log('missing auctions lib', 'quitting main thread');
				z.$listingCont = $('#auctions-listing:first');
				z.$singleAuctionCont = $('#auctionContent:first');//$('#auctionData:first');

				z.getCustomerBalance();
				//z.monitor();
				//z.stayLoggedIn(); //#deprecated01
				z.askForCreds();
				z.setUpWaitForBid();
				z.setUpAutoBidding();
			});
		});
	}
	,log: function(){
		var args = [this.config.key], i = 0;
		for (;i<arguments.length;++i)
			args.push(arguments[i]);
		console.log.apply(console,args);
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
	,amLoggedIn: function(){
		return !!this.readCookie('loggedIn');
	}
	,loadStyles: function(){
		var z = this, $ = z.$
			,x = z.config.key
		;
		$('body').append('<style type="text/css" x-ref="'+x+'">\
			.auctionItem.'+x+'-highlight{background:rgba(255,255,0,0.4)!important;}\
			/* ace copy and paste stuff - if single quotes need escaping, update in ace instead of here */\
			.ace-pop-bg {/* #hack */ z-index: 11; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: #000; -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=30)"; filter: alpha(opacity=30); -moz-opacity: 0.3; -khtml-opacity: 0.3; opacity: 0.3; } .ace-pop {/* #hack */ z-index: 12; background: #fff; -moz-box-shadow: 0px 1px 5px rgba(0,0,0,0.3); -webkit-box-shadow: 0px 1px 5px rgba(0,0,0,0.3); box-shadow: 0px 1px 5px rgba(0,0,0,0.3); font-family: arial,sans-serif; font-size: 13px; color: #7f7f7f; max-width: 600px; text-align: left; } .ace-pop-head {position: relative; height: 23px; padding: 10px 15px 0 15px; background: #c97766; color: #fff; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; font-weight: bold; } .ace-pop-head-content {} .ace-pop-btn-exit ,.ace-pop-btn-exit:active {position: absolute; right: 8px; top: 7px; display: block; width: 13px; height: 13px; text-align: center; padding: 2px 1px 0px 1px; font-size: 10px; -moz-border-radius: 2px; -webkit-border-radius: 2px; border-radius: 2px; color: #fff; } .ace-pop-body {min-width: 300px; padding: 20px 20px 18px 20px; } .ace-pop-body-content {padding: 0 0 20px 0; font-size: 12px; } .ace-pop-btns {padding: 10px 0 0 0; text-align: center; } .ace-pop-btns .ace-pop-btn ,.ace-pop-btns .ace-pop-btn:visited {-moz-box-shadow: inset 0px 1px 0px 0px #fff; -webkit-box-shadow: inset 0px 1px 0px 0px #fff; box-shadow: inset 0px 1px 0px 0px #fff; background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) ); background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% ); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ededed", endColorstr="#dfdfdf"); background-color: #ededed; -moz-border-radius: 4px; -webkit-border-radius: 4px; border-radius: 4px; border: 1px solid #dcdcdc; display: inline-block; color: #777777; font-size: 12px; font-weight: bold; padding: 4px 8px; text-decoration: none; text-shadow: 1px 1px 0px #fff; margin:  0 8px; } .ace-pop-btns .ace-pop-btn:hover {background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) ); background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% ); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#dfdfdf", endColorstr="#ededed"); background-color: #dfdfdf; } .ace-pop-btns .ace-pop-btn:active {position: relative; top: 1px; left: auto; right: auto; bottom: auto; }\
			/* ace additions */\
			.ace-pop-bg { z-index:600; } .ace-pop { z-index:601; }\
		</style>');
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
		var z = this, $ = z.$
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
	/* #deprecated01
	,stayLoggedIn: function(){
		var z = this, $ = z.$
			,warning = 5000
			,wait = z.opts.stayLoggedInRefreshEvery-warning
			,creds = z.getCreds()
		;
		if (wait < 0) {
			wait = 0;
			warning = z.opts.stayLoggedInRefreshEvery;
		}
		setTimeout(function(){
			z.log('refreshing to stay logged in...', warning);
			setTimeout(function(){
				var time = z.$singleAuctionCont.length ? z.getAuctionItemTime(z.$singleAuctionCont) : null;
				if (time && time.left && time.left < z.opts.stayLoggedInDeference) {
					z.log('was going to redirect away to refresh login state, but looks like youre close to bidding!');
					return z.stayLoggedIn();
				}
				//z.refreshPage();
				z.setOrders('refreshAuth',[
					//'logout'
					//,'goto: https://login.vzw.com/cdsso/public/c/logout'
					'goto: https://login.verizonwireless.com/amserver/UI/Logout'
					,'submitLogin-userId'
					,'submitLogin-full'
					,'goto: '+window.location.href
				]);
				z.carryOutOrders();
			},warning);
		},wait);
		// this stops the redirect, but you still get logged out...
		if (typeof pageTimeout == 'number')
			clearTimeout(pageTimeout);
	}
	*/
	,stayLoggedInUniversal: function(){
		var z = this, $ = z.$;
		// auto creds...
		$('#loginForm #signIn').bind('click',function(){
			var $form = $(this).parents('#loginForm:first')
				,id1 = $form.find('#IDToken1').val()
				,id2 = $form.find('#IDToken2').val()
				,temp
			;
			//console.log('stayLoggedInUniversal','setting creds',id1,id2);
			if (id1 || id2)
				z.setCreds(id1,id2);
		});
		// save creds in case we passed the hour mark...
		if (!z._creds)
			z._creds = z.getCreds();
		$(window).bind('beforeunload unload',function(){
			z.setCreds(z.getCreds()['1'],z.getCreds()['2']);
		});

		//#deprecated01 - inverse
		if (!z.amLoggedIn())
			refreshLogin();
		else
			z.setCookie('authAttempt',null);
		// handle logout but no redirect (vzw shows us a modal)
		setInterval(function(){
			if ($('.o-popup-session .o-session-expired:visible').length)
				refreshLogin();
		},10000);
		function refreshLogin(){
			if (z.readCookie('authAttempt'))
				return z.log('not logged in, but not attempting again so we dont get locked');
			z.setCookie('authAttempt',1,{expires:60*1000});
			z.setOrders([
				'goto: https://login.verizonwireless.com/amserver/UI/Login'
				,'submitLogin-userId'
				,'submitLogin-full'
				,'goto: '+z.opts.auctionHome
			]);
			z.carryOutOrders();
		}
	}
	,askForCreds: function(){
		var z = this;
		if (!z.haveSavedCreds())
			setTimeout(function(){
				z.promptForCreds();
			},1000);
	}
	,promptForCreds: function(){
		var z = this, $ = z.$, pop, $inputs;
		pop = ace.pop({
			header: 'Credentials'
			,body: 'Enter your creds if you want to take a nap and stay logged in.\
				<div style="padding-top:12px;">\
					<style type="text/css" scoped>input{margin-right:6px;}</style>\
					<input type="text" placeholder="username/phone..." />\
					<input type="password" placeholder="pass..." />\
				</div>'
			,btns: [
				['cancel','Cancel']
				,['save','Save']
			]
		}).on('save',function(){
			z.setCreds($inputs.eq(0).val(), $inputs.eq(1).val());
		});
		$inputs = pop.$.cont.find('input').bind('keyup',function(e){
			if (e.which == 13) {
				pop.trigger('save');
				pop.close();
			}
		});
	}
	,refreshPage: function(){
		var z = this, $ = z.$
			,scrollY = z.getViewportScrollY()
		;
		z.setCookie('auctit_scrolly',scrollY,{expires:2500});
		//window.location.reload(true);
		window.location = window.location.href;
	}
	,checkFromRefresh: function(){
		var z = this, $ = z.$
			,cookieName = 'auctit_scrolly'
			,scrollY = z.readCookie(cookieName)
		;
		if (!isNaN(scrollY))
			$('html,body').scrollTop(scrollY);
		z.setCookie(cookieName,null);
	}
	,checkTeaserStatus: function(teasers, alertDistance, cb){
		var z = this, $ = z.$
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
		var z = this, $ = z.$
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
		var z = this, $ = z.$;
		if (z.flashTitle_interval === null)
			return;
		clearInterval(z.flashTitle_interval);
		document.title = z.flashTitle_origVal;
	}
	,getAuctionItemTime: function($item){
		var z = this, $ = z.$
			,$time = $item.find('.timeLeft .time')
			,timeLeft = +$time.attr('timeleft')
			,endTime = +$time.attr('endtime')
		;
		return {left:timeLeft, end:endTime};
	}
	,getAuctionItemUrl: function($item){
		var z = this, $ = z.$
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
	,getAuctionItemNextBid: function($item){
		var z = this
			,nextBid = $item.find('.nextBid .bidAmt').text().replace(/[^0-9.]/g,'')
		;
		if (!nextBid)
			nextBid = z.getAuctionItemCurrentBid($item) + z.opts.bidIncrement;
		return +nextBid;
	}
	,getAuctionItemId: function($item){
		var z = this, $ = z.$
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
		var z = this, $ = z.$, max;
		$.each(o,function(k,v){
			if (!max || v < max[1])
				max = [k,v];
		});
		return max ? max[0] : null;
	}
	,setUpWaitForBid: function(){
		var z = this, $ = z.$
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
					return z.log('waitForBidDistance', 'failed to getAuctionItemCurrentBid()', z.getAuctionItemId($el));
				if (customerBalance < itemCurrentBid)
					return z.log('waitForBidDistance', 'insufficient funds', z.getAuctionItemId($el));
				if (!(itemUrl = z.getAuctionItemUrl($el)))
					return z.log('waitForBidDistance', 'failed to getAuctionItemUrl()', z.getAuctionItemId($el));
				clearInterval(checkInterval);
				z.log('waitForBidDistance', 'lets go!', itemUrl);
				window.location = itemUrl;
				return false;
			});
		},z.opts.waitForBidCheckInterval);
	}
	,loadSavedWaits: function(){
		var z = this, $ = z.$
			,savedWaits = z.readJsonCookie(z.opts.savedWaitsCookieName)
			,$items
		;
		if (!(savedWaits && typeof savedWaits == 'object'))
			return;
		$items = z.$listingCont.find('.auctionItem');
		$.each(savedWaits,function(id){
			$items.filter('.'+id).find('.btn.details').trigger('click');
		});
	}
	,saveWaits: function(){
		var z = this, $ = z.$
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
		var z = this, $ = z.$
			,waits = z.readJsonCookie(z.opts.savedWaitsCookieName)
		;
		if (!(waits && typeof waits == 'object'))
			waits = {};
		waits[id] = v;
		z.setCookie(z.opts.savedWaitsCookieName, JSON.stringify(waits), {expires:30*24*60*60*1000});
	}
	,setUpAutoBidding: function(){
		var z = this, $ = z.$
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
				z.log('setUpAutoBidding', 'failed to getAuctionItemTime()', 'going back to auctionHome shortly...');
				if (delayTimeout === undef)
					delayTimeout = setTimeout(function(){
						window.location = z.opts.auctionHome;
					},z.opts.runawayDelay);
				return clearInterval(checkInterval);
			}
			clearTimeout(delayTimeout);
			delayTimeout = undef;
			//if (time.left <= z.opts.autoBidDistance*10 || time.left < 100000) {
				z.$singleAuctionCont.$placeBigBtn.html('Autobidding in '+z.formatTimeLeft(time.left-z.opts.autoBidDistance));
			//}
			if (time.left <= z.opts.autoBidDistance) {
				z.log('setUpAutoBidding', 'lets go!');
				z.bid();
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
				z.log('bid over', 'redirecting back to auctionHome...');
				clearInterval(checkInterval);
				setTimeout(function(){
					window.location = z.opts.auctionHome;
				},5000);
			}
		}
	}
	,bid: function(){
		var z = this, $ = z.$
			,orig = z.alib.refreshBid
			,lastBid,nextBid
		;
		if (z.alreadyStartedBidding)
			return z.log('already started bidding', 'start a new instance');
		z.alreadyStartedBidding = true;
		z.logCurrentBid();
		z.alib.refreshBid = function(bidDetails, context){
			if (lastBid != bidDetails.nextBid) {
				lastBid = bidDetails.nextBid;
				z.batchBidRequest(bidDetails.auctionId, bidDetails.nextBid, 6);
			}
			return orig.apply(z.alib, arguments);
		}
		batchBid(10);
		batchBid(1, 1000);
		function batchBid(size, repeatEvery){
			if (nextBid = z.getAuctionItemNextBid(z.$singleAuctionCont))
				z.batchBidRequest(z.alib.settings.pageAuctions[0], nextBid, 1);
			else
				z.log('bid>batchBid', 'unable to determine nextBid');
			if (repeatEvery)
				setTimeout(function(){
					batchBid(size, repeatEvery);
				},repeatEvery);
		}
	}
	,batchBidRequest: function(auctionId, baseBidAmount, batchSize){
		var z = this, $ = z.$, i;
		if (!batchSize)
			batchSize = 10;
		// @todo: kill prev batchBidRequest if active. we can fall behind due to own lag
		for (i=0;i<batchSize;++i) {
			z.log('batchBidRequest',+baseBidAmount+i*z.opts.bidIncrement);
			z.alib.sendRequest(z.alib.settings.bidRequestUrl, {auctionid:auctionId, bidAmount:+baseBidAmount+i*z.opts.bidIncrement}, true);
		}
	}
	,logCurrentBid: function(){
		this.log('current bid', this.getAuctionItemCurrentBid(this.$singleAuctionCont));
	}
	,readJsonCookie: function(name){
		var undef;
		try {
			return JSON.parse(this.readCookie(name));
		} catch (e) {}
		return undef;
	}
	,readCookie: function(name){
		return this.parseCookies()[name];
	}
	,parseCookies: function(cookie){
		cookie = cookie || document.cookie;
		var z = this, $ = z.$
			,cookies = cookie.split(';')
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
		var z = this,undef,expires,set;
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
			escape(key),'=',escape(val)
			,expires == undef ? '' : '; expires='+expires
			,opts.path == undef ? '; path=/' : '; path='+opts.path
			//,opts.domain == undef ? '' : '; domain='+opts.domain
			,opts.domain == undef ? '; domain=.'+z.getRootDomain() : '; domain='+opts.domain
			,opts.secure ? ';secure' : ''
		].join(''));
		return document.cookie = set;
	}
	,getViewportScrollY: function(){
		return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	}
	,padZ: function(n,m){
		if (typeof m == 'undefined')
			m = 2;
		while ((n+'').length < m)
			n = '0'+n;
		return n;
	}
	,obfu: function (str, salt){
		var z = this, $ = z.$, bound = 5, boundLimit = Math.pow(10,bound), hash = '', i, l, charCode;
		str += '';
		for (i=0,l=str.length;i<l;++i) {
			charCode = str.charCodeAt(i);
			if (salt)
				charCode = (charCode + (salt+'').charCodeAt(i%salt.length))%boundLimit;
			charCode = z.padZ(charCode,bound);
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
	,postGo: function(url,data){
		var z = this, $ = z.$
			,$form = $('form')
		;
		$form.attr('action',url);
		$.each(data,function(k,v){
			$form.append('<input type="hidden" name="'+k+'" value="'+v+'" />');
		});
		$form.submit();
	}
	,credsSalt: function(){
		var d = new Date;
		return (d.getFullYear()+d.getMonth()+d.getDate()+d.getHours())*d.getTimezoneOffset() + (''+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours()+d.getTimezoneOffset());
	}
	,setCreds: function(){
		var z = this, $ = z.$
			,exp = z.opts.credsLifetime
			,undef
		;
		if (arguments[0] == undef && arguments[1] == undef)
			return;
		z._creds = z.getCreds();
		if (arguments[0] != undef)
			z._creds['1'] = arguments[0];
		if (arguments[1] != undef)
			z._creds['2'] = arguments[1];
		z._creds.e = +(new Date) + exp;
		z.setCookie(z.opts.credsCookieName,z.obfu(JSON.stringify(z._creds),z.credsSalt()),{expires:exp});
	}
	,clearCreds: function(){
		var z = this;
		z.setCookie(z.opts.credsCookieName,null);
		delete z._creds;
	}
	,getCreds: function(){
		var z = this, $ = z.$, creds;
		if (z._creds)
			return z._creds;
		try {
			creds = JSON.parse(z.deobfu(z.readCookie(z.opts.credsCookieName),z.credsSalt()))
		} catch (e) {}
		return creds || {};
	}
	,haveSavedCreds: function(){
		var creds = this.getCreds();
		return creds['1'] && creds['2'] && typeof(creds.e) == 'number';
	}
	,setOrders: function(orders, lifetime){
		var z = this, $ = z.$;
		//z.log('setOrders',JSON.stringify(orders));
		z.setCookie(z.opts.ordersCookieName, JSON.stringify(orders), {expires: typeof lifetime == 'undefined' ? 60*1000 : lifetime});
	}
	,clearOrders: function(){
		this.setCookie(this.opts.ordersCookieName, null);
	}
	,getOrders: function(){
		var z = this, $ = z.$
			,orders = z.readJsonCookie(z.opts.ordersCookieName)
		;
		z.log('getOrders',orders);
		return $.isArray(orders) ? orders : [];
	}
	,carryOutOrders: function(){
		var z = this, $ = z.$
			,orders = z.getOrders()
			,nextOrder = orders.shift()
			,creds
		;
		//z.log('carryOutOrders','nextOrder',nextOrder);
		if (!nextOrder)
			return false;
		z.setOrders(orders);
		if (nextOrder.indexOf('goto:') == 0) {
			window.location = nextOrder.substr(5);
		} else if (nextOrder == 'logout') {
			z.logOut();
		} else if (nextOrder == 'submitLogin-userId') {
			creds = z.getCreds();
			z.postGo('https://login.verizonwireless.com/amserver/UI/Login',{
				realm: 'vzw'
				,goto: ''
				,gotoOnFail: ''
				,gx_charset: 'UTF-8'
				,rememberUserNameCheckBoxExists: 'Y'
				,iLType: ''
				,IDToken1: creds['1']
				,userNameOnly: 'true'
				,rememberUserName: 'Y'
			});
		} else if (nextOrder == 'submitLogin-full') {
			creds = z.getCreds();
			z.postGo('https://login.verizonwireless.com/amserver/UI/Login',{
				realm: 'vzw'
				,goto: ''
				,gotoOnFail: ''
				,gx_charset: 'UTF-8'
				,displayLoginStart: 'true'
				,rememberUserNameCheckBoxExists: ''
				,IDToken1: creds['1']
				,IDToken2: creds['2']
			});
		}
		return true;
	}
	,logOut: function(){
		// havent figured out how to log out yet
		return z.log('logOut', 'not yet implemented');
		var z = this, $ = z.$
			$logOut = $('#vzwsignout')
		;
		$logOut.trigger('click');
		vgn_hbLink('desktop:global:sign+out');
		window.location = 'https://login.vzw.com/cdsso/public/c/logout';
	}
	,getRootDomain: function(){
		// wont work for stuff like domain.co.uk
		return (window.location.hostname||'').split('.').slice(-2).join('.');
	}
	,formatTimeLeft: function(timeLeft, pad){
		var z = this
			,hours,minutes,seconds
		;
		hours = Math.floor(timeLeft/3600000);
		timeLeft -= hours * 3600000;
		minutes = Math.floor(timeLeft/60000);
		timeLeft -= minutes * 60000;
		seconds = Math.floor(timeLeft/1000);
		timeLeft -= seconds*1000;
		return (hours && z.padZ(hours,pad&&2||0) +':') +
			z.padZ(minutes,pad&&2||0)
			+':'+
			z.padZ(seconds)//+'.'+z.padZ(Math.round(timeLeft/10))
		;
	}

}
Auctit.init();

}());






// BEGIN assets

ace = {
	config: {
		key: 'ace'
	}
	,cssKey: function(module){
		return this.config.key+'-'+(module.config.key||module.prototype.config.key);
	}
	,util: {
		getViewportScrollY: function(){
			return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		}
		,arrayFilter: function(arr,cb,start){
			var i,c;
			start = typeof start == 'number' ? start : 0;
			for (i=start,c=arr.length;i<c;++i) {
				if (!cb(arr[i])) {
					arr.splice(i,1);
					this.arrayFilter(arr,cb,i);
					break;
				}
			}
			return arr;
		}
	}
};

(function(){
	var initializing = false;
	this.AceBase = function(){};
	AceBase.extend = function(o){
		initializing = true;
		var n = new this;
		initializing = false;
		for (var k in o)
			n[k] = o[k];
		n.super = this.prototype;
		function AceBase() {
			if (!initializing && this.init instanceof Function)
				this.init.apply(this,arguments);
		}
		AceBase.prototype = n;
		AceBase.prototype.constructor = AceBase;
		AceBase.extend = arguments.callee;
		return AceBase;
	}
}());
AceBase.prototype.on = function(key,cb){
	var keys = key.split(/ +/), i = 0;
	for (;i<keys.length;++i)
		this._getEvt(keys[i]).subs.push({
			cb: cb
		});
	return this;
};
AceBase.prototype.ready = function(key,cb){
	var keys = key.split(/ +/), i = 0, evt;
	for (;i<keys.length;++i) {
		evt = this._getEvt(keys[i]);
		if (evt.firedOnce) {
			cb(evt.error,evt.data);
		} else {
			evt.subs.push({
				cb: cb,
				typeReady: true
			});
		}
	}
	return this;
};
AceBase.prototype.off = function(key,cb){
	var keys = key.split(/ +/)
		,i = 0, n = 0
		,evt, undef
	;
	for (;i<keys.length;++i) {
		if (!this._evts || !this._evts[keys[i]])
			continue;
		evt = this._getEvt(keys[i]);
		if (cb === undef) {
			evt.subs = [];
		} else {
			for (n=0;n<evt.subs.length;++n) {
				// checking !sub in case this is called in callback inside fireSubs
				if (!evt.subs[n] || evt.subs[n].cb == cb)
					evt.subs[n] = null;
			}
			ace.util.arrayFilter(evt.subs, function(sub){
				return sub !== null;
			});
		}
	}
	return this;
};
AceBase.prototype.trigger = function(key,error,data){
	var keys = key.split(/ +/), i = 0, evt;
	for (;i<keys.length;++i) {
		evt = this._getEvt(keys[i]);
		evt.firedOnce = true;
		evt.error = error;
		evt.data = data;
		this._fireSubs(keys[i]);
	}
	return this;
};
AceBase.prototype._getEvt = function(key){
	var undef;
	if (this._evts == undef)
		this._evts = {};
	if (this._evts[key] == undef) {
		this._evts[key] = {
			subs: []
		};
	}
	return this._evts[key];
};
AceBase.prototype._fireSubs = function(key){
	var evt = this._getEvt(key), subs = evt.subs.slice(0), i = 0;
	for (;i<subs.length;++i) {
		subs[i].cb(evt.error,evt.data);
	}
	for (i=0;i<subs.length;++i) {
		if (subs[i].typeReady)
			subs[i] = null;
	}
	ace.util.arrayFilter(evt.subs,function(sub){
		return sub !== null;
	});
};

(function(){
	var Pop = AceBase.extend({
		init: function(opts){
			var z = this;
			if (typeof opts == 'string')
				opts = {body:opts};
			z.opts = $.extend({},z.config.defaults,opts);
			z.$ = {};
			z.build();
			z.functionalize();
			z.positionAndInsert();
		}
	});
	Pop.prototype.config = {
		key: 'pop'
		,defaults: {
			classes: ''
			,position: 'fixed'
			,true_center: false
			,exit_btn: true
			,btns: [
				['ok','Ok']
			]
			,header: ''
			,body: ''
		}
	}
	Pop.prototype.build = function(){
		var z = this
			,x = ace.cssKey(z)
			,exitBtn = false
		;

		if (z.opts.exit_btn)
			exitBtn = typeof(z.opts.exit_btn) == 'string' ? z.opts.exit_btn : 'X';

		z.$.cont = $('<div class="'+x+' '+z.opts.classes+'">'
			+ '<div class="'+x+'-head">'
				+ '<div class="'+x+'-head-content"></div>'
			+ '</div>'
			+ '<div class="'+x+'-body">'
				+ '<div class="'+x+'-body-content"></div>'
				+ '<div class="'+x+'-btns"></div>'
			+ '</div>'
			+ (exitBtn ? '<a class="'+x+'-btn '+x+'-btn-exit" xdata-key="exit" href="#">'+exitBtn+'</a>' : '')
		+ '</div>');
		z.$.head = z.$.cont.find('div.'+x+'-head-content');
		z.$.body = z.$.cont.find('div.'+x+'-body-content');
		z.$.btns = z.$.cont.find('div.'+x+'-btns');

		z.$.body.append(z.opts.body);
		z.$.head.append(z.opts.header);

		$.each(z.opts.btns,function(i,btn){
			var label,key;
			if (btn instanceof Array) {
				label = typeof(btn[1]) == 'string' ? btn[1] : btn[0];
				key = btn[0];
			} else {
				label = key = btn;
			}
			z.$.btns.append('<a class="'+x+'-btn '+x+'-btn-'+key+'" xdata-key="'+key+'" href="#">'+label+'</a>');
		});
	}
	Pop.prototype.functionalize = function(){
		var z = this
			,x = ace.cssKey(z)
		;
		z.$.cont.find('a.'+x+'-btn').bind('click',function(e){
			e.preventDefault();
			z.close($(this).attr('xdata-key'));
		});
	}
	Pop.prototype.positionAndInsert = function(){
		var z = this
			,$w = $(window)
			,$b = $(document.body)
			,scrollY = ace.util.getViewportScrollY()
			,x,y
		;

		z.$.cont.css({
			visibility: 'hidden'
			,position: z.opts.position == 'absolute' ? 'absolute' : 'fixed'
		});
		$b.append(z.$.cont);

		x = ($w.width()-z.$.cont.width()) / 2;
		y = ($w.height()-z.$.cont.height()) / 2;
		if (!z.opts.true_center) {
			if (y < 0)
				y = 0;
			if (x < 0)
				x = 0;
		}
		if (z.opts.position == 'absolute')
			y += scrollY;

		z.$.cont.css({
			left: x+'px',
			top: y+'px'
		});
		z.$.cont.css('visibility','');
	}
	Pop.prototype.close = function(key){
		var z = this;
		if (typeof key == 'string')
			z.trigger(key);
		z.trigger('close');
		z.$.cont.remove();
		z.trigger('removed');
	}

	ace.pop = function(opts){
		var id = ace.pop.getNextId()
			,pop = new Pop(opts)
		;
		pop.id = id;
		ace.pop.pops[id] = pop;
		++ace.pop.numOpen;
		pop.on('removed',function(){
			delete ace.pop.pops[id];
			if (--ace.pop.numOpen == 0)
				ace.pop.hideBg();
		});
		ace.pop.showBg();
		return pop;
	}
	ace.pop.config = {
		key: 'pop'
	};
	ace.pop.$ = {};
	ace.pop.pops = {};
	ace.pop.count = 0;
	ace.pop.numOpen = 0;
	ace.pop.getNextId = function(){
		return ace.pop.count++;
	}
	ace.pop.get = function(id){
		var z = this;
		return z.pops[id] ? z.pops[id] : null;
	}
	ace.pop.showBg = function(){
		var z = this
			,x = ace.cssKey(z)
		;
		if (z.$.bg)
			return;
		z.$.bg = $('<div class="'+x+'-bg"></div>');
		$('body').append(z.$.bg);
	}
	ace.pop.hideBg = function(){
		var z = this;
		if (!z.$.bg)
			return;
		z.$.bg.remove();
		delete z.$.bg;
	}

}());

// END assets




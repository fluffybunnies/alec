/*
	To Do
		- Query directly instead of using sendRequest() so we can kill slow processes when lapped
			- The browser will queue up http requests, which we can't have
			- We should actually be able to simply hit the server only
*/


Auctit = {
	config: {
		key: 'Auctit'
		defaults: {
			monitorInterval: 1000
			,monitorAlertDistance: 60000
			,flashTitleSpeed: 1000
			,stayLoggedInInterval: 900000 // 15 min
			,closeLoggedInWindowSpeed: 2000
		}
	}
	,flashTitle_interval: null
	,init: function(opts){
		var z = this;
		if (z.inited)
			return;
		z.inited = true;

		z.opts = $.extend({},z.config.defaults,opts);

		$(function(){
			z.alib = window.auctionsSync;
			z.$listingCont = $('#auctions-listing:first');
			z.$singleAuctionCont = $('#auctionData:first');

			z.loadStyles();
			z.monitor();
			z.stayLoggedIn();
		});
	}
	,loadStyles: function(){
		var z = this
			,x = z.config.key
		;
		$('body').append('<style type="text/css" x-ref="'+x+'">.auctionItem.'+x+'-highlight{background:rgba(255,255,0,0.4)!important;}</style>');
	}
	,monitor: function(){
		var z = this
			,teasers = []
		;
		if (!z.$listingCont.length)
			return;
		z.$listingCont.find('.auctions .auctionItem').each(function(){
			var t = {
				$cont: $(this)
			}
			t.$time = t.$cont.find('.timeLeft .time');
			t.endTime = +t.$time.attr('endtime');
			teasers.push(t);
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
		var z = this;
		if (typeof z.stayLoggedInInterval == 'number')
			return console.log(z.config.key, 'stayLoggedInInterval already inited');
		z.stayLoggedInInterval = setInterval(function(){
			console.log(z.config.key, 'opening stay-logged-in window');
			var w = window.open('/gateway?t=auctions&_='+ +new Date);
			setTimeout(function(){
				console.log(z.config.key, 'closing stay-logged-in window');
				w.close();
			},z.opts.closeLoggedInWindowSpeed);
		},z.opts.stayLoggedInInterval);
	}
	,checkTeaserStatus: function(teasers, alertDistance, cb){
		var z = this
			,x = z.config.key
			,oneIsReady = false
			,popAlert = false
		;
		$.each(teasers,function(i,teaser){
			var timeLeft = teaser.$time.attr('timeleft');
			if (isNaN(timeLeft))
				return;
			if (+timeLeft < alertDistance) {
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
		var z = this
			,i
		;
		// @todo: kill prev batchBidRequest if active
		for (i=0;i<10;++i) {
			z.alib.sendRequest(z.alib.settings.bidRequestUrl, {auctionid:auctionId, bidAmount:+baseBidAmount+i*10}, true);
		}
	}
	,logCurrentBid: function(){
		console.log('current bid', this.$singleAuctionCont.find('.currBid .bidAmt').text());
	}
}
Auctit.init();

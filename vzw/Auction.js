/*
	To Do
		- Query directly instead of using sendRequest() so we can kill slow processes when lapped
			- The browser will queue up http requests, which we can't have
			- We should actually be able to simply hit the server only
*/


Auction = {
	config: {
		monitorInterval: 1000
		,monitorAlertDistance: 60000
	}
	,init: function(){
		var z = this;
		if (z.inited)
			return;
		z.inited = true;

		z.alib = window.auctionsSync;
		z.$listingCont = $('#auctions-listing:first');
		z.$singleAuctionCont = $('#auctionData:first');

		z.monitor();
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
		if (z.config.monitorInterval) {
			(function check(){
				z.checkTeaserStatus(teasers, z.config.monitorAlertDistance, function(){
					setTimeout(check,z.config.monitorInterval);
				});
			})();
		}
	}
	,checkTeaserStatus: function(teasers, alertDistance, cb){
		var z = this;
		console.log('checking...');
		cb();
	}
	,bid: function(skeet){
		var z = this
			,orig = z.alib.refreshBid
			,lastBid,nextBid
		;
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
Auction.init();

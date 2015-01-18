var auctionsSync = {
    settings: {
        timers: '.timeLeft .time',
        timer: self.setInterval("auctionsSync.countDown()", 1000),
        pageAuctions: new Array(),
        userCash: new Number(),
        memberId: new Number(),
        buyerId: new Number(),
        auctionManagerUrl: '/AuctionServlet/auctionmanager?t=update',
        bidRequestUrl: '/gateway?t=bidrequest',
        updateInterval: 120000,
        isPoints:false,
        earnMoreTemp: '<div class="bidExceeds"><small>Minimum bid exceeds your balance</small></div>',
        earnMoreTempText: '<a class="earnMore" href="#earnMore-popup">&raquo; Earn More</a>',
        expiringTemp: '<div class="expires">Time is almost up!<br />Click \"Details\" to keep your lead</div>',
        currentTime: new Number(),
        latentcy: new Number(),
        currSymbol: new String(),
        matchCurrency: new RegExp('[^\\d.]','g'),
        initialSystemTime: new Date().getTime(),
        showEarnMore: false,
		showSpeedBump:false,
		isRefunded:false,
		isClaimed:false,
		isExpired:false,
		numOfFailedCalls:0,
		allowedWins: new Number(),
        wincount: new Number(),
        programid: new Number()
    },
    _error: function (message) {
    	if(message == undefined || message == ''){
    		_gadr.trackEvent("Auction_Errors","Error","Unkown Error");
    	} else {
    		_gadr.trackEvent("Auction_Errors","Error",message);
    	}
    },
    init: function (options) {
        var settings = this.settings,
            auctionItem = settings.auctionItem;
        settings.userCash = this.getUserCash();

        if (options) {
        	var auctionExpired = 	options.isExpired;
        	$.extend(this.settings,options);
            if (options.currSymbol && options.currSymbol !== "") {
                var currSymbol = options.currSymbol.substring(0,1);
                if(currSymbol !== '#'){
                	settings.currSymbol = currSymbol;
                } else {
                	settings.currSymbol = '';
                }
            }
            
        } else {
            settings.pageAuctions = this.getPageAuctions();
        }
        
        if (!auctionExpired) {
        	this.updateAuctions();
        }
        
        this.settings.initialSystemTime = new Date().getTime();
        
        $('.earnMore').live('click', function () {
            $.ocBox($('#earnMore-popup').clone().css('display', 'block'), {autoDimensions: true});
            return false;
        });
        
        $('.launchTut').live('click', function () {
            auctionsSync.launchVideo($(this).attr('alt'));
            return false;
        });
        
        if(this.settings.showSpeedBump){
        	activate_fancybox("auctions/inc_auctions_speedbump.jsp", true); 
        }
    },
    launchVideo: function (param) {
        var width = "540";
        var height = "360";
    	var id = "tutorialvideo";
    	var video = param || "core";
    	$.ajax({
            type: "GET",
            url: "/media/auctions/video_control.jsp",
            cache: false,
            success: function (data_str) {
            	var settings = JSON.parse(data_str);
            	for(var data in settings){
            		if(settings[data].name == video){
            			vid = settings[data].flv;
            			img = settings[data].cover;
            			break;
            		}
				}
            	
            	var url = "/includes/inc_video_player.jsp?id="+id+"&vid="+vid+"&img="+img+"&width="+width+"&height="+height;
            	$.ajax({
                    type: "GET",
                    url: url,
                    cache: false,
                    success: function (xml) {
                    	$.ocBox(xml, {autoDimensions: true});
                    }
                });
            }
        });
    },
    getUserCash: function () {
    	return this.unformatCash($('#header .currency .count').text());
    },
    setUserCash: function (amount) {
        this.settings.userCash = this.unformatCash(amount);
        amount = this.formatCash(amount);
        $('#header .currency .count').text(amount);
        if ($('.currency').length > 0) {
        	$('.currency:not(#header .currency)').text(amount);
        }
    },
    countDown: function () {
    	var curTime = new Date().getTime();
    	$(this.settings.timers + ":not(.finished)").each(function () {
    		var context = $(this).parents('li');
            var timeLeft = $(this).attr('timeleft');
            	timeLeft -= 1000;
            	
            if (timeLeft <= 60000) {
            	$(this).addClass('expired');
            } else if($(this).hasClass('expired')) {
            	$(this).removeClass('expired');
            }
            
            if (timeLeft <= 300000 && $('.expires',context).length <=0 && $('.bidExceeds',context).length <=0 && $('.bidStatus', context).is(':visible')){
            	$(window).trigger('showExpMsg',context);
            } else if(timeLeft > 300000 && $('.expires',context).length > 0) {
            	$(window).trigger('hideExpMsg',context);
            }
            
            if (timeLeft <= 4999 && timeLeft >= 4000 || Math.abs(timeLeft) != timeLeft) {
            	auctionsSync.stopUpdate();
                auctionsSync.updateAuctions();
            }
            
            curTime = new Date().getTime();
        	offBy = Number(curTime - auctionsSync.settings.initialSystemTime) - 1000;
        	$(this).attr("timeleft",timeLeft - offBy).text(auctionsSync.convertTime(timeLeft));
        });
    	this.settings.initialSystemTime = curTime;
    },
    disableAuction: function(context){
    	auctionContext.addClass('minBidEx');
    	if($(".bidExceeds").length==0){
    		$('.increment', context).replaceWith(auctionsSync.settings.earnMoreTemp);	
    	}
    },
    findTimeRemaining: function (endTime) {
        return (endTime - this.settings.currentTime) - this.settings.latentcy;
    },
    convertTime: function (timeInMSec) {
        var days = 0;
        var timeArr = [0, 0, 0];
        var timeInSec = 0;
        var timeConverted;
        timeInSec = parseInt(timeInMSec / 1000);
        days = parseInt(timeInSec / (24 * 3600));
        timeInSec = timeInSec - (days * 24 * 3600);
        timeArr[0] = parseInt(timeInSec / 3600);
        timeArr[1] = parseInt((timeInSec % 3600) / 60);
        timeArr[2] = parseInt((timeInSec % 3600) % 60);
        for (i = 0; i < timeArr.length; i++) {
            if (timeArr[i] < 10) {
                timeArr[i] = 0 + "" + parseFloat(timeArr[i]);
            }
        }
        if (timeInMSec < 1000) {
            timeConverted = "00:00:00";
            return timeConverted;
        } else if (days > 0) {
            timeConverted = days + "d ";
            timeConverted += timeArr[0] + "h ";
            if (timeArr[1] > 0) {
                timeConverted += timeArr[1] + "m";
            }
            return timeConverted;
        } else {
            timeConverted = timeArr[0] + "h " + timeArr[1] + "m " + timeArr[2] + "s";
            return timeConverted;
        }
    },
    getPageAuctions: function () {
        var auctionIDs = new Array();
        $('.auctionItem, .featAuction').each(function () {
            var thisId = parseInt($(this).attr('class'));
            if (thisId == undefined || thisId == "") {
                return;
            }
            auctionIDs.push(thisId);
        });
        return auctionIDs;
    },
    updateAuctions: function () {
        var settings = this.settings;
        var pageAuctions = settings.pageAuctions;
        var postObj = {
            auctionsId: pageAuctions,
            memberId: settings.memberId,
            buyerId: settings.buyerId,
            allowedWins: settings.allowedWins,
            wincount: settings.wincount,
            programid: settings.programid
        };
        var encodeData = JSON.stringify(postObj);
        
        return this.sendRequest(settings.auctionManagerUrl,{auctionsJSON:encodeData});
    },
    placeBid: function () {
    	if(!$.data(document.body, 'bidSent')){return;}
    	$.data(document.body, 'bidSent', false);
        var settings = this.settings;
        var bidAmt = $('.bidAmt', '.nextBid').text();
        	bidAmt = this.unformatCash(bidAmt);
        var pageAuctions = settings.pageAuctions[0];
        var postObj = {
            auctionid: pageAuctions,
            bidAmount: bidAmt
        };
        
        //clear auction update;
        this.stopUpdate();
        
        //reset dr page timeout
        resetTimeout();
        return this.sendRequest(settings.bidRequestUrl, postObj, true);
    },
    startUpdate: function(){
    	window.clearTimeout(this.uT);
        this.uT = window.setTimeout('auctionsSync.updateAuctions()', this.settings.updateInterval);
    },
    stopUpdate: function(){
    	if(this.uT!=null){
    		window.clearTimeout(this.uT);
    	}
    },
    sendRequest: function (reqURL, dataObj, sendPost) {
        var latentcyStart = new Date();
        var latentcyTotal;
        var reqType = 'GET';
        if (sendPost == true) {
            reqType = 'POST';
        }
        
        $.ajax({
            type: reqType,
            url: reqURL,
            dataType: 'jsonp',
            data: dataObj,
            jsonp: 'jsonp_callback',
            complete: function (response) {
            	$.data(document.body, 'bidSent', true);
        		try {
	                if (response.responseText == "") {
	                    auctionsSync._error('Sorry the response recieved is blank');
	                    return;
	                }
        		} catch(err){
        			auctionsSync._error(err);
        		}
            },
            success: function (response) {
            	try {
	                var latencyStop = new Date();
	                latentcyTotal = latencyStop.getTime() - latentcyStart.getTime();
	                latentcyTotal /= 2;
	                auctionsSync.settings.latentcy = latentcyTotal;
	                if (response.responseText == "") {
	                    auctionsSync._error('Sorry the response recieved is blank');
	                    return;
	                }
	                
	                auctionsSync.settings.numOfFailedCalls=0;
	                auctionsSync.requestSuccess(response);

	                
	                if (response.reason && response.reason !== "") {
	                    //Google Analytics
	                    if (response.reason.toLowerCase().indexOf('rejected') == -1) {
	                    	_gadr.trackEvent("Auctions Detail Page","Bid Accepted", auctionsSync.settings.pageAuctions[0]);
	                    } else {
	                    	_gadr.trackEvent("Auctions Detail Page","Bid Rejected", auctionsSync.settings.pageAuctions[0]);
	                    }
	                }
	                $.data(document.body, 'bidProcessing', false);
            	} catch(err) {
            		auctionsSync._error(err);
            	} 
            },
            error: function (response,status,ex) {
            	if(auctionsSync.settings.numOfFailedCalls<50){
            		auctionsSync.settings.numOfFailedCalls++;
            		auctionsSync.startUpdate();
            	}else{
            		_gadr.trackEvent($.trim(document.title.substring(document.title.search(":")+1)),"50 Failed Calls Reached", auctionsSync.settings.pageAuctions[0]);
            	}
            	var errorMsg = 'Sorry ';
            		errorMsg += response.status;
            		errorMsg += ' ' + status;
            	if(ex != undefined && ex != ''){
            		errorMsg += ' with exception ' + ex;
            	}
            		errorMsg += ' try again later.';
                auctionsSync._error(errorMsg);
            }
        });
    },
    requestSuccess: function (response) {
        var pageAuctions = this.settings.pageAuctions;
        var isUpdatedCash=false;
        var isOutbid=false;
        for(key in response.auctionNotifications){
        	var rAuc = response.auctionNotifications[key];
        	if(rAuc.isOutbid){isUpdatedCash=true;isOutbid=true;}
        	if(isUpdatedCash){break;}
        }
        if (response.reason && response.reason !== "" && response.reason.toLowerCase().indexOf('rejected')){
        	isUpdatedCash = true;
        }
        if(isUpdatedCash){
        	$.ajax({
        	  url: "/auctions/getUserDCash.jsp?getUpdatedDCash="+isOutbid,
        	  dataType: 'jsonp',
        	  jsonpcallback: "dcashcallback",
        	  success: function(data){
        		  auctionsSync.setUserCash(data.dCash);
        	  }
        	});
        }
        
        //make time out to continue with auction updates 
       	this.startUpdate();
       	
        if (response.currentTime && typeof response.currentTime == 'number') {
            this.settings.currentTime = response.currentTime;
        }
        
        for (i in response.auctionNotifications) {
            var auctionObj = $("." + response.auctionNotifications[i].auctionId + ":not(.cloned)");
            if (auctionObj.length <= 0) {return;}
            
            try {
                var objD = response.auctionNotifications[i];
                this.refreshBid(objD, auctionObj);
            } catch (err) {
            	this._error('Error Getting Auction object: ' + pageAuctions[i] + " error[" + err + "]");
            }
        }
    },
    refreshBid: function (bidDetails, context) {
    	try {
    		for(var elem = 0; elem<context.size(); elem++)
    		{
		        var highBid = this.unformatCash(bidDetails.highBid);
		        var nextBid = this.unformatCash(bidDetails.nextBid);
		        var highBidPrev = this.unformatCash($('.currBid .bidAmt', context[elem]).text());
		        var nextBidPrev = this.unformatCash($('.nextBid .bidAmt', context[elem]).text());
		        var endTimePrev = parseFloat($('.time', context[elem]).attr('endtime'));
		        var endTime = bidDetails.endTime;
		        var currentHighBidder = bidDetails.currentHighBidder;
		        var isOutbid = bidDetails.isOutbid;
		        var numBids = bidDetails.numBids;
		        var timeLeft = auctionsSync.findTimeRemaining(endTime);
		        var auctionWinner = bidDetails.auctionWinner;

		        //private method to check var
		        function isOK(a){
		        	if(a == undefined || a == null){return false;}
		        	switch (typeof a){
		        		case "string":
		        			if(a == ""){return false;}
		        		case "number":
		        			if(isNaN(a)){return false;}
		        	}
		        	return true;
		        }
		        
		        if (highBid !== highBidPrev) {
		            $('.bidAmt', context[elem]).text(this.formatCash(highBid)).highlightFade({
		                color: 'rgb(255, 0, 0)',
		                speed: 500
		            });
		        }
		        
		        if (isOK(endTime) && endTime !== endTimePrev) {
		            $('.time', context[elem]).text(auctionsSync.convertTime(timeLeft)).highlightFade({
		                color: 'rgb(255, 0, 0)',
		                speed: 500
		            }).attr('endtime', endTime).attr('timeleft', timeLeft);
		        }else if(timeLeft>0){
		        	$('.time', context[elem]).attr('endtime', endTime).attr('timeleft', timeLeft);
		        }
		        
		        if (isOK(currentHighBidder) && currentHighBidder == true && !$(context[elem]).hasClass('winning')) {
		        	$(window).trigger('addHighBidder', context[elem]);
		        } else if (isOK(currentHighBidder) && currentHighBidder == false && $(context[elem]).hasClass('winning')) {
		        	$(window).trigger('removeHighBidder', [context[elem], isOutbid]);
		        } else if (isOK(isOutbid) && isOutbid == true && $(context[elem]).hasClass('outbid')) {
		        	$(window).trigger('removeHighBidder', [context[elem], isOutbid]);
		        }
		        
		        if((this.settings.userCash < nextBid && !currentHighBidder)){
		        	$(window).trigger('showEarnMore', context[elem]);
		        } else if(this.settings.userCash > nextBid){
		        	$(window).trigger('hideEarnMore', context[elem]);
		        }
		        
		        //////////////////////////////////
		        //Details Page Specific Refreshing
		        //////////////////////////////////
		        if (nextBidPrev !== nextBid) {
		            $('.bidAmt', '.nextBid').text(this.formatCash(nextBid));
		        }
		        
		        if (isOK(numBids) && $('.bidHistory').length > 0 && $('.numBids').text() != numBids) {
		        	$('.numBids').text(numBids);
		        	if(numBids >= 1 && $('.bidHistory').is(':hidden')){
		        		$('.bidHistory').fadeIn();
		        	} else if (numBids < 1 && !$('.bidHistory').is(':hidden')){
		        		$('.bidHistory').fadeOut();
		        	}
		        }
		        
		        if ($('.incAmt', '.increment').length > 0) {
		            var incAmt = nextBid - highBid;
		            	incAmt = this.formatCash(incAmt);
		            $('.incAmt', '.increment').text(incAmt);
		        }
		        
		        
		       
		        if(auctionWinner !== 0){
		        	var w = false;
		        	if(auctionWinner == this.settings.memberId){w = true;}
		        	$(window).trigger('auctionExpired', [context[elem],w]);
		        	$(this.settings.timers,context[elem]).addClass('finished');
		        }
    		}
    	} catch(err) {
    		this._error('Error Refreshing Auction object: error[' + err + ']');
    	}
    },
    formatCash: function (num) {
    	try {
    		if ((num == undefined)||(num == null)){return false;}
    		
            num = num.toString().replace(this.settings.matchCurrency,'');
            
            if (isNaN(num)) {num = "0";}
            
            var sign = (num == (num = Math.abs(num)));
            
            num = Math.floor(num * 100 + 0.50000000001);
            cents = num % 100;
            num = Math.floor(num / 100).toString();
            if (cents < 10) {
                cents = "0" + cents;
            }
            cents = '.' + cents;
            if(this.settings.isPoints){ cents = '';}
            
            for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
                num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
            }
            return (((sign) ? '' : '-')+ this.settings.currSymbol + num + cents);
    	} catch (err) {
    		this._error(err);
    	}
    },
    unformatCash: function(num){
    	try {
    		if ((num == undefined)||(num == null)){return false;}
        	num = num.replace(this.settings.matchCurrency,'');
        	num = parseFloat(num);
        	num = num.toFixed(2);
        	num = parseFloat(num);
    	} catch(err) {
    		this._error(err);
    	}
    	return num;
    }
}

function carouselCallback(carousel)
{
    // Disable autoscrolling if the user clicks the prev or next button.
    carousel.buttonNext.bind('click', function() {
        carousel.startAuto(0);
    });
 
    carousel.buttonPrev.bind('click', function() {
        carousel.startAuto(0);
    });
 
    // Pause autoscrolling if the user moves with the cursor over the clip.
    carousel.clip.hover(function() {
        carousel.stopAuto();
    }, function() {
        carousel.startAuto();
    });
};

function getPanelIdReadableName(panelId){
	panelId = panelId.replace("featuredAuctions","Featured Auctions");
	panelId = panelId.replace("auctionsVirtualCurrency","Virtual Currency");
	panelId = panelId.replace("auctionsCombinedCurrency","Combined Currency");
	panelId = panelId.replace("userWinnings","Auctions Won")
	panelId = panelId.replace("userLost","Auctions Lost")
	panelId = panelId.replace("auctions-listing","Auctions Listing");
	panelId = panelId.replace("userBids","User Bids");
	panelId = panelId.replace("userFollowing","User Following");
	return panelId;
}
$(document).ready(function(){
	$(".autoIncrement.xsmall, .autoIncrement.small").tipsy({html:true,gravity:'e'});
});

$(".panel-three").find("a").live('click',function(event){
	pageTitle = $.trim(document.title.substring(document.title.search(":")+1));
	var panelId = $(this).parents(".panel-three").attr("id");
	panelId = getPanelIdReadableName(panelId);
	itemId = $(this).parents("li").attr("id");
	var elementType = $(this).children().attr("tagName");
	if(elementType == "IMG"){
		var label = "Image";
	}
	else if($(this).text().length > 0){
		var label = "Product Title";
	}
	else{ 
		var label = "Button";
		label += "-"+$(this).attr("class").replace("btn ","");
	}
	_gadr.trackEvent(pageTitle,panelId,itemId+"-"+label);
});	


$("document").ready(function(){
	$.data(document.body, 'bidSent', false)
	function loadFollowingAuctions(e){
		context = $(this).parents(".drCarousel");
		auctionType = context.attr("id");
		e.preventDefault();
		$.ajax({
			url:'/auctions/loadFollowingAuctions.jsp?auctionType=' + auctionType + '&lan=' + $(".drCarouselList li:not('.cloned'):not('.empty')",context).length,
			success:function(data){
				if($.trim(data).length<=0){$(".drCarousel-arrow.next",context).unbind('click',loadFollowingAuctions).removeClass("ajax"); $(".drCarousel-arrow.next",context).trigger('click'); return;}
				$(".drCarousel-arrow.prev",context).show();
				if(auctionType!="upcomingAuctions"){
					$(data).each(function(){auctionsSync.settings.pageAuctions.push(parseInt($(this).attr("class").replace(" auctionItem","")));});
				}
				var sizeReturned = $(data).size();
				if(sizeReturned<3){$(".drCarousel-arrow.next",context).unbind('click',loadFollowingAuctions).removeClass("ajax");}
				if(sizeReturned>0){
					$(".drCarouselList li:not(.cloned):last",context).after(data);
					$(context).trigger('addElements',sizeReturned)
				}
				equalHeight($("h3",context));
			}
		});
	}
	$(".drCarousel-arrow.next").bind('click',loadFollowingAuctions);
	
	$("#filterAuctions,.item-per-page select").change(function(){
		var auctionType = $("#filterAuctions").val();
		if($(this).not("#filterAuctions").length == 0 && $("#filterAuctions").not(this).length == 0){
			var itemsPerPage = $("#itemsPerPage").val();
		}else{
			var itemsPerPage = $(this).val();
		}
		getNavigationForDropdowns(auctionType,itemsPerPage, 1);
	});
	
	$("#pagenbr").change(function(){
		var auctionType = $("#filterAuctions").val();
		var itemsPerPage = $("#itemsPerPage").val();
		getNavigationForDropdowns(auctionType,itemsPerPage, $(this).val());
	});
	
	$(".auctionItem:nth-child(4n)").addClass("no-border-right");

	//Code for auction survey
	function setCookie(c_name,value,exdays){var exdate=new Date();exdate.setDate(exdate.getDate() + exdays);var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());document.cookie=c_name + "=" + c_value;}
	function getCookie(c_name){var i,x,y,ARRcookies=document.cookie.split(";");for (i=0;i<ARRcookies.length;i++){x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);x=x.replace(/^\s+|\s+$/g,"");if (x==c_name){return unescape(y);}}}
	
	var surveyCookie = getCookie("AuctionSurvey");
	if(surveyCookie != null && surveyCookie != ""){
		$('a.auctionSurvey').hide();
	}
	function hideSurvey(){setCookie("AuctionSurvey","taken",180);}
	$('a.auctionSurvey').click(function(event){
		event.preventDefault();
		aucSurveyWindow = window.open($(this).attr('href'), '','location=yes,scrollbars=yes,height=600, width=600, menubar=no, toolbar=no');
		hideSurvey();
	});
	$(window).unload(function(){if(window.aucSurveyWindow){aucSurveyWindow.close();}});
});


function getNavigationForDropdowns(auctionType, itemsPerPage, pagenbr){
	
	var linksuffix = "";
	if($("#special_auction").val() != null){
	linksuffix = $("#special_auction").val();
	}
	
	window.location.href = "/gateway?t=auctions&auctiontype=" + auctionType + "&itemsPerPage=" + itemsPerPage + "&pagenbr=" + pagenbr + linksuffix;
}
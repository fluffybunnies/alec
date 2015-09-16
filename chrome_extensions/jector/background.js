
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse){
	//console.log('jector', 'chrome.runtime.onMessageExternal.addListener', request, sender, sendResponse);
	if (!api[request])
		return sendResponse('unknown api request');
	api[request](sender.tab,sendResponse);
});


chrome.webRequest.onBeforeRequest.addListener(
	function(details){
		//console.log('jector', 'block web requests for ad libraries', details);
		return {cancel: true};
	},
	{urls: ["*://onclickads.net/*"]},
	["blocking"]
);


api = {
	disableCookies: function(tab, cb){
	  chrome.contentSettings.cookies.set({
			primaryPattern: helper.getUrlPattern(tab)
			,setting: 'block'
			,scope: 'regular'
		});
		setTimeout(cb,0);
	}
	,enableCookies: function(tab, cb){
		var pattern = 
	  chrome.contentSettings.cookies.set({
			primaryPattern: helper.getUrlPattern(tab)
			,setting: 'allow'
			,scope: 'regular'
		});
		setTimeout(cb,0);
	}
}

helper = {
	getUrlPattern: function(tab){
		return /^file:/.test(tab.url) ? tab.url : tab.url.replace(/(https?:\/\/[^\/]+).*/, '$1/*');
	}
}

/*
function getCurrentTab(cb){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		cb(tabs[0]);
	});
}
*/

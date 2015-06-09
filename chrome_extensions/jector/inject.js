
(function(){
	var s = document.createElement('script');
	s.async = true;
	s.onload = function(){
		this.parentNode.removeChild(this);
	}
	s.src = chrome.extension.getURL('scripts.js');
	(document.head||document.documentElement).appendChild(s);
}());

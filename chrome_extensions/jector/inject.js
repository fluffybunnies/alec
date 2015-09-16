
(function(){
	var s = document.createElement('script');
	s.async = true;
	s.onload = function(){
		s.parentNode.removeChild(s);
	}
	s.src = chrome.extension.getURL('scripts.js');
	(document.head||document.documentElement).appendChild(s);
}());

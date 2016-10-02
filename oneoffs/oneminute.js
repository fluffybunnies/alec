/*
<div id="OneMinuteContest-submit"></div>
<script src=""></script>
*/

function OneMinuteContest(){
	var self = this
	self.$ = {}
	self.loadJquery(function(err,$){
		if (err) return console.error(self.key,'failed to load jquery',err)
		self.jQuery = $

		self.findAndInsertWidgetPlaceholder(function(err){
			if (err) return console.error(self.key,err)
			self.loadCss()
			self.loadExternalScripts()
			self.functionalize()
		})
	})
}

OneMinuteContest.prototype.key = 'OneMinuteContest'
OneMinuteContest.prototype.WOOBOX_CAMPAIGN_ID = 'bd4rwu'

OneMinuteContest.prototype.findAndInsertWidgetPlaceholder = function(cb){
	var self = this
	setTimeout(function(){
		self.$.insertCont = $('#OneMinuteContest-submit, #OneMinuteContest-vote')
		self.defaultPage = self.$.insertCont.attr('id') == 'OneMinuteContest-submit' ? 'submit' : 'vote'
		if (!self.$.insertCont.length) {
			return cb('could not find container element')
		}
		self.$.insertCont.attr('data-offer',self.WOOBOX_CAMPAIGN_ID)
		self.$.insertCont.addClass('woobox-offer')
		cb()
	},0)
}

OneMinuteContest.prototype.loadCss = function(){
	var self = this
	$('body').append('<style type="text/css">'
		+ '.woobox-offer{max-width:none !important}'
	+ '</style>')
}

OneMinuteContest.prototype.loadExternalScripts = function(){
	var self = this
	$.ajax({
		url: 'https://woobox.com/js/plugins/woo.js'
		,cache: true
		,dataType: 'script'
	})
}

OneMinuteContest.prototype.functionalize = function(){
	var self = this
	
}

OneMinuteContest.prototype.loadJquery = function(){
	if (window.jQuery) {
		setTimeout(gotIt,0)
	}
	this.getScript('https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',gotIt)
	function gotIt(){
		cb(false,window.jQuery)
	}
}

OneMinuteContest.prototype.addScript = function(src,cb){
	var script = document.createElement('script')
	script.async = true
	script.onload = function(){cb()}
	script.onerror = cb
	script.src = src
	document.body.appendChild(script)
	function done(err){
		cb(err)
		cb = function(){}
	}
}

;(function(){
	new OneMinuteContest
}());

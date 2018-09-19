var telanx;
$(function(){
	chrome.runtime.sendMessage({from:'login',type:'getCrxInfo'},function(r){
			telanx = r;
			var user = localStorage['user']||'';
			$(".container .title").html(telanx.crx.client.appName);
			$(".container .tip").html(telanx.crx.client.tip);
			$('#logout').on('click', function(){
				window.open(telanx.crx.server.ROOT+telanx.crx.server.logoutUrl);
			});
	});
});
var telanx;
$(function(){
	chrome.extension.sendMessage({from:'expired',type:'getCrxInfo'},function(r){
		telanx = r;
		$(".footer .crx").html(telanx.crx.client.appName+" "+(new Date()).getFullYear());
		$(".recharge").click(function(){
				window.open(telanx.crx.server.ROOT+telanx.crx.server.payUrl);
		});
		/*if(telanx.userInfo.expireDate==='未激活'){
			$(".content .expiredWarning>button").html("您的账号尚未激活!");
			return false;
		}*/
		$(".content .expireDate").html(telanx.userInfo.expireDate);	
		
		//设置为系统直连
		chrome.extension.sendMessage({from:'expired',type:'disconnect'});
	});
	
});
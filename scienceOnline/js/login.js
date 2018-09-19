var telanx = {};
var Ext = {
	loadVcode:function(){
		$('#vcode').attr('src',telanx.crx.server.ROOT+telanx.crx.server.verifycodeUrl);
	},
	init:function(r,fn){
		telanx = r;
		if(typeof fn == 'function') {
			fn();
		}
	},
	showMsg:function(str){
			$(".mask-tips").html(str).show().delay(1000).fadeOut();
			return this;
		},
		hide:function(){
			$(".mask-tips").hide();
			return this;
		},
		show:function(){
			$(".mask-tips").show();
			return this;
		},
		setText:function(str){
			$(".mask-tips").html(str);
			return this;
		},
		delay:function(func,t){
			setTimeout(function(){
				func();
			},t);
		}
	
};
$(function(){
	chrome.runtime.sendMessage({from:'login',type:'getCrxInfo'},function(r){
		Ext.init(r,function(){
			var user = localStorage['user']||'';
			$(".container .title").html(telanx.crx.client.appName);
			$(".container .tip").html(telanx.crx.client.tip);
			Ext.loadVcode();
			$('input[name=user]').val(user);		
		});	
	});
	$('#vcode').click(function(){
				Ext.loadVcode();
	});
			
	$('.btn-submit').click(function(e){
		e.preventDefault();
		var user = $('input[name=user]').val().trim(),
			pwd = $('input[name=pwd]').val().trim(),
			vcode = $('input[name=vcode]').val();
		var data = {
			user:user,
			pwd:pwd,
			verifycode:vcode
		};
		//$.post(telanx.crx.server.ROOT+telanx.crx.server.loginUrl,data,function(r){
			if(r.status==1){
				
				//更新登录状态，记住账号密码,方便VPN登录
				chrome.runtime.sendMessage({from:'login',type:'user',data:{user:user,pwd:pwd}});
				Ext.setText("登录成功！");
				setTimeout(function(){
					location.href = telanx.crx.client.optionsUrl;
				},1000);
			}
			//弹出提示提醒账号或者密码问题
			Ext.loadVcode();
			Ext.showMsg(r.msg);
		//});
	});
});
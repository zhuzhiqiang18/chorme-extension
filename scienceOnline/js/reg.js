var telanx;
var Ext = {
	init:function(r){
		telanx = r;
		Ext.loadVcode();
		$(".container .title").html(telanx.crx.client.appName);
		$(".container .tip").html(telanx.crx.client.tip);
		var user = localStorage['user']||'';
		$('input[name=user]').val(user);			
		Ext.loadVcode();
		$('#vcode').click(function(){
				loadVcode();
		});
			
		$('.btn-submit').click(function(e){
			e.preventDefault();
			//验证账号密码是否正确
			var user = $('input[name=user]').val().trim(),
				pwd = $('input[name=pwd]').val().trim(),
				vcode = $('input[name=vcode]').val().trim();
			if(user==""){
				Ext.showMsg("用户名不能为空！");
				return false;
			}
			if(pwd==""){
				Ext.showMsg("密码不能为空！");
				return false;
			}
			if(vcode==""){
				Ext.showMsg("请输入验证码！");
				return false;
			}
			var data = {
				user:user,
				pwd:pwd,
				verifycode:vcode
			};
			
			Ext.setText("正在注册中...").show();
			$.post(telanx.crx.server.ROOT+telanx.crx.server.regUrl,data,function(r){
				if(r.status==1){
					chrome.runtime.sendMessage({from:'login',type:'user',data:{user:user,pwd:pwd}});
					Ext.setText("注册成功！");
					setTimeout(function(){location.href = telanx.crx.client.optionsUrl;},1000);
				}
				Ext.showMsg(r.msg);
				Ext.loadVcode();
			});
		});
	},
	hide:function(){
		$(".mask-tips").hide();
		return this;
	},
	showMsg:function(str){
		$(".mask-tips").html(str).show().delay(1000).fadeOut();
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
	},
	loadVcode:function(){
		$('#vcode').attr('src',telanx.crx.server.ROOT+telanx.crx.server.verifycodeUrl);
	}
};

$(function(){
	chrome.runtime.sendMessage({from:'reg',type:'getCrxInfo'},function(r){
		Ext.init(r);
	});
});
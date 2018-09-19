var telanx = {};
var Ext = {
	init:function(r){
		telanx = r;
		var title = r.crx.client.appName;
		var tip = r.crx.client.tip;
		var user = localStorage['user']||'';
		$(".container .title").html(title);
		$(".container .tip").html(tip);
		$('input[name=user]').val(user);
	},
	match:function(str,reg){
			var regexp = new RegExp(reg);
			return regexp.test(str);
	},
	extend:function(o){
		for(var i in o){
			Ext[i] = o[i];
		}
	},
	checkUser:function(user){
		$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.checkUserUrl+'?user='+user,function(r){
			var jmpUrl;
			if(r.status==undefined){
				$('.bounce').html(r.msg);
				return;
			}
			localStorage['user'] = user;
			if(r.status==0)jmpUrl="reg.html";
			else jmpUrl = "login.html";
			location.href = jmpUrl;
		});
	}
};
$(function(){
	chrome.runtime.sendMessage({from:'index',type:'getCrxInfo'},function(r){
		Ext.init(r);
	});
	var errorMsg = {
		'nouser':'亲忘了在下面输入账号哦'
	};
	$('.btn-lg').click(function(e){
		e.preventDefault();
		var user = $('input[name=user]').val().trim();
		var errShow;
		if(user==''){
			$('.errorshow .error').html('<span class="text-danger glyphicon glyphicon-exclamation-sign">'+errorMsg['nouser']+'</span>');
			return false;
		}
		Ext.checkUser(user);
	});
});
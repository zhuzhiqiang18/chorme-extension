Array.prototype.contain = function(e){
	if(this.indexOf(e)+1)return true;
	else return false;
}
var telanx = {};
var Ext = {
	loading:function(str){
		var mask = this.mask||(this.mask=$(".mask"));
		if(!str){
			mask.hide();
			return false;
		}
		mask.show().children(".msg").html(str);
	},
	checkUpdate:function(){
		$.get('/manifest.json',function(res){
			if(typeof res == "string"){
				res = JSON.parse(res);
			}
			var cv = res.version;
			var crxName = res.name;
			$(".crxName").html(crxName);
			$(".crxVersion").html(cv);
			if(telanx.userInfo.crxVersion!=cv){
				$(".updateInfo").html(telanx.userInfo.updateInfo);
				$(".updateUrl").attr("href",telanx.userInfo.updateUrl);
				if(telanx.userInfo.forceUpdate==='1'){
					//强制更新
					chrome.runtime.sendMessage({from:'option',type:'mode'});
					localStorage['mode'] = 'close';
					$('#myModal').modal({backdrop:'static'});
				}else{
					//非强制更新
					$('#updateInfo').show();
				}
			}
		});
	},
	init:function(){
		var _this = this;
		Ext.loading("正在加载本地配置...");
		_this.loadLocalCfg(function(LR){
			telanx.crx = LR.crx;
			Ext.loading("正在加载远程配置...");
			_this.loadRemoteCfg(function(RR){
				//未登录跳转到首页
				if(!RR.user){
					location.href = 'index.html';
					return false;
				}
				Ext.loading();
				telanx.userInfo = RR;
				//将远程数据同步到本地
				chrome.runtime.sendMessage({from:'option',type:'sync',userInfo:telanx.userInfo});
				Ext.checkUpdate(telanx.userInfo);
				Ext.fillData(RR);
				Ext.loadDomain();
			})
		});
		
		//事件
		//添加域名
	$('input[name=domain]').keydown(function(e){
		if(e.keyCode==13)e.preventDefault();
	});
	$('input[name=domain]').keyup(function(e){
		
		if(e.keyCode==13)Ext.domainAdd();
	})
	$('.btn-domain-add').click(function(e){
			e.preventDefault();
			Ext.domainAdd();
	});
	
	//修改域名(包含删除)
	$('.domains').on('blur','.domain',function(e){
		
		var cDom = $(e.target);
		var newDomain = cDom.html().trim();
		var orignDomain = cDom.attr('data-domain');
		if(newDomain==''){
			
			if(Ext.domainLS({type:'del',domain:orignDomain})){
					Ext.domainPage({type:'del',dom:cDom});
			}
		}else if(newDomain!=orignDomain){
			
			if(Ext.domainLS({type:'modify',domain:orignDomain,newDomain:newDomain})){
					Ext.domainPage({type:'modify',dom:cDom,newDomain:newDomain});
			}else{
					//恢复现场，刷新重新加载数据
					location.reload();
			}
		}
	});
	
	
	//菜单按钮
	$('.list-group-item').click(function(e){
		$('.content').hide();
		$('.list-group-item').removeClass('selected');
		$(e.target).addClass('selected');
		var sp = $(e.target).attr('href');
		if(sp.indexOf('trades')+1){
			//加载订单
			$('.order').show();
			Ext.loadOrder();
		}else if(sp.indexOf('recharge')+1){
			$('.recharge').show();
			Ext.loadDomain();
		}else if(sp.indexOf('contact')+1){
			//加载博客
			$('.contact').show();
			Ext.loadBlog();
		}else if(sp.indexOf('how-to-use')+1){
			$(".how-to-use").show();
		}
	});
	
	$('#dLabel').click(function(){
		$('.dropdown-menu').toggle();
	});
	
	$('.dropdown-menu').mouseleave(function(e){
		$('.dropdown-menu').toggle();
	});
	//登出
	$(".logout").click(function(){
		$.get(telanx.crx.server.ROOT+telanx.crx.server.logoutUrl,function(r){});
		chrome.runtime.sendMessage({from:'option',type:'logout'},function(r){});
		setTimeout(function() {
			location.reload();
		}, 1000);
	});
		
	},
	loadLocalCfg:function(fn){
		chrome.runtime.sendMessage({from:'option',type:'getCrxInfo'},function(r){
			telanx = r;
			if(typeof fn == 'function'){
				fn(r);
			}
		});
	},
	loadRemoteCfg:function(fn){
		$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.userInfoUrl,function(r){
			if(typeof fn == 'function'){
				fn(r);
			}
		});
	},
	fillData:function(d){
			['user','inviteNum'].forEach(function(e){
				$('.'+e).html(d[e]);
			});
			//是否过期
			var f = telanx.userInfo.isExpired;
			if(f){
				$('#isExpired').addClass('btn-danger').html('VIP已过期');
				$('input[name=domain]').attr('disabled',true).attr('placeholder','成为VIP即可使用');
				$('.tip').html('成为VIP即可编辑域名')
			}else if(f == null){
				$('#isExpired').addClass('btn-success').html(d.expireDate);
				$('input[name=domain]').attr('disabled',true).attr('placeholder','成为VIP即可使用');
				$('.tip').html('成为VIP即可编辑域名')
			}else{
				$(".profile .role").removeClass("role-expired").addClass("role-active");
				$('#isExpired').addClass('btn-success').html('正常');
				$('.profile .panel-footer').prepend('<div>'+d.expireDate+'</div>');
			}
			
			//支付链接
			$('.payUrl').attr("hef",telanx.crx.server.ROOT+telanx.crx.server.payUrl);
			
			
			
	},
	loadDomain:function(r){
			//代理列表
			$('.domainList').html("");
			var proxyList = (localStorage['domainList']||'').split(',');
			proxyList.forEach(function(e){
				if(e!=''){
					var f = (telanx.userInfo.isExpired!='0');
					var tmpl ="<div class='col-xs-6'>"+
						"<div class='domain' "+(f?'':'contentEditable=true')+" style='padding:10px 10px;' data-domain='"+e+"'>"+e+"</div>"+
					"</div>";
					$('.domainList').append(tmpl);
				}
			});
	},
	loadOrder:function(){
			//首先清空数据
			$('.order tbody').html("");
			$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.orderListUrl,function(r){
				if(r.length){
					for(var i=0;i<r.length;i++){
						var order = r[i];
						$('.order tbody').append('<tr>'+
						'<td>'+(i+1)+'</td>'+
						'<td>'+order.otime+'</td>'+
						'<td>'+order.pid+'</td>'+
						'<td>'+order.cash+'</td>'+
						'<td>'+order.oid+'</td>'+
						'<td>'+order.remark+'</td>'+
						'</tr>');
						
					}
				}else{
					$('.order tbody').html('<tr><td>暂无任何记录</td></tr>');
				}
			});
	},
	//加载博客
	loadBlog:function(){
		
	},
	domainAdd:function(){
			var newDomain = $('input[name=domain]').val().trim();
			if(newDomain=='')return false;
			//无刷新新增以及同步到localStorage
			
			if(Ext.domainLS({type:'add',domain:newDomain})){
					Ext.domainPage({type:'add',domain:newDomain});
			}
		},
		domainPage:function(obj){
			//页面domain操作
			if(obj.type=='add'){
				//页面添加
				var tmpl ="<div class='col-xs-6'>"+
					"<div class='domain' "+(telanx.userInfo.isExpired?'':'contentEditable=true')+" style='padding:10px 10px;' data-domain='"+obj.domain+"'>"+obj.domain+"</div>"+
				"</div>";
				$('.domainList').prepend(tmpl);
			}else if(obj.type=='del'){
				//页面删除domain
				obj.dom.css('border','solid 2px #428bca').slideUp(500,function(){
					this.parentNode.remove();
				});
			}else if(obj.type=='modify'){
				//页面domain修改,更改原始domian
				obj.dom.attr('data-domain',obj.newDomain);
			}
		},
		domainLS:function(obj){
			//localStorage中domain以及Telanx.local
			var domainList = (localStorage['domainList']||'').split(',');
				domainList = (domainList[0]==''?[]:domainList);
			if(obj.type == 'add'){
				if(domainList.contain(obj.domain)){alert('已经存在该域名，无法添加');return false;}
				domainList.push(obj.domain);
				localStorage['domainList'] = domainList.join(',');
			}else if(obj.type=='del'){
				if(!domainList.contain(obj.domain)){alert('不存在该域名，无法删除');return false;}
				$.each(domainList,function(i,e){
					if(e == obj.domain){
						domainList.splice(i,1);
						localStorage['domainList'] = domainList.join(',');
						return false;
					}
				});
				
			}else if(obj.type=='modify'){
				console.log(obj);
				if(domainList.contain(obj.domain)==false){alert('不存在该域名，无法修改!');return false;}
				if(domainList.contain(obj.newDomain)){alert('已存在该域名，无法修改！');return false;}
				$.each(domainList,function(i,e){
					if(e == obj.domain){
						domainList[i] = obj.newDomain;
						localStorage['domainList'] = domainList.join(',');
						return false;
					}
				});
			}
			
			return true;
		}
	
};

$(function(){
	Ext.init();
});

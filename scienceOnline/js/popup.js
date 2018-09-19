Array.prototype.contain = function(v){
		if(this.length==0)return false;
		for(var i=this.length-1;i>=0;i--){
			if(this[i] == v)return true;
		}
		return false;
}
function fixNum(n) {
	return n > 9 ? n : '0' + n;
}
function parseTime(t) {
	var h,m,s;
	h = Math.floor(t/3600);
	m = Math.floor((t - 3600 * h)/60);
	s = t%60;
	return fixNum(h) + ':' + fixNum(m) + ':' + fixNum(s);
}

function updateLeftTime() {
	leftT -= 1;
	if (leftT <= 0) {
		clearInterval(timer);
	}
	$('.leftTime').html(parseTime(leftT));
}

var flagMap = {'jp':'日本','us':'美国','en':'英国','kr':'韩国','hk':'香港','mc':'澳门','sg':'新加坡','tw':'台湾','ca':'加拿大'};
var statusMap = {'ZC':{zh:'正常',cls:'btn-success'},'YJ':{zh:'拥挤',cls:'btn-warning'},'TZ':{zh:'停止',cls:'disabled'}};
var proxyList = {};
var currentProxy;
var telanx;
var leftT = 0, timer;
var Ext = {
	loadProxyList:function(list,currentProxy) {
		console.log(list);
		var dom = $(".table tbody");
		dom.html("");
		
		for(var i=0;i<list.length;i++){
			var lt = list[i];
			var css = (lt.id===currentProxy.id?"selected":"");
			dom.append('<tr class="proxy '+css+'">'
						 +'<td class="proxyname" data-id='+lt.id+'>'+lt.name+'</td>'
						 +'<td>'
						 +'<div class="flag"><img src="/img/flags/'+lt.country+'.png"></div>'
						 +'<div class="ip" hidden>'+lt.ip+'</div>'
						 +'<div class="port" hidden>'+lt.port+'</div>'
						 +'<div class="type" hidden>'+lt.type+'</div>'
						 +'<div class="spcode" hidden>'+lt.spcode+'</div>'
						 +'<div class="up" hidden>'+lt.up+'</div>'
						 +'<div class="locate" code='+lt.country+'><!--'+flagMap[lt.country]+'--></div>'
						 +'</td>'
						 +'<td><button class="btn btn-xs '+statusMap[lt.status].cls+'">'+statusMap[lt.status].zh+'</button></td>'
					 +'</tr>');
		}
	},
	loadCurrentProxy:function(currentProxy){
		if(currentProxy.id!=undefined){
			$(".node").find("img").attr("src","/img/flags/"+currentProxy.country+".png");
			$(".node").find(".locate").text(flagMap[currentProxy.country]);
		}else{
			$(".node").html("当前无任何可用服务！");
		}
	},
	getLeastUsedProxy:function(proxyList,fields){
		var len = proxyList.length;
		var minNum = 100000;
		var index = 0;
		var leastUsedProxy;
		var rs = {};
		leastUsedProxy = proxyList[index];
		for(i=0;i<fields.length;i++){
			rs[fields[i]] = leastUsedProxy[fields[i]];
		}
		return rs;
	},
	switchToProxy:function(proxy,fn){
		chrome.runtime.sendMessage({
				from:'popup',
				type:'switchProxy',
				spcode: proxy.spcode,
				up: proxy.up
		},function(r){
			fn();
		});
	},
	report:function(type, pid){
		//type = enum {"add","del"}
	}
}
$(function(){
	var popup = (new Popup()).getInstance();
	currentProxy = JSON.parse(localStorage['currentProxy']||'{}');
	//获取当前网址信息
	chrome.extension.sendMessage({from:'popup',type:'query'},function(r){
		$('.mask').hide();
		$(".qw-header").html(r.crx.client.appName);
		
		r={"page":{"active":true,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"https://www.baidu.com/favicon.ico","height":947,"highlighted":true,"id":32,"incognito":false,"index":6,"mutedInfo":{"muted":false},"pinned":false,"selected":true,"status":"complete","title":"谷歌_百度搜索","url":"https://www.baidu.com/s?ie=UTF-8&wd=%E8%B0%B7%E6%AD%8C","width":1920,"windowId":1},"crx":{"server":{"defaultHost":"telanx.gotoip1.com","HOST":"http://telanx.gotoip1.com","APP":"qwt","ROOT":"http://telanx.gotoip1.com/qwt/index.php","PROXY":"45.79.92.94","PORT":"25","userInfoUrl":"/Home/Crx/getInfo","regUrl":"/Home/User/regRS","getProxyListUrl":"/Home/Crx/getProxyList","checkUserUrl":"/Home/User/userExists","loginUrl":"/Home/User/loginRS","verifycodeUrl":"/Home/User/verifycode","orderListUrl":"/Home/Crx/orderList","payUrl":"/Home/User/pay","userUrl":"/Home/User/index","logoutUrl":"/Home/User/logout","getTrial":"/Home/Crx/getTrial"},"client":{"appName":"蔷薇","version":"4.1","logo":"/img/logo.png","logo2":"/img/logo2.png","kfs":[{"name":"Telanx","qq":"1241818518"}],"regUrl":"/reg.html","indexUrl":"/index.html","loginUrl":"/login.html","optionsUrl":"/options.html","tip":"如有问题，请联系客服QQ1241818518"},"index":{},"login":{},"reg":{},"options":{},"try":{"status":false,"trialTime":1800,"startTime":0}},"mode":"close","userInfo":{"user":"123456","crxName":"蔷薇","crxVersion":"4.4","forceUpdate":"0","updateInfo":"年费会员请联系客服升级到最新版专享服务~","updateUrl":"http://telanx.gotoip1.com/qwt/index.php/Home/User/pay.html","isExpired":null,"expireDate":"2018-09-30","proxyList":null,"xftypes":null}};
		telanx = r;
		proxyList = r.userInfo.proxyList||[];
		for(var i=0;i<proxyList.length;i++){
			if(proxyList[i].id === currentProxy.id){
				currentProxy = {id:proxyList[i].id,ip:proxyList[i].ip,country:proxyList[i].country};
				break;
			}
		}
		if(proxyList.length && !currentProxy.id){
			//没有从本地找到对应的代理服务则自动使用人数最少的代理服务器
			currentProxy = Ext.getLeastUsedProxy(proxyList,['id','ip','country']);
			localStorage['currentProxy'] = JSON.stringify(currentProxy);
		}
		console.log(proxyList);
		Ext.loadProxyList(proxyList,currentProxy);
		Ext.loadCurrentProxy(currentProxy);
		if(localStorage.state==null){
			localStorage.state='close'
		}
		$('.mode-switch[data-id='+localStorage.state+']').addClass('btn-primary');
		
		//alert(JSON.stringify(r))
		$('.settings').addClass("hidden");
		$(".tryTips").removeClass("hidden");
		/*if (r.crx.try.status) {
			// 试用期内
			$('.settings').addClass("hidden");
			$(".tryTips").removeClass("hidden");
			var dt = Math.floor((+new Date() - r.crx.try.startTime)/1000);
			leftT = r.crx.try.trialTime - dt;
			timer = setInterval(updateLeftTime, 1000);
			return false;
		}
		
		if(r.userInfo!=undefined && r.userInfo.isExpired){
			location.href = 'expired.html';
			return false;
		}
		if(r.userInfo!=undefined && r.userInfo.expireDate=='未激活'){
			location.href = 'expired.html';
			return false;
		}
			
			
		//插件服务器不可用，提示公告信息
		if(!r.userInfo || JSON.stringify(r.userInfo)==='{}'){
			$('.mask').show();
			return false;
		}
		//未登录，请先登录插件
		if(r.userInfo.user==null){
			window.open('options.html');
			return false;
		}	*/
	});
	
		// 一些事件侦听
		$('.mode-switch').click(function(e){
			var d = e.target;
			chrome.runtime.sendMessage({from:'popup',type:'mode',v:$(d).attr('data-id')},function(r){
				if(r.rs){
					$('.mode-switch').removeClass('btn-primary');
					$(d).addClass('btn-primary');
					//按钮状态
					localStorage.state=$(d).attr('data-id');
				}else{
					popup.showTip(r.msg);
				}
			});
		});
		
		$(".node").click(function(){
			$("#slidepage").animate({marginLeft:'-250px'});
			var proxyMsg = '正在获取节点信息...';
			$('.proxyStatus .status').html(proxyMsg);
			popup.showTip(proxyMsg);
			console.log(telanx.rcfg);
			$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.getProxyListUrl,function(r){
				popup.hideTip();
				if(typeof r == 'object'){
					$('.proxyStatus .status').html("获取成功！");
					Ext.loadProxyList(r||[],currentProxy);
				}
			});
		});
		//更新节点信息
		$(".refresh").click(function(){
			var proxyMsg = '正在获取节点信息...';
			$('.proxyStatus .status').html(proxyMsg);
			popup.showTip(proxyMsg);
			console.log(telanx.rcfg);
			$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.getProxyListUrl,function(r){
				popup.hideTip();
				if(typeof r == 'object'){
					$('.proxyStatus .status').html("获取成功！");
					Ext.loadProxyList(r||[],currentProxy);
				}
			});
		});
		$(".backhome").click(function(){
			$("#slidepage").animate({marginLeft:'0px'});
		});
		
		//切换节点
		$(".nodelist").on("click",".proxy",function(e){
			var proxyName = $(this).find(".proxyname").text();
			var proxyId = $(this).children(":eq(0)").attr("data-id").replace("#","");
			var ip = $(this).find(".ip").text();
			var country = $(this).find(".locate").attr("code");
			var type = $(this).find(".type").text();
			var port = $(this).find(".port").text();
			var spcode = $(this).find(".spcode").text();
			var up = $(this).find(".up").text();
			$(".proxyStatus>.status").html("正在切换至"+proxyName+"...");
			popup.showTip("正在切换节点");
			var _this = this;
			Ext.switchToProxy({
				spcode: spcode ? spcode : (type+' '+ip+':'+port),
				up: up
			},function(){
				popup.hideTip();
				currentProxy = {id:proxyId,ip:ip,country:country};
				localStorage['currentProxy'] = JSON.stringify(currentProxy);
				Ext.loadCurrentProxy(currentProxy);
				//成功
				
				$(".proxyStatus>.status").html("已经切换至"+proxyName);
				//Ext.report(proxyId);
				
				$(".proxy").removeClass("selected");
				$(_this).addClass("selected");
			});
			
			
			//每次切换节点时自动上报到服务器，以获取各个代理服务器实时使用人数
		});
});


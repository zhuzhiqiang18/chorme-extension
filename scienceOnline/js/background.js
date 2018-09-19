/*
定义好切换规则以及消息原因
*/
var AUTH = {
	username: '',
	password: ''
};

Array.prototype.contain = function(v){
	if(this.length==0)return false;
	for(var i=this.length-1;i>=0;i--){
		if(this[i] == v)return true;
	}
	return false;
}

function notify(title="提示", msg="Hello") {
	if(window.webkitNotifications){  
		var notification = window.webkitNotifications.createNotification(  
			'img/logo.png',  // icon url - can be relative  
			title,  // notification title  
			msg  // notification body text  
		);  
		notification.show();          
	}else if(chrome.notifications){  
		var opt = {  
			type: 'basic',  
			title, 
			message: msg,  
			iconUrl: 'img/logo.png',  
		}  
		chrome.notifications.create('', opt, function(id){
		});  
	  
	}
}

//原则，一些配置存放在localstorage中，每次只更新localstorage,不同步到内存中

var Crx = {
	server:{
		defaultHost:'telanx.gotoip1.com',
		HOST:'http://telanx.gotoip1.com',
		APP:'qwt',
		ROOT:'http://telanx.gotoip1.com/qwt/index.php',
		PROXY:'45.79.92.94',
		PORT:'25',
		userInfoUrl:'/Home/Crx/getInfo',
		regUrl:'/Home/User/regRS',
		getProxyListUrl:'/Home/Crx/getProxyList',
		checkUserUrl:'/Home/User/userExists',
		loginUrl:'/Home/User/loginRS',
		verifycodeUrl:'/Home/User/verifycode',
		orderListUrl:'/Home/Crx/orderList',
		payUrl:'/Home/User/pay',
		userUrl:'/Home/User/index',
		logoutUrl:'/Home/User/logout',
		getTrial: '/Home/Crx/getTrial'
	},
	client:{
		appName:'蔷薇',
		version:'4.1',
		logo:'/img/logo.png',
		logo2:'/img/logo2.png',
		kfs:[{name:"Telanx",qq:"1241818518"}],
		regUrl:'/reg.html',
		indexUrl:'/index.html',
		loginUrl:'/login.html',
		optionsUrl:'/options.html',
		tip:'如有问题，请联系客服QQ1241818518',
		
	},
	index:{
		
	},
	login:{
		
	},
	reg:{
		
	},
	options:{
		
	},
	try: {
		status: false,
		// 试用时长，单位s
		trialTime: 30*60,
		startTime: 0
	}
};
//当前信息
var telanx = {};

//扩展函数
var Ext = {
	checkInitialInstall:function(){
		if(!localStorage['firstInstall']){
			localStorage['firstInstall'] = 1;
			window.open("/try.html");
		}
	},
	tryLogin:function(fn) {
		//IP和上次一样则自动登录否则不自动登录
		try{
			var account = JSON.parse(localStorage['account']||'[{}]')[0];
			$.post(telanx.crx.server.ROOT+telanx.crx.server.loginUrl,account,function(r){
				// 更新同步登陆信息
				Ext.ls.set('account','[{"user":"'+request.data.user+'","pwd":"'+request.data.pwd+'"}]');
				//重新加载远程状态
				fn();
			});
		}catch(e){
			fn();
		}
	},
	init:function(){
		var account = JSON.parse(localStorage['account']||'[{"user":"1","pwd":"1"}]')[0];
		AUTH.username = account.user;
		AUTH.password = account.pwd;
		//加载本地配置>加载远程配置>应用本地配置到插件
		var _this = this;
		_this.checkInitialInstall();
		_this.loadLocalCFG(function(){
			
			_this.updateProxy({proxyAllow:false,mode:'close'});
			
			_this.loadRemoteCFG(function(){
						Ext.ls.set("mode","close");
						//如果未登录则尝试登录
						if(telanx.userInfo && !telanx.userInfo.user){
							_this.tryLogin(_this.loadRemoteCFG);
						}
			});
			
		});
	},
	startProxy() {
		Ext.ls.set('mode', 'always');
		Ext.updateProxy();
		notify("消息提示", "已经成功启用了代理！可以愉快的上网了~");
		setTimeout(function() {
			window.open("https://www.google.com");
		}, 2500);
	},
	stopProxy() {
		// 恢复原始数据
		Ext.ls.set('mode', 'close');
		Ext.updateProxy();
		notify("消息提示", "试用已过期，如需继续使用，请联系客服充值~");
	},
	loadLocalCFG:function(callback){
		telanx.crx = Crx;
		if(callback)callback();
	},
	loadRemoteCFG:function(callback){
		telanx.userInfo = {};
		$.getJSON(telanx.crx.server.ROOT+telanx.crx.server.userInfoUrl,function(r){
					telanx.userInfo = r;
					if(callback)callback();
		});
	},
	updateProxy:function(obj){
		//先加载本地配置，然后替换传递参数应用到代理
		var currentProxyId = JSON.parse(localStorage['currentProxy']||'{}').id || 99999;
		// 从列表中读取当前的代理，找不到的话，就默认选取第一条
		obj = obj || findProxyById(telanx.userInfo.proxyList, currentProxyId);
		var proxyIP = 'PROXY '+ telanx.crx.server.PROXY +':'+telanx.crx.server.PORT;
		var proxy ={
			SERVER: proxyIP,
			proxyAllow:!(telanx.userInfo?telanx.userInfo.isExpired:true),
			domainList:localStorage['domainList']||'',
			mode:(localStorage['mode']||'close'),
			mapping:{'rules':1,'always':2,'close':0}
		};
		//替换参数
		for(var k in obj){proxy[k] = obj[k];}
		var config = {
					mode: "pac_script",
					pacScript: {
					data:"function FindProxyForURL(url,host){"+
					"if(host.split('.').length<2 || host=='"+Crx.server.defaultHost+"')return 'DIRECT';"+
					"var domainList = '"+proxy.domainList+","+telanx.defaultHost+"';"+
					"var domainFilter = domainList.split(',');"+
					"if(((domainFilter.indexOf(host)+1) && "+proxy.proxyAllow+" && ("+proxy.mapping[proxy.mode]+"==1))|| ("+proxy.mapping[proxy.mode]+"==2))"+
					"return '"+proxy.SERVER+"';"+
					"else return 'DIRECT';"+
					"}"
					}
			};
		chrome.proxy.settings.set({value: config, scope: 'regular'},function(){
			console.log('代理已经更新！');
			// 同步更新本地的localStorage
		});
	
	},
	//localstorage管理
	ls:{
		get:function(k){
			return localStorage[k]||'';
		},
		set:function(k,v){
			localStorage[k] = v;
			//每次有更改即更新代理设置
			Ext.updateProxy();
		}
	},
	browser:{
		set:function(url){
			chrome.browserAction.setIcon({path: {'19':url}});
		}
	},
	tab:{
		getInfo:function(id){
			chrome.tabs.get(id.tabId||id,function(tb){
				var domainList = localStorage['domainList']||'';
				var domainFilter = domainList.split(',');
				var mode = localStorage['mode']||'close';
				//分三类always auto close
				var map  ={
					'rules':1,
					'always':2,
					'close':0
				};
				var url = tb.url;
				telanx.page = tb;
				var host = url.split('/')[2];
				if((domainFilter.indexOf(host)+1)&&map[mode]==1 || map[mode]==2){
					path = telanx.crx.client.logo;
				}else {
					path = telanx.crx.client.logo2;
				}
				Ext.browser.set(path);
			});
		}
	}
};



//消息处理
var msgHandler = {
	'popup':function(request,sendResponse){
		if(request.type=='query'){
			sendResponse({page:telanx.page,crx:telanx.crx,mode:(Ext.ls.get('mode')||'close'),userInfo:telanx.userInfo});
		}else if(request.type=='domain'){
			var host = request.v;
			var dl = Ext.ls.get('domainList').split(',');
			dl = (dl[0]==''?[]:dl);
			if(dl.contain(host)){
			//删除
				for(var i=dl.length-1;i>=0;i--){
					if(dl[i]==host){
						dl.splice(i,1);
					}
					if(i==0){
						Ext.ls.set('domainList',dl.toString());
					}
				}
			}else {
				//新增
				dl.push(host);
				console.log(dl);
				Ext.ls.set('domainList',dl.toString());
			}
		}else if(request.type=='mode'){
			//判断用户状态
			var rs = 1;
				var mode = request.v;
				Ext.ls.set('mode',mode);
				Ext.updateProxy();
			sendResponse({from:'background',type:'mode',rs:rs,msg:'账号已过期无法切换'});
		}else if(request.type=='switchProxy'){
			var proxyServer = request.spcode;
			if (request.up.trim() != '') {
				updateAuth(request.up);
			}
			Ext.updateProxy({SERVER:proxyServer});
			sendResponse({from:'background',type:'switchProxy',result:'OK'});
		}	
	},
	'login':function(request,sendResponse){
		Ext.ls.set('mode','close');
		Ext.updateProxy();
		if(request.type=='user'){
				//存储账号密码
				console.log('记住密码');
				Ext.ls.set('account','[{"user":"'+request.data.user+'","pwd":"'+request.data.pwd+'"}]');
				//重新加载远程状态
				Ext.loadRemoteCFG();
		}else if(request.type === 'getCrxInfo'){
			sendResponse(telanx);
		}
	},
	//来自过期界面的消息
	'expired':function(request, sendResponse){
		var type = request.type;
		if(type === 'getCrxInfo') {
			sendResponse({crx:telanx.crx,userInfo:telanx.userInfo});
		} else if(type === 'disconnect') {
			Ext.ls.set('mode','close');
			Ext.updateProxy();
		}
	},
	//监听来自option的消息
	'option':function(request,sendResponse){
		if(request.type === 'getCrxInfo') {
			sendResponse({crx:telanx.crx, userInfo:telanx.userInfo});
		}else if(request.type === 'sync') {
			var r = request.userInfo;
			for(var i in r){
				telanx.userInfo[i] = r[i];
			}
		} else if (request.type === 'logout') {
			telanx.userInfo = {};
		}
	},
	//监听来自contentscript的消息
	'contentscript':function(request,sendResponse){
		
	},
	'index':function(request,sendResponse){
		if(request.type == 'getCrxInfo'){
			console.log('发送Telanx');
			sendResponse(telanx);
		}
	},
	//公共
	'reg':function(request,sendResponse){
		if(request.type=='getCrxInfo'){
			sendResponse(telanx);
		}
	},
	// 试用
	'try': function(request, sendResponse) {
		if (request.proxyList) {
			Object.assign(telanx.userInfo, {
				proxyList: request.proxyList
			});
		}
		sendResponse({});
		Crx.try.status = true;
		Crx.try.startTime = +new Date();
		Ext.startProxy();
		setTimeout(function() {
			Ext.stopProxy();
			Crx.try.status = false;
		}, 1000 * request.t);
	}
};

//消息侦听
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	msgHandler[request.from](request,sendResponse);
});

//页面变动
chrome.tabs.onUpdated.addListener(function(id,changeInfo,tab){
	Ext.tab.getInfo(id);
});
chrome.tabs.onActivated.addListener(function(id){
	Ext.tab.getInfo(id);
});


function updateAuth(up) {
	var u,p;
	if (typeof up === 'string') {
		var mid = Number(up.slice(-2));
		u = up.slice(0, mid);
		p = up.slice(mid, -2);
		AUTH.username = u;
		AUTH.password = p;
	}
}

// 根据id超找对应的代理服务器
function findProxyById(proxyList, id) {
	if (!Array.isArray(proxyList)) {
		return false;
	}
	var len = proxyList.length;
	var filterProxyList = proxyList.filter(p => p.id == id);
	var index = 0;
	var leastUsedProxy;
	var rs = {};
	leastUsedProxy = proxyList[index];
	if (filterProxyList.length) {
		leastUsedProxy = filterProxyList[0];
	}
	fields = ['id','ip','country'];
	for(i=0;i<fields.length;i++){
		rs[fields[i]] = leastUsedProxy[fields[i]];
	}
	rs['SERVER'] = leastUsedProxy.spcode;
	return rs;
	
}

chrome.webRequest.onAuthRequired.addListener(function(status){
	  return {authCredentials: AUTH};
	}, {urls: ["<all_urls>"]}, ["blocking"]);
chrome.webRequest.onHeadersReceived.addListener(function(details){
	console.log(details);
	if(details.responseHeaders.length>=11){
		console.log(details.responseHeaders[5]['name']);
		if(details.responseHeaders[5]['name']=='X-Squid-Error'){
			var id = chrome.i18n.getMessage("@@extension_id");
			return {redirectUrl:'chrome-extension://'+id+'/options.html'};
		}
	}
}, {urls: ["<all_urls>"]},["blocking", "responseHeaders"]);

//入口初始化
Ext.init();
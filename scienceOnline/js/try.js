var telanx = {};
var timer;
var leftT = 0;
function getTrial(fn) {
	$.get(telanx.crx.server.ROOT + telanx.crx.server.getTrial, r => {
		fn(r);
	});
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

$(function() {
	chrome.runtime.sendMessage({from:'login',type:'getCrxInfo'},function(r){
		var appName = r.crx.client.appName;
		telanx = r;
		leftT = r.crx.try.trialTime;
		$('.heading>.title').html(appName);
	});
	
	$('.btn-try').click((e) => {
		$('.icon-loading').removeClass('hidden');
		$('.btn-try').attr("disabled", "disabled");
		getTrial(res => {
			$('.untry').addClass("hidden");
			$('.tried').removeClass("hidden");
			if (res.trial) {
				$('.tryTips').removeClass('hidden');
			} else {
				$('.endTips').removeClass('hidden');
				return false;
			}
			// 开始试用
			chrome.runtime.sendMessage({ from: 'try', t: leftT, proxyList: res.proxyList }, function () {
				timer = setInterval(updateLeftTime, 1000);
			});
		})
	});
});
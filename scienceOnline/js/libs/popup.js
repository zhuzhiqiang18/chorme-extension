;(function(W){
	 W.Popup = function() {
		var single;
		function constructor() {
			$("body").append("<div id='mask_TELANX' style='position:fixed;top:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;'>"
						+ "<div class='container-popup' style='position:relative;width:300px;display:none'>"
						+ "<div class='popup-title' style='width:100%;height: 38px;color:#fff;padding:0 10px;line-height: 38px;position: relative;z-index:99999;background:rgb(51,51,51);background: -webkit-gradient(linear,left top,right top,from(#000),to(#767676));border-bottom: 1px solid #d1d6dd;'>"
						+ "<span class='popup-title-text'>标题</span>"
						+ "<span class='popup-title-close icon-times' style='float:right;cursor:pointer;'></span>"
						+ "</div>"
						+ "<div class='popup-body' style='background:#fff;color:#000;height:100%;min-height:100px;padding:10px'>"
						+ "</div>"
						+ "</div>"
						+ "</div>"
						+ "<div id='tip_TELANX' style='position:fixed;top:45%;width:200px;color:#fff;height:50px;text-align:center;left:25px;line-height:50px;background:rgba(0,0,0,0.6);display:none'></div>"
						);
			var mask = $('#mask_TELANX'),
					container = mask.children(".container-popup"),
					title =  mask.find('.popup-title-text'),
					body = mask.find('.popup-body');
					tip = $("#tip_TELANX");
			container.find('.popup-title-close').bind('click',function(e){mask.hide();restoreSize();});
			container.on('click','.popup-btn-cancel',function(e){restoreSize();mask.hide();});
			
			
			function showTip(str){
				tip.html(str);
				tip.show();
				return this;
			}
			function hideTip(){
				tip.hide();
			}
			function setTitle(str){
				console.log(title);
				title.html(str);
				return this;
			}
			function setBody(str){
				body.html(str);return this;
			}
			function append(str){
				body.append(str);
				return this;
			}	
			function setCss(obj){
				container.css(obj);
				return this;
			}
			function setBodyCss(obj){
				body.css(obj);
				return this;
			}
			function show(){
				//居中位置
				
				var sH = Number(window.outerHeight)-100;//屏幕可用高度
				var cH = parseInt(container.css('height')||100);
				var mH = Math.abs(sH-100-cH);
				container.css({
					'margin':'auto',
					'margin-top':(mH/2)+'px'
				});
				container.show();
				mask.show();
				return this;
			}
			function hide(t){
				var delay = parseInt(t);
				mask.fadeOut();
				return this;
			}
			function restoreSize() {
				container.css({width:'300px',height:'150px'});
				return this;
			}
			function destroy() {
				single = null;
			}
			
		return {
			mask:mask,
			container:container,
			body:body,
			showTip:showTip,
			hideTip:hideTip,
			setTitle:setTitle,
			setBody:setBody,
			setCss:setCss,
			setBodyCss:setBodyCss,
			append:append,
			show:show,
			hide:hide,
			destroy:destroy,
			restoreSize:restoreSize
			}
		}
		
		function getInstance() {
			if(single == undefined) {
				single = new constructor();
			}
			return single;
		}
		
		
		return {
			getInstance: getInstance
		}
	}
})(window);
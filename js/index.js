/*入口*/
$(function(){
	$(".topNavLists li").click(function(){
		var index = $(this).index();
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
		if(index == 0){
			$("#platformStartUpWindow").show();
			$("#rightPannel").hide();
		}else if(index == 1){
			$("#platformStartUpWindow").hide();
			$("#rightPannel").show();
			$(".basisInfoMenu").show();
			$(".sliderMenu").hide();
			$(".accidentBackMenu").hide();
			$(".emergencyMenu").hide();
			$('.dynamicMenu').hide();
		}else if(index == 2){
			$("#platformStartUpWindow").hide();
			$("#rightPannel").show();
			$(".basisInfoMenu").hide();
			$(".sliderMenu").hide();
			$(".accidentBackMenu").show();
			$(".emergencyMenu").hide();
			$('.dynamicMenu').hide();
		}else if (index == 3) {
			$("#platformStartUpWindow").hide();
			$("#rightPannel").show();
			$(".basisInfoMenu").hide();
			$(".sliderMenu").show();
			$(".accidentBackMenu").hide();
			$(".emergencyMenu").hide();
			$('.dynamicMenu').hide();
		}else if (index == 4) {
			$("#platformStartUpWindow").hide();
			$("#rightPannel").show();
			$(".basisInfoMenu").hide();
			$(".sliderMenu").hide();
			$(".accidentBackMenu").hide();
			$(".emergencyMenu").show();
			$('.dynamicMenu').hide();
		} else if (index == 5) {
			$("#platformStartUpWindow").hide();
			$("#rightPannel").show();
			$(".basisInfoMenu").hide();
			$(".sliderMenu").hide();
			$(".accidentBackMenu").hide();
			$(".emergencyMenu").hide();
			$('.dynamicMenu').show();
		}
	});
	//	默认第一个平台启动被选中
	$(".topNavLists li").eq(0).click();
	$(".comStartUp").click(function(){
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});
//	面板折叠事件
	var fold = true;
	$("#foldBtn").click(function(){
		if(fold){
			$(this).addClass("active");
			$("#rightPannel").animate({"right":"-300px"});
			fold = false;
		}else{
			$(this).removeClass("active");
			$("#rightPannel").animate({"right":0});
			fold = true;
		}
	});
//	基础信息菜单点击
	$(".basisInfoMenu ul li").click(function(){
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
	});
	// 基础信息展示
	$("#foldBtn").click(function(){
		$(".isShow").hide();
		$(".isHide").hide();
	});
	$("#ul>li").click(function(){
		$(".isShow").show();
		let index = $(this).index();
		$(".isShow>div").eq(index).show().siblings().hide();
		$(".isShow>p").show();
	});
	$(".isShow>p").click(function(){
		$(".isShow").hide();
	});
	// 事故溯源展示
	$(".myItem>.a").click(function(){
		$(".isHide").show();
		$(".isHide>div").eq(0).show().siblings().hide();
		$(".isHide>p").show();
	});
	$(".myItem>.b").click(function () {
		$("isHide").show();
		$(".isHide>div").eq(1).show().siblings().hide();
		$(".isHide>p").show();
	});
	$(".isHide>p").click(function () {
		$(".isHide").hide();
	});
	$(".topNavLists>li").eq(2).click(function(){
		$(".isShow").hide();
	});
	$(".topNavLists>li").eq(1).click(function () {
		$(".isHide").hide();
	});
	$(".topNavLists>li").eq(3).click(function () {
		$(".isHide").hide();
		$(".isShow").hide();
	});
	$(".topNavLists>li").eq(4).click(function () {
		$(".isHide").hide();
		$(".isShow").hide();
	});
	$(".topNavLists>li").eq(5).click(function () {
		$(".isHide").hide();
		$(".isShow").hide();
	});
})
//打开窗口
function openWindow(title,src) {
    var mylayer = layer.open({
        type: 2,
        title: title,
        closeBtn: 1,
        maxmin:false,
        area: ["880px", "400px"],
        offset: ['50px', '300px'],
        shade: 0.2,
        shadeClose:false,
        offset:'center',
        content: src,
        success: function (index) {
            //  layer.close(index);
        }
    })
}
/*	提示信息框
	是否需要更新信息
*/
//promptTipsInfo('是否需要更新');
function promptTipsInfo(title) {
    var mylayer=layer.open({
        type: 1,
        title:"",
        closeBtn:0,
        shade: 0.2,
        area:["300px","180px"],
//      time:"1000",
        content:"<div class='subContent'>" +
        "<p class='onlyPrompt'>是否需要更新?</p></div>",
		btn: ['确定','取消']
    })
}

// 专家信息

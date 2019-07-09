/**
 * Created by Administrator on 2019/5/26.
 */
//字体适配
//$('html').fontFlex(12, 20, 114);
$(function(){
    //根据屏幕高度获取main的高度
    var MainHeight = document.body.scrollHeight - 90 + "px";
    $("#main").css('height',MainHeight);
    //layUI
    layui.use(['element', 'layer'], function(){
        var element = layui.element;
        var layer = layui.layer;
        //监听折叠
        element.on('collapse(test)', function(data){
            layer.msg('展开状态：'+ data.show);
            alert(111)
        });
    });
    // 1级目录点击
    $(".myItem h2").click(function(){
        $("div.rightLayerPanel *").not(this).each(function() { // "*"表示div.content下的所有元素
            $(this).removeClass("layActive");
        });
        $(this).addClass("layActive")
    });
    // 3级目录点击
    $(".myInner").click(function(){
        $(this).addClass("layActive").siblings().removeClass("layActive");
        $(".myItem h2").removeClass("layActive");
    });
    //$('.rightControlImg').click(function(){
    //     $('.rightPanel').toggleClass('rightSoh')
    //})
});
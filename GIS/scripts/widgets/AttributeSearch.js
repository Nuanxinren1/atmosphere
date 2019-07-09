define([
"dojo/_base/declare"
, "dojo/_base/lang"
, "esri/request"
, "dojo/dom"
, "widgets/Tool"
, "esri/tasks/query"
, "esri/tasks/QueryTask"
, "esri/layers/GraphicsLayer"
, "esri/symbols/SimpleFillSymbol"
, "esri/symbols/PictureMarkerSymbol"
, "esri/symbols/SimpleLineSymbol"
, "esri/graphic"
, "esri/config"
]
, function (declare, lang, esriRequest, dom, Tool, Query, QueryTask, GraphicsLayer, SimpleFillSymbol, PictureMarkerSymbol, SimpleLineSymbol, Graphic, config) {

    var map = null;
    var pointGraphicsLayer = null;
    var polylineGraphicsLayer = null;
    var polygonGraphicsLayer = null;

    //点高亮
    var pointHighlightSymbol = null;
    //点结果
    var pointSymbl = null;

    //线高亮
    var polylineHlightSymbol = null;
    var polylineSymbol = null;
    //先结果

    //面高亮
    var polygonHlightSymbol = null;
    //面结果
    var polygonSymbol = null;

    declare("widgets.AttributeSearch", null, {
        map: null,
        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;

            //设置面高亮样式
            if (polygonHlightSymbol == null) {
                polygonHlightSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([125, 125, 125, 0.35]));
            }
            //设置面结果样式
            if (polygonSymbol == null) {
                polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255, 0.35]), 1), new dojo.Color([125, 125, 125, 0.35]));
            }


            //设置点高亮样式
            if (pointHighlightSymbol == null) {
                pointHighlightSymbol = esri.symbol.PictureMarkerSymbol({ "url": config.defaultImageUrl + "/image/attributeSearch/point_red_small.png", "height": 24, "width": 15, "yoffset": 12, "type": "esriPMS" });
            }
            //设置点结果样式
            if (pointSymbl == null) {
                pointSymbl = esri.symbol.PictureMarkerSymbol({ "url": config.defaultImageUrl + "/image/attributeSearch/point_blue_small.png", "height": 24, "width": 15, "yoffset": 12, "type": "esriPMS" });
            }

            //设置线高亮样式
            if (polylineHlightSymbol == null) {
                polylineHlightSymbol = esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 4);
            }
            //设置线结果样式
            if (polylineSymbol == null) {
                polylineSymbol = esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 4);
            }

        },
        search: function (searchText, layerIDArray) {
            if (dojo.trim(searchText) == "") {
                alert("查询条件不能为空");
                return;
            }
             
            if (map != null) {
                Tool.clearMapAllGraphicsLayer(map);
                polygonGraphicsLayer = new esri.layers.GraphicsLayer();
                map.addLayer(polygonGraphicsLayer);
                polylineGraphicsLayer = new esri.layers.GraphicsLayer();
                map.addLayer(polylineGraphicsLayer);
                pointGraphicsLayer = new esri.layers.GraphicsLayer();
                map.addLayer(pointGraphicsLayer);
            }
            var query = new esri.tasks.Query();
            //需要返回Geometry
            query.returnGeometry = true;
            //需要返回的字段
            query.outFields = ["*"];
            //查询条件
            query.where = "NAME like '%" + dojo.trim(searchText) + "%'";
            //设置infoWindow的尺寸
            map.infoWindow.resize(245, 125);
            var layerUrls = new Array();
            for (var i = 0; i < layerIDArray.length; i++) {
                layerUrls.push(config.defaultMapServerUrl + "/" + layerIDArray[i]);
            }
            for (var i = 0; i < layerUrls.length; i++) {
                var queryTask = new QueryTask(layerUrls[i]);
                queryTask.execute(query, showResults);
            }

        }
    });
    //高亮显示查询结果
    function showResults(results) {
        //遍历查询结果
        for (var i = 0; i < results.features.length; i++) {
            var graphic = results.features[i];
            //设置查询到的graphic的显示样式
            var geometryType = graphic.geometry.type;
            switch (geometryType) {

                case "point":
                    graphic.setSymbol(pointSymbl);
                    pointGraphicsLayer.add(graphic);

                    break;
                case "polyline":
                    graphic.setSymbol(polylineSymbol);
                    polylineGraphicsLayer.add(graphic);
                    break;
                case "polygon":
                    graphic.setSymbol(polygonSymbol);
                    polygonGraphicsLayer.add(graphic);
                    break;

            }
        }
        pointGraphicsLayer.on("mouse-over", showTip);
        pointGraphicsLayer.on("mouse-out", hideTip);
        pointGraphicsLayer.on("click", showTip);

        polylineGraphicsLayer.on("mouse-over", showTip);
        polylineGraphicsLayer.on("mouse-out", hideTip);
        polylineGraphicsLayer.on("click", showTip);

        polygonGraphicsLayer.on("mouse-over", showTip);
        polygonGraphicsLayer.on("mouse-out", hideTip);
        polygonGraphicsLayer.on("click", showTip);
    }
    //鼠标移上去事件
    function showTip(evt) {
        // 
        //获取当前graphic的信息内容
        var hgraphic = evt.graphic;

        map.infoWindow.setContent("编号：" + hgraphic.attributes.FID + "</br>名称：" + hgraphic.attributes.NAME);
        map.infoWindow.setTitle(hgraphic.attributes.TEXTLABEL);
        var geometryType = hgraphic.geometry.type;
        switch (geometryType) {
            case "point":
                hgraphic.setSymbol(pointHighlightSymbol);
                break;
            case "polyline":
                hgraphic.setSymbol(polylineHlightSymbol);
                break;
            case "polygon":
                hgraphic.setSymbol(polygonHlightSymbol);
                break;
        }

        map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
    }
    //鼠标移开事件
    function hideTip(evt) {
        // 
        //隐藏infoWindow
        //map.infoWindow.hide();
        //查询结果取消红色高亮显示
        var graphic = evt.graphic;
        var geometryType = graphic.geometry.type;
        switch (geometryType) {

            case "point":
                graphic.setSymbol(pointSymbl);
                break;
            case "polyline":
                graphic.setSymbol(polylineSymbol);
                break;
            case "polygon":
                graphic.setSymbol(polygonSymbol);
                break;
        }
    }
});



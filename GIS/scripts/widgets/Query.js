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
, "esri/toolbars/draw"
, "esri/geometry/normalizeUtils"
, "esri/tasks/GeometryService"
, "esri/tasks/BufferParameters"
, "esri/geometry/Circle"
, "esri/geometry/Point"
, "esri/units"
, "esri/SpatialReference"
, "esri/config"
]
, function (declare, lang, esriRequest, dom, Tool, Query, QueryTask, GraphicsLayer, SimpleFillSymbol, PictureMarkerSymbol, SimpleLineSymbol, Graphic, Draw, normalizeUtils, GeometryService, BufferParameters, Circle, Point, Units, SpatialReference, config) {

    var map = null;
    var draw = null;
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

    var resultArr = [];//存储中间结果
    var count=0;//执行次数
    var searchgeo=null;

    declare("widgets.Query", null, {
        map: null,
        layerUrls: null,
        
        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;
            this.resultByKind = {};
            resultArr = [];
            count=0;//执行次数
            searchgeo = null;
            if (this.map != null) {
                
                polygonGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polygon1" });
                map.addLayer(polygonGraphicsLayer, 0);
                polylineGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polyline1" });
                map.addLayer(polylineGraphicsLayer, 0);

                if (map.getLayer('GL_Widgets_Buffer_point1')) {
                    pointGraphicsLayer = map.getLayer('GL_Widgets_Buffer_point1');
                } else {
                    pointGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_point1" });
                }
                map.addLayer(pointGraphicsLayer);  
            }
        },
        query: function (searchGeometry) {
            searchgeo=searchGeometry;
        	count++;
            var query = new esri.tasks.Query();
            //需要返回Geometry
            query.returnGeometry = true;
            //需要返回的字段
            query.outFields = ["*"];
            //查询条件
            query.geometry = searchGeometry;
            //设置infoWindow的尺寸
            this.layerUrls = this.layerUrlArr || config.defaults.hotLayerList;
            // for (var i = 0; i < layerUrls.length; i++) {
            //     count++;
            //     if (layerUrls[i].layerUrl) {
            //         var queryTask = new QueryTask(layerUrls[i].layerUrl);
                    
            //     }else  {
            //         var queryTask = new QueryTask(layerUrls[i]);
            //     }
            //     queryTask.execute(query, dojo.hitch(this, this.showResults, layerUrls[i],layerUrls.length,count));
            // }
            if (count<this.layerUrls.length+1) {
                
                if (this.layerUrls[count-1].layerUrl) {
                    var queryTask = new QueryTask(this.layerUrls[count-1].layerUrl);
                            
                }else {
                    var queryTask = new QueryTask(this.layerUrls[count-1]);
                }
                queryTask.execute(query);
                queryTask.on('complete',dojo.hitch(this, this.showResults, this.layerUrls[count-1],count-1));
           
           }
        },
        //高亮显示查询结果
        showResults: function (token, index, results) {
            var name = token.name;
            if ( this.resultByKind[name]) {
                this.resultByKind[name] = this.resultByKind[name].concat(results.featureSet.features);
            } else {
                this.resultByKind[name] = results.featureSet.features;
            }
            
            //遍历查询结果
            var picSymbol = esri.symbol.PictureMarkerSymbol({ "url": token.icon, "height": 12, "width": 12, "yoffset": 0, "type": "esriPMS" });
            resultArr=resultArr.concat(results.featureSet.features);
            for (var i = 0; i < results.featureSet.features.length; i++) {
                var graphic = results.featureSet.features[i];
                //设置查询到的graphic的显示样式
                var geometryType = graphic.geometry.type;
                switch (geometryType) {

                    case "point":
                        graphic.setSymbol(picSymbol);
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
            if (index < this.layerUrls.length -1) {
                this.query(searchgeo);
            }
            if (index== this.layerUrls.length-1) {
                //图层查询完成 
                //addBufferResult(resultArr, this.resultByKind);
                //addBufferResult(this.resultByKind);
                this.callback(this.resultByKind);
            }

            if (pointGraphicsLayer != null) {
                pointGraphicsLayer.on("mouse-over", dojo.hitch(this, this.showTip, token));
                pointGraphicsLayer.on("mouse-out", this.hideTip);
                pointGraphicsLayer.on("click", this.showTip);
            }
            //if (polylineGraphicsLayer != null) {
            //    polylineGraphicsLayer.on("mouse-over", this.showTip);
            //    polylineGraphicsLayer.on("mouse-out", this.hideTip);
            //    polylineGraphicsLayer.on("click", this.showTip);
            //}
            //if (polygonGraphicsLayer != null) {
            //    polygonGraphicsLayer.on("mouse-over", this.showTip);
            //    polygonGraphicsLayer.on("mouse-out", this.hideTip);
            //    polygonGraphicsLayer.on("click", this.showTip);
            //}
        },
        //鼠标移上去事件
        showTip: function (token, evt) {
            map.infoWindow.resize(245, 125);
            // 
            //获取当前graphic的信息内容
            var hgraphic = evt.graphic;
            var content = "";
            for (var i = 0; i < token.infoParam.length; i++) {
                var label = token.infoParam[i].label;
                var field = token.infoParam[i].field;
                content += label + (hgraphic.attributes[field]||hgraphic.attributes['regionName']||'') + "</br>";
            }
            //map.infoWindow.setContent("编号：" + hgraphic.attributes.FID + "</br>名称：" + hgraphic.attributes.TEXTLABEL);
            map.infoWindow.setContent(content);
            map.infoWindow.setTitle("详细信息");
            //var geometryType = hgraphic.geometry.type;
            //switch (geometryType) {
            //    case "point":
            //        hgraphic.setSymbol(pointHighlightSymbol);
            //        break;
            //    case "polyline":
            //        hgraphic.setSymbol(polylineHlightSymbol);
            //        break;
            //    case "polygon":
            //        hgraphic.setSymbol(polygonHlightSymbol);
            //        break;
            //}

            map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
        },
        //鼠标移开事件
        hideTip: function (evt) {
            map.infoWindow.resize(245, 125);
            // 
            //隐藏infoWindow
            map.infoWindow.hide();
            //查询结果取消红色高亮显示
            //var graphic = evt.graphic;
            //var geometryType = graphic.geometry.type;
            //switch (geometryType) {

            //    case "point":
            //        graphic.setSymbol(pointSymbl);
            //        break;
            //    case "polyline":
            //        graphic.setSymbol(polylineSymbol);
            //        break;
            //    case "polygon":
            //        graphic.setSymbol(polygonSymbol);
            //        break;
            //}
        }

    });

});
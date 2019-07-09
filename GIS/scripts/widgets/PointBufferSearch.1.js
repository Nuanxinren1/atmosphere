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
    //图形结果
    var drawGraphicsLayer = null;
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

    //图形
    var graph = null;
    //缓冲半径
    var distants = null;
    //点缓冲开始角度
    var startAngle = 0;
    //点缓冲结束角度
    var endAngle = 360;
    //被缓冲图层
    var layerUrls = null;

    declare("widgets.PointBufferSearch", null, {
        map: null,

        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;
            distants = this.distant;
            if (this.startAngle != undefined) {
                startAngle = this.startAngle;
            }
            if (this.endAngle != undefined) {
                endAngle = this.endAngle;
            }
            layerUrls = this.layerUrls;
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
                pointHighlightSymbol = esri.symbol.PictureMarkerSymbol({ "url": "IMG/MapIcons/旅游景点.png", "height": 12, "width": 12, "yoffset": 12, "type": "esriPMS" });
            }
            //设置点结果样式
            if (pointSymbl == null) {
                pointSymbl = esri.symbol.PictureMarkerSymbol({ "url": "IMG/MapIcons/居民小区村庄.png", "height": 12, "width": 12, "yoffset": 12, "type": "esriPMS" });
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
      
        point: function (lon, lat) {
            if (config._isSearching == true) {
                return;
            }
            config._isSearching = true;

            if (map.getLayer("GL_Widgets_Buffer_draw") == null) {
                drawGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_draw" });
                map.addLayer(drawGraphicsLayer, 0);
            }
            drawGraphicsLayer.clear();
            if (map.getLayer("GL_Widgets_Buffer_point") == null) {
                pointGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_point" });
                map.addLayer(pointGraphicsLayer, 1);
            }
            pointGraphicsLayer.clear();
            var point = new Point(lon, lat);
            //doBuffer({ geometry: point });
            //debugger
            this.getSector(point, distants, startAngle, endAngle);
        },
        /**
        * 显示绘制结果
        */
        //doBuffer: function (evt) {
        //    config._isSearching = false;
        //    if (draw != null) {
        //        draw.deactivate();
        //    }
        //    map.setMapCursor("default");
        //    var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
        //    var geometry = evt.geometry;
        //    var searchGeometry;
        //    if (geometry.type === "point") {
        //        var circle = new esri.geometry.Circle({
        //            center: new esri.geometry.Point(geometry.x, geometry.y, map.spatialReference)
        //                    , radius: distants
        //                    , radiusUnit: Units.KILOMETERS
        //                    , spatialReference: map.spatialReference
        //        });
        //        var graphic = new Graphic(circle, sfs);
        //        drawGraphicsLayer.add(graphic);
        //        map.setExtent(circle.getExtent().expand(1.5));
        //        searchGeometry = circle;
        //        require(["dojo/dom", "widgets/Query"], function (dom, Query) {
        //            var query1 = new widgets.Query({ map: map });
        //            query1.query(searchGeometry);
        //        });
        //        //this.query(circle);
        //        //getSector(geometry, distants, startAngle, endAngle);
        //    }
        //    else {
        //        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
        //        var basegraphic = new Graphic(geometry, symbol);
        //        drawGraphicsLayer.add(basegraphic);
        //        var gsvc = new esri.tasks.GeometryService(config.defaults.geometryService);
        //        var params = new esri.tasks.BufferParameters();
        //        params.distances = [distants];
        //        params.bufferSpatialReference = new SpatialReference({ wkid: 102100 });
        //        params.outSpatialReference = map.spatialReference;
        //        params.unit = esri.tasks.GeometryService["UNIT_KILOMETER"];
        //        normalizeUtils.normalizeCentralMeridian([geometry]).then(function (normalizedGeometries) {
        //            params.geometries = [geometry];
        //            var normalizedGeometry = normalizedGeometries[0];
        //            if (normalizedGeometry.type === "polygon") {
        //                gsvc.simplify([normalizedGeometry], function (geometries) {
        //                    params.geometries = geometries;
        //                    gsvc.buffer(params, function (bufferedGeometries) {
        //                        var graphic = new Graphic(bufferedGeometries[0], sfs);
        //                        drawGraphicsLayer.add(graphic);
        //                        map.setExtent(bufferedGeometries[0].getExtent().expand(1.5));
        //                        //this.query(bufferedGeometries[0]);
        //                        searchGeometry = bufferedGeometries[0];
        //                        require(["dojo/dom", "widgets/Query"], function (dom, Query) {
        //                            var query1 = new widgets.Query({ map: map });
        //                            query1.query(searchGeometry);
        //                        });
        //                    });
        //                });
        //            } else {
        //                params.geometries = [normalizedGeometry];
        //                gsvc.buffer(params, function (bufferedGeometries) {
        //                    var graphic = new Graphic(bufferedGeometries[0], sfs);
        //                    drawGraphicsLayer.add(graphic);
        //                    map.setExtent(bufferedGeometries[0].getExtent().expand(1.5));
        //                    //this.query(bufferedGeometries[0]);
        //                    searchGeometry = bufferedGeometries[0];
        //                    require(["dojo/dom", "widgets/Query"], function (dom, Query) {
        //                        var query1 = new widgets.Query({ map: map });
        //                        query1.query(searchGeometry);
        //                    });
        //                });
        //            }

        //        });
        //    }


        //},
        query: function (searchGeometry) {
            var query = new esri.tasks.Query();
            //需要返回Geometry
            query.returnGeometry = true;
            //需要返回的字段
            query.outFields = ["*"];
            //查询条件
            query.geometry = searchGeometry;
            //设置infoWindow的尺寸

         
            for (var i = 0; i < layerUrls.length; i++) {
                var queryTask = new QueryTask(layerUrls[i].layerUrl);
                queryTask.execute(query, dojo.hitch(this, this.showResults, layerUrls[i]));
            }
        },
        //高亮显示查询结果
        showResults: function (token, results) {
            //遍历查询结果
            var picSymbol = esri.symbol.PictureMarkerSymbol({ "url": token.icon, "height": 12, "width": 12, "yoffset": 12, "type": "esriPMS" });

            for (var i = 0; i < results.features.length; i++) {
                var graphic = results.features[i];
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
            if (pointGraphicsLayer != null) {
                pointGraphicsLayer.on("mouse-over", dojo.hitch(this, this.showTip, token));
                pointGraphicsLayer.on("mouse-over", this.showTip);
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
                content += label + hgraphic.attributes[field] + "</br>";
            }
            //map.infoWindow.setContent("编号：" + hgraphic.attributes.FID + "</br>名称：" + hgraphic.attributes.TEXTLABEL);
            map.infoWindow.setContent(content);
            map.infoWindow.setTitle("详细信息");
            //map.infoWindow.setTitle(hgraphic.attributes[token.infoTiledField]);
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
            //            var graphic = evt.graphic;
            //            var geometryType = graphic.geometry.type;
            //            switch (geometryType) {

            //                case "point":
            //                    graphic.setSymbol(pointSymbl);
            //                    break;
            //                case "polyline":
            //                    graphic.setSymbol(polylineSymbol);
            //                    break;
            //                case "polygon":
            //                    graphic.setSymbol(polygonSymbol);
            //                    break;
            //            }
        },

        //扇形绘制---中心点、半径、开始角度、结束角度
        getSector: function (center, radius, startAngle, endAngle) {
            config._isSearching = false;
            drawGraphicsLayer.clear();
            var points = new Array();
            points = this.getPoints(center, radius / 111, Number(startAngle), Number(endAngle), 30);
            var polygon = new esri.geometry.Polygon();
            polygon.rings = [points];
            //polygon.spatialReference = map.spatialReference;
            //var extent = new esri.geometry.Extent(125, 45, 128, 48, map.spatialReference);
            //var polygonJson = {
            //    "rings": [[[125, 45], [125, 48], [128, 45]]], "spatialReference": { "wkid": 4326 }
            //};
            //var polygonJ = new esri.geometry.Polygon(polygonJson);
            var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            var graphic = new Graphic(polygon, sfs);
            drawGraphicsLayer.add(graphic);
            this.query(polygon);
            map.setExtent(polygon.getExtent().expand(1.5)); //所放到该范围
        },
        getPoints: function (center, radius, startAngle, endAngle, pointNum) {
            var sin = 0, cos = 0, x = 0, y = 0, Angle = 0;
            var points = new Array();
            //if (endAngle - startAngle < 360) {
            //    points.push([center.x, center.y]);
            //}
            for (var i = 0; i <= pointNum; i++) {
                Angle = startAngle + (endAngle - startAngle) * i / pointNum;
                sin = Math.sin(Angle * Math.PI / 180);
                cos = Math.cos(Angle * Math.PI / 180);
                x = center.x + radius * sin;
                y = center.y + radius * cos;
                points[i] = [x, y];
            }
            if (endAngle - startAngle < 360) {
                points.unshift([center.x, center.y]);
                points.push([center.x, center.y]);
            }
            return points;
        }
    });

});
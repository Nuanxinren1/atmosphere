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
    var layerUrlArr = null;//查询图层列表
    var callback = null;
   
    declare("widgets.BufferSearch", null, {
        map: null,
        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;
            callback= this.callback;
            distants = this.distant;
            if (this.startAngle != undefined) {
                startAngle = this.startAngle;
            }
            if (this.endAngle != undefined) {
                endAngle = this.endAngle;
            }
            layerUrlArr = this.layerUrls;
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
        
        clear: function () {
            draw.deactivate();
            config._isSearching = false;
        },

        search: function (graph) {
            if (config._isSearching == true) {
                //return;
                draw.deactivate();
            }
            if (map != null) {
                config._isSearching = true;
                Tool.clearMapAllGraphicsLayer(map);

                drawGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_draw" });
                map.addLayer(drawGraphicsLayer, 0);
                polygonGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polygon" });
                map.addLayer(polygonGraphicsLayer, 0);
                polylineGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polyline" });
                map.addLayer(polylineGraphicsLayer, 0);
                pointGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_point" });
                map.addLayer(pointGraphicsLayer, 0);
            }
            graph = graph;
            draw = new Draw(map,{showTooltips:true});
            draw.on("draw-end", this.doBuffer);
            map.setMapCursor("pointer");
            draw.activate(graph);
        },
        /**
        * 显示绘制结果
        */
        doBuffer: function (evt) {
            config._isSearching = false;
            if (draw != null) {
                draw.deactivate();
            }
            map.setMapCursor("default");
            var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            var geometry = evt.geometry;
            var searchGeometry;
            if (geometry.type === "point") {
                var circle = new esri.geometry.Circle({
                    center: new esri.geometry.Point(geometry.x, geometry.y, map.spatialReference)
                            , radius: distants
                            , radiusUnit: Units.KILOMETERS
                            , spatialReference: map.spatialReference
                });
                var graphic = new Graphic(circle, sfs);
                drawGraphicsLayer.add(graphic);
                //map.setExtent(circle.getExtent().expand(1.5));
                searchGeometry = circle;
                if (callback) {
                    callback(searchGeometry);
                }
                
                // require(["dojo/dom", "widgets/Query"], function (dom, Query) {
                //     var query1 = new widgets.Query({ map: map,layerUrlArr:layerUrlArr });
                //     query1.query(searchGeometry);
                // });
                //this.query(circle);
                //getSector(geometry, distants, startAngle, endAngle);
            }
            else {
                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                var basegraphic = new Graphic(geometry, symbol);
                drawGraphicsLayer.add(basegraphic);
                var gsvc = new esri.tasks.GeometryService(config.defaults.geometryService);
                var params = new esri.tasks.BufferParameters();
                params.distances = [distants];
                params.bufferSpatialReference = new SpatialReference({ wkid: 102100 });
                params.outSpatialReference = map.spatialReference;
                params.unit = esri.tasks.GeometryService["UNIT_KILOMETER"];
                normalizeUtils.normalizeCentralMeridian([geometry]).then(function (normalizedGeometries) {
                    params.geometries = [geometry];
                    var normalizedGeometry = normalizedGeometries[0];
                    if (normalizedGeometry.type === "polygon") {
                        gsvc.simplify([normalizedGeometry], function (geometries) {
                            params.geometries = geometries;
                            gsvc.buffer(params, function (bufferedGeometries) {
                                var graphic = new Graphic(bufferedGeometries[0], sfs);
                                drawGraphicsLayer.add(graphic);
                                //map.setExtent(bufferedGeometries[0].getExtent().expand(1.5));
                                //this.query(bufferedGeometries[0]);
                                searchGeometry = bufferedGeometries[0];
                                if (callback) {
                                    callback(searchGeometry);
                                }
                            });
                        });
                    } else {
                        params.geometries = [normalizedGeometry];
                        gsvc.buffer(params, function (bufferedGeometries) {
                            var graphic = new Graphic(bufferedGeometries[0], sfs);
                            drawGraphicsLayer.add(graphic);
                            //map.setExtent(bufferedGeometries[0].getExtent().expand(1.5));
                            //this.query(bufferedGeometries[0]);
                            searchGeometry = bufferedGeometries[0];
                            // require(["dojo/dom", "widgets/Query"], function (dom, Query) {
                            //     var query1 = new widgets.Query({ map: map,layerUrlArr:layerUrlArr  });
                            //     query1.query(searchGeometry);
                            // });
                            if (callback) {
                                callback(searchGeometry);
                            }
                        });
                    }

                });
            }

            
        }
    });

});
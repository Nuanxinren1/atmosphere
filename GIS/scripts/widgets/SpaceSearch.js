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

    declare("widgets.SpaceSearch", null, {
        map: null,
        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;
            // 

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
                pointHighlightSymbol = esri.symbol.PictureMarkerSymbol({ "url": "IMG/MapIcons/居民小区村庄.png", "height": 12, "width": 12, "yoffset": 12, "type": "esriPMS" });
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
            //debugger
            //判断是否正在查询
            if (config._isSearching == true) {
                //return;
                draw.deactivate();
            }
            if (map != null) {
                config._isSearching = true;
                Tool.clearMapAllGraphicsLayer(map);

                drawGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_draw" });
                map.addLayer(drawGraphicsLayer);
                //polygonGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polygon" });
                //map.addLayer(polygonGraphicsLayer, 0);
                //polylineGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_polyline" });
                //map.addLayer(polylineGraphicsLayer, 0);
                //pointGraphicsLayer = new esri.layers.GraphicsLayer({ id: "GL_Widgets_Buffer_point" });
                //map.addLayer(pointGraphicsLayer, 0);
            }

            graph = graph;

            draw = new esri.toolbars.Draw(map);
            draw.on("draw-end", this.addGraphicToMap);
            map.setMapCursor("pointer");
            draw.activate(graph);
        },
        clearGraphicsLayer: function () {
            if (pointGraphicsLayer != null) {
                pointGraphicsLayer.clear();
                map.removeLayer(pointGraphicsLayer);
            }
            if (polylineGraphicsLayer != null) {
                polylineGraphicsLayer.clear();
                map.removeLayer(polylineGraphicsLayer);
            }
            if (polygonGraphicsLayer != null) {
                polygonGraphicsLayer.clear();
                map.removeLayer(polygonGraphicsLayer);
            }
            if (drawGraphicsLayer != null) {
                drawGraphicsLayer.clear();
                map.removeLayer(drawGraphicsLayer);
            }
        },
        addGraphicToMap: function (evt) {
            config._isSearching = false;
            map.setMapCursor("default");
            draw.deactivate();
            var sfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            drawGraphicsLayer.add(new Graphic(evt.geometry, sfs));

            require(["dojo/dom", "widgets/Query"], function (dom, Query) {
                var query = new widgets.Query({ map: map });
                query.query(evt.geometry);
            });
            
        }

    });

});
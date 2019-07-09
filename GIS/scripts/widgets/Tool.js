define([
"dojo/_base/declare"
, "dojo/_base/lang"
, "esri/request"
, "dojo/dom"
, "dojo/query"
, "dojo/dom-construct"
, "dojo/_base/connect"
, "dojo/_base/array"
, "esri/layers/GraphicsLayer"
, "esri/symbols/SimpleFillSymbol"
, "esri/symbols/PictureMarkerSymbol"
, "esri/symbols/SimpleLineSymbol"
, "esri/graphic"
, "esri/geometry/Point"
, "esri/tasks/query"
, "esri/tasks/QueryTask"
, "esri/Color"
, "esri/config"
, "esri/layers/FeatureLayer"
]
, function (declare, lang, request, dom, query, domConstruct, connect, array, GraphicsLayer
, SimpleFillSymbol, PictureMarkerSymbol, SimpleLineSymbol, Graphic, Point, Query, QueryTask, Color, config, FeatureLayer) {
    return {
        /*清空地图中所有图层*/
        clearMapAllGraphicsLayer: function (mapObj) {
            //隐藏infowindow
            mapObj.infoWindow.hide();
            //清空所有图层
            var layerIds = mapObj.graphicsLayerIds;
            var arrayLayerId = Array();
            for (var i = 0; i < layerIds.length; i++) {
                //去除配置中需要保留的图层
                if ($.inArray(layerIds[i],mapconfig.retainLayerIds)<0) {
                    arrayLayerId.push(layerIds[i]);
                }
            }
            for (var i = 0; i < arrayLayerId.length; i++) {
                if (arrayLayerId[i] != "layer0" && arrayLayerId[i].indexOf('baseMap') == -1) {
                    var layer = mapObj.getLayer(arrayLayerId[i]);
                    layer.clear();
                    mapObj.removeLayer(layer);
                }

            }

            // var scaleLayers = mapObj.getLayersVisibleAtScale();
            // var arrayScaleLayers = new Array();
            // for (var i = 0; i < scaleLayers.length; i++) {
            //     arrayScaleLayers.push(scaleLayers[i]);
            // }
            // for (var i = 0; i < arrayScaleLayers.length; i++) {
            //     if (arrayScaleLayers[i].id != "layer0" && arrayScaleLayers[i].id.indexOf('baseMap') == -1) {
            //         if (arrayScaleLayers[i].id.toString().indexOf('TDT') == -1) {
            //             mapObj.removeLayer(arrayScaleLayers[i]);
            //         }
            //     }
            // }


            //清除测量结果
            query(".class_widgets_measure").forEach(function (node) {
                node.style.display = "none";
            });
            //清空地图中的图标
            $(".class_mapIcoDiv").remove();
            $(".ring").remove();
            //清空饼图图层
            $(".class_chart").remove();
        },
        /*清空地图所有绑定事件*/
        clearMpaAllEvent: function () {
            array.forEach(config._eventHandlers, connect.disconnect);
            config._eventHandlers.splice(0, esriConfig._eventHandlers.length);
        },
        //查询地图图层返回图层数据
        searchLayer: function (mapObj, layerID, layerName, where, symbols, mouseover, mouseout, click, coustomLayerUrl) {
            var pointsymbol = esri.symbol.PictureMarkerSymbol({ "url": "IMG/ICONS/30/point_green_small.png", "height": 25, "width": 15, "yoffset": 7, "type": "esriPMS" });
            var pointHlightSymbol = esri.symbol.PictureMarkerSymbol({ "url": "IMG/ICONS/30/point_blue_small.png", "height": 25, "width": 15, "yoffset": 7, "type": "esriPMS" });
            var query = new Query();
            //需要返回Geometry
            query.returnGeometry = true;
            //需要返回的字段
            query.outFields = ["*"];
            //查询条件
            query.where = where;
            var layerUrl = '';
            var layerUrl = config.defaultMapServerUrl + "/" + layerID;
            if (coustomLayerUrl) {
                layerUrl = coustomLayerUrl + "/" + layerID;
            }
            var queryTask = new QueryTask(layerUrl);
            queryTask.execute(query, showResults);
            function showResults(results) {
                var graphicsLayer = new GraphicsLayer({ id: layerName });
                graphicsLayer.on("click", function (evt) {
                    var hgraphic = evt.graphic
                    if (click) {
                        click(hgraphic, mapObj, evt.screenPoint);
                    }
                });
                graphicsLayer.on("mouse-over", function (evt) {
                    var hgraphic = evt.graphic;
                    switch (geometryType) {
                        case "point":
                            hgraphic.setSymbol(pointHlightSymbol);
                            break;
                        case "polyline":

                            break;
                        case "polygon":
                            var hcolor = hgraphic.symbol.color;
                            var polygonHlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([251, 209, 42, 1]), 2), hcolor);
                            hgraphic.setSymbol(polygonHlightSymbol);
                            break;
                    }
                    if (mouseover) {
                        mouseover(hgraphic, mapObj, evt.screenPoint);
                    }
                });
                graphicsLayer.on("mouse-out", function (evt) {
                    var hgraphic = evt.graphic;
                    switch (geometryType) {
                        case "point":
                            hgraphic.setSymbol(pointsymbol);
                            break;
                        case "polyline":

                            break;
                        case "polygon":
                            var normalSmbol = hgraphic.symbol;
                            normalSmbol.outline.color.a = 0;
                            hgraphic.setSymbol(hgraphic.symbol);
                            break;
                    }
                    if (mouseout) {
                        mouseout(hgraphic, mapObj, evt.screenPoint);
                    }
                });
                //遍历查询结果
                for (var i = 0; i < results.features.length; i++) {
                    var graphic = results.features[i];
                    //设置查询到的graphic的显示样式
                    var geometryType = graphic.geometry.type;
                    switch (geometryType) {

                        case "point":
                            graphic.setSymbol(pointsymbol);
                            graphicsLayer.add(graphic);
                            break;
                        case "polyline":

                            break;
                        case "polygon":
                            if (symbols.length == 1) {
                                graphic.setSymbol(symbols[0]);
                            }
                            else {
                                graphic.setSymbol(symbols[i]);
                            }
                            graphicsLayer.add(graphic);
                            break;
                    }
                }
                mapObj.addLayer(graphicsLayer, 0);
                if (graphicsLayer.graphics.length == 1) {
                    //debugger
                    //mapObj.setExtent(graphicsLayer.graphics[0]._extent);
                    var lon = graphicsLayer.graphics[0]._extent.xmin;
                    var lat = (Number(graphicsLayer.graphics[0]._extent.ymin) + Number(graphicsLayer.graphics[0]._extent.ymax)) / 2.0;
                    map.centerAndZoom(new Point(lon, lat), 3);//4改为3
                    //setTimeout(function () {
                    //    mapObj.setZoom(mapObj.getZoom() - 1);
                    //}, 500);

                }
            }
        },
        //地图中添加图层
        addFeatureLayer: function (mapObj, url, mouseover, mouseout, click) {
            var featureLayer = new FeatureLayer(url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"]
            });
            mapObj.addLayer(featureLayer, 0);
            featureLayer.on("mouse-over", function (evt) {
                if (mouseover) {
                    evt.map = mapObj;
                    mouseover(evt);
                }
            });
            featureLayer.on("mouse-out", function (evt) {
                if (mouseout) {
                    evt.map = mapObj;
                    mouseout(evt);
                }
            });
            featureLayer.on("click", function (evt) {
                if (click) {
                    evt.map = mapObj;
                    click(evt);
                }
            });
        }
    }

});
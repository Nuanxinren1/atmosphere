// define([
//   "dojo/_base/declare"
// , "dojo/_base/lang"
// , "esri/request"
// , "dojo/dom"
// , "esri/layers/GraphicsLayer"
// , "esri/symbols/SimpleFillSymbol"
// , "esri/symbols/SimpleLineSymbol"
// , "esri/graphic"
// , "esri/toolbars/draw"
// , "esri/tasks/GeometryService"
// , "esri/geometry/Circle"
// , "esri/geometry/Point"
// , "esri/units"
// , "esri/SpatialReference"
// , "esri/tasks/LengthsParameters"
// , "esri/tasks/AreasAndLengthsParameters"
// , "esri/config"
// , "dojo/dom-style"
// , "dojo/on"
// , "dojo/dom-construct"
// ]
// , function (declare, lang, esriRequest, dom, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Graphic, Draw, GeometryService, Circle, Point, Units, SpatialReference, LengthsParameters, AreasAndLengthsParameters, config, domStyle, dojoOn, domConstruct) {
//     var map = null;
//     var draw = null;
//     //图形结果
//     var drawGraphicsLayer = null;
//     //图形
//     var graph = null;
//     var GraphicsLayerId = "GL_Widgets_Measure_01";

//     declare("widgets.Measure", null, {
//         constructor: function (args) {
//             dojo.safeMixin(this, args);
//             map = this.map;
//             if (drawGraphicsLayer == null) {
//                 drawGraphicsLayer = new esri.layers.GraphicsLayer();
//                 drawGraphicsLayer.id = GraphicsLayerId;
//                 map.addLayer(drawGraphicsLayer);
//             }
//         },
//         clear: function () {
//             draw.deactivate();
//             config._isSearching = false;
//         },
//         measure: function (graph) {
//             //debugger
//             if (map.getLayer(GraphicsLayerId) == null) {
//                 map.addLayer(drawGraphicsLayer);
//             }

//             map.setMapCursor("default");
//             if (config._isSearching == true) {
//                 //return;
//                 draw.deactivate();
//             }
//             config._isSearching = true;
//             graph = graph;
//             draw = new esri.toolbars.Draw(map);
//             draw.on("draw-end", showMeasureResults);
//             draw.activate(graph);
//         }
//     });
//     /**
//     * 显示测量结果
//     * @param evt
//     */
//     var showPt = null;
//     function showMeasureResults(evt) {
//         config._isSearching = false;
//         draw.deactivate();
//         map.setMapCursor("default");
//         var geometry = evt.geometry;
//         var gsvc = new esri.tasks.GeometryService(config.defaults.geometryService);
//         switch (geometry.type) {
//             case "polyline":
//                 {
//                     var polylineSymbol = esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2);
//                     var length = geometry.paths[0].length;
//                     showPt = new esri.geometry.Point(geometry.paths[0][length - 1], map.spatialReference);
//                     var lengthParams = new esri.tasks.LengthsParameters();
//                     lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_KILOMETER;
//                     lengthParams.polylines = [geometry];
//                     lengthParams.geodesic = true;
//                     var index = new Date().getTime();
//                     gsvc.lengths(lengthParams, function (evtObj) {
//                         showmeasureInfo(index, showPt, evtObj.lengths[0].toFixed(3), "千米");
//                     });
//                     var graphic = new Graphic(geometry, polylineSymbol);
//                     graphic.attributes = { id: index };
//                     drawGraphicsLayer.add(graphic);
//                     break;
//                 }
//             case "polygon":
//                 {
//                     var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([125, 125, 125, 0.35]));
//                     showPt = new Point(geometry.rings[0][0], map.spatialReference);
//                     var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
//                     areasAndLengthParams.calculationType = "geodesic";
//                     areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_KILOMETER;
//                     areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_KILOMETERS;
//                     var outSR = new SpatialReference({ wkid: 102113 });
//                     var index = new Date().getTime();
//                     gsvc.project([geometry], outSR, function (simplifiedGeometries) {
//                         areasAndLengthParams.polygons = simplifiedGeometries;
//                         gsvc.areasAndLengths(areasAndLengthParams, function (evtObj) {
//                             showmeasureInfo(index, showPt, evtObj.areas[0].toFixed(3), "平方千米");
//                         });
//                     });
//                     var graphic = new Graphic(geometry, polygonSymbol);
//                     graphic.attributes = { id: index };
//                     drawGraphicsLayer.add(graphic);
//                     break;
//                 }
//         }

//     }
//     /**
//     * 显示测量结果
//     * @param showPnt
//     * @param data
//     * @param unit
//     */

//     function showmeasureInfo(index, showPnt, data, unit) {
//         domConstruct.create("div", { class: "class_widgets_measure", id: 'measureDIV' + index, innerHTML: "<table cellpadding='0' cellspacing ='0' border ='0'><tr><td valign = 'middle'><div id = 'measureresult" + index + "' style='font-size:12px;margin-top:-2px' ></div></td><td><div id = 'infoclose" + index + "' style='margin-top:2px;cursor:pointer'><img src ='img/drawedit/delete.png' style=\"vertical-align:baseline\"></img></div></td></tr></table>" }, dojo.body());
//         domStyle.set("measureDIV" + index, {
//             border: "1px solid red",
//             background: "#ffffff"
//         });
//         var isShow = false;
//         var screenPnt = map.toScreen(showPnt);
//         //9.21(qlq)由于.topbar不存在，导致top也成undefind
//         //var topbarHeight = dojo.query(".topbar").style("height")[0];
//         var topbarHeight = -40;
//         domStyle.set("measureDIV" + index, {
//             left: screenPnt.x + "px",
//             top: screenPnt.y + topbarHeight + "px",
//             position: "absolute",
//             height: "18px",
//             display: "block"
//         });
//         isShow = true;
//         domStyle.set("measureDIV" + index, {
//             zIndex: "999"
//         });
//         dom.byId("measureresult" + index).innerHTML = data + " " + unit;

//         dojoOn(dom.byId("infoclose" + index), "click", function () {
//             if (drawGraphicsLayer) {

//                 for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {
//                     if (drawGraphicsLayer.graphics[i].attributes.id == index) {
//                         drawGraphicsLayer.remove(drawGraphicsLayer.graphics[i]);

//                         if (dom.byId("measureDIV" + index) != null) {
//                             domConstruct.destroy("measureDIV" + index);
//                         }
//                     }
//                 }
//             }
//             isShow = false;
//         });

//         var panStart = dojo.connect(map, "onPanStart", function () {
//             for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {
//                 domStyle.set("measureDIV" + drawGraphicsLayer.graphics[i].attributes.id, {
//                     display: "none"
//                 });
//             }
//         });
//         var panEnd = dojo.connect(map, "onPanEnd", function () {
//             if (isShow == true) {
//                 var point = null;
//                 for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {
//                     var geometry = drawGraphicsLayer.graphics[i].geometry;
//                     if (geometry.type == "polyline") {
//                         var length = geometry.paths[0].length;
//                         point = new esri.geometry.Point(geometry.paths[0][length - 1], map.spatialReference);

//                     }
//                     else if (geometry.type == "polygon") {
//                         point = new Point(geometry.rings[0][0], map.spatialReference);
//                     }
//                     screenPnt = map.toScreen(point);
//                     domStyle.set("measureDIV" + drawGraphicsLayer.graphics[i].attributes.id, {
//                         left: screenPnt.x + "px",
//                         top: screenPnt.y + topbarHeight + "px",
//                         position: "absolute",
//                         height: "18px",
//                         display: "block"
//                     });
//                 }
//             }

//         });
//         var zoomStart = dojo.connect(map, "onZoomStart", function () {
//             for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {
//                 domStyle.set("measureDIV" + drawGraphicsLayer.graphics[i].attributes.id, {
//                     display: "none"
//                 });
//             }
//         });
//         var zoomEnd = dojo.connect(map, "onZoomEnd", function () {
//             if (isShow == true) {
//                 var point = null;
//                 for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {

//                     var geometry = drawGraphicsLayer.graphics[i].geometry;
//                     if (geometry.type == "polyline") {
//                         var length = geometry.paths[0].length;
//                         point = new esri.geometry.Point(geometry.paths[0][length - 1], map.spatialReference);

//                     }
//                     else if (geometry.type = "polygon") {
//                         point = new Point(geometry.rings[0][0], map.spatialReference);
//                     }
//                     screenPnt = map.toScreen(point);
//                     domStyle.set("measureDIV" + drawGraphicsLayer.graphics[i].attributes.id, {
//                         left: screenPnt.x + "px",
//                         top: screenPnt.y + topbarHeight + "px",
//                         position: "absolute",
//                         height: "18px",
//                         display: "block"
//                     });
//                 }
//             }
//         });

//         //将地图事件的句柄添加到句柄集合中。
//         require(["esri/config"], function (config) {
//             config._eventHandlers.push(panStart);
//             config._eventHandlers.push(panEnd);
//             config._eventHandlers.push(zoomStart);
//             config._eventHandlers.push(zoomEnd);
//         });
//     }
// });



define(["dojo/_base/connect",
    "dojo/_base/declare"
    , "dojo/_base/lang"
    , "esri/request"
    , "dojo/dom"
    , "esri/toolbars/draw"
    , "dojo/dom-style"
    , "dojo/on",
    "esri/layers/GraphicsLayer",
    , "dojo/dom-construct"
]
    , function (connect,declare, lang, esriRequest, dom, Draw, domStyle, dojoOn, GraphicsLayer, domConstruct) {
        return declare("widgets.Measure", null, {


            constructor: function (args) {
                // 变量
                this.map = null,// 地图对象
                    this.meatureTool = null,
                    this.onDrawEnd = null,
                    this.drawToolbar = null,
                    this.markerSymbol = null,
                    this.lineSymbol = null,
                    this.fillSymbol = null,
                    // ////////////////////////////
                    this._meatureType = null,
                    this._isEnd = true,
                    this._DPoints = [], // 测距坐标点
                    this._DClickNum = -1,
                    this._DCount = 0, // 总共测距的次数
                    this._DGraphic = null,
                    this._DGraphics = [], // 二维数组，用来存储每次测距的各图形信息
                    this._length = 0, // 测距单段距离
                    this._lastLength = 0, // 当前点与第一个点的距离
                    this._lengthZ = 0, // 累计长度
                    this._DDelGraphics = [], // 删除按钮

                    this._APoints = [],
                    this._AClickNum = -1,
                    this._ACount = 0, // 总共测距的次数
                    this._AGraphic = null,
                    this._AGraphicLabel = null,
                    this._AGraphicLabels = [],
                    this._AGraphics = [],
                    this._geoPloygon = null,  // 面几何
                    this._areaZ = 0,
                    this.areaUnit = HJMeatureUnit.HECTARE, // hectare(公顷),squareMeter(平方米),squareKiloMeters(平方公里),acres(亩)；一亩:666.7平方米，一公顷:10000平方米，一平方公里:1000000平方米
                    this._ADelGraphics = [],
                    this._drawToolbar = null,
                    this._onClickHandler_connect = null,
                    this._onMouseMoveHandler_connect = null,
                    this._onGraphicClickHandler_connect = null,
                    this._graphicsLayer = null
            },

            /**
             * 初始化加载部分
             */
            Init:function (map) {
                //清除标绘toolbar影响
                try {
                    CYF.Plot.drawToolbar.deactivate();
                } catch (error) {
                    console.log("measture:"+error)
                }
                this.map = map;
                this.markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 255, 1]));
                this.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2);
                this.fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 255, 0.5]));
                this._initDrawTool();
                this._onClickHandler = dojo.hitch(this, this._onClickHandler);
                this._onMouseMoveHandler = dojo.hitch(this, this._onMouseMoveHandler);
                this._onDrawEndHandler = dojo.hitch(this, this._onDrawEndHandler);
                this._onExtentChangeHandler = dojo.hitch(this, this._onExtentChangeHandler);
                this._onGraphicClearHandler = dojo.hitch(this, this._onGraphicClearHandler);
                if (map.getLayer("DciMeatureGLyr")) {
                    map.removeLayer(map.getLayer("DciMeatureGLyr"))
                }

                this._graphicsLayer = new  GraphicsLayer({ id: "DciMeatureGLyr" });
            },
            _initDrawTool: function () {
                var T = this;
                drawToolbar = new esri.toolbars.Draw(map, { showTooltips: false });
                drawToolbar.markerSymbol = this.markerSymbol;
                drawToolbar.lineSymbol = this.lineSymbol;
                drawToolbar.fillSymbol = this.fillSymbol;
                dojo.connect(drawToolbar, "onDrawEnd", function (geometry) {
                    if (T.onDrawEnd) {
                        T.onDrawEnd(geometry);
                    }
                });
            },
            // 动态测距
            measureDistance: function () {
                this.setMapCursor("url('img/maptoolbar/ruler.cur'),auto");
                this.activate(HJMeatureType.DISTANCE);
                this.actionMode = HJMapAction.DISTANCE;
            },
            // 动态测面积
            measureArea: function () {
                this.setMapCursor("url('img/maptoolbar/ruler.cur'),auto");
                this.activate(HJMeatureType.AREA, HJMeatureUnit.SKILOMETER);
                this.actionMode = HJMapAction.AREA;
            },
            // 设置当鼠标在地图上时的游标样式
            setMapCursor: function (cursor) {
                map.setMapCursor(cursor);
            },


            activate: function (type, unit) {

                if (this._isEnd == true) {
                    if (unit) {
                        this.areaUnit = unit;
                    }

                    var lyr = this.map.getLayer(this._graphicsLayer.id);
                    if (!lyr) {
                        this.map.addLayer(this._graphicsLayer);
                    }
                    var _esriMap = map;
                    this.drawPolyline(null, this._onDrawEndHandler);
                    this.disablePan();

                    this._onClickHandler_connect = dojo.connect(_esriMap, "onClick", this, "_onClickHandler");
                    this._onMouseMoveHandler_connect = dojo.connect(_esriMap, "onMouseMove", this, "_onMouseMoveHandler");
                    this._onGraphicClickHandler_connect = dojo.connect(this._graphicsLayer, "onClick", this, "_onGraphicClearHandler");
                    this._isEnd = false;
                } else {
                    if (this._meatureType != type) {
                        this.deactivate();
                        this.activate(type, unit);
                    }
                }
                this._meatureType = type;
            },
            deactivate: function () {
                this.terminate();
                dojo.disconnect(this._onClickHandler_connect);
                dojo.disconnect(this._onMouseMoveHandler_connect);
                this.enablePan();
                $('#pointOutDiv').remove();

                //test,bug,和标注同时出现时会出现bug
                if (drawToolbar) {
                    drawToolbar.deactivate();
                }
                //this.deactivateDraw();
                // var div = document.getElementById("pointOutDiv");
                // if (div) {
                //     div.parentNode.removeChild(div);
                // }
            },
            drawPolyline: function (symbol, onDrawEnd) {
                this.onDrawEnd = onDrawEnd;
                if (symbol) {
                    drawToolbar.lineSymbol = symbol;
                }
                drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
                this.disablePan();
            },
            _onClickHandler: function (evt) {
                evt = evt ? evt : (window.event ? window.event : null);
                var pt = evt.mapPoint;
                var text = "起点";
                if (this._meatureType == HJMeatureType.DISTANCE) {
                    if (this._DClickNum == -1) {
                        this._DCount++;
                        this._DGraphics[this._DCount - 1] = [];
                    } else {
                        this._lengthZ += this._length;
                        text = this._lengthZ < 1000 ? parseInt(this._lengthZ) + "米" : ((this._lengthZ) / 1000).toFixed(1) + "公里";
                    }
                    var textSymbol = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([255, 56, 99])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                    var graphicsText = new esri.Graphic(pt, textSymbol);
                    this._graphicsLayer.add(graphicsText);
                    this._DGraphics[this._DCount - 1].push(graphicsText);

                    this._DPoints.push(pt); // 把一次测距中的点存入点临时数组中
                    this._DClickNum++; // 一次测距点的个数
                } else if (this._meatureType == HJMeatureType.AREA) {
                    if (this._AClickNum == -1) {
                        // 创建一个面
                        this._geoPloygon = new esri.geometry.Polygon(this.map.spatialReference);
                        this._geoPloygon.addRing([[pt.x, pt.y], [pt.x, pt.y]]);
                        // this._AGraphic = new esri.Graphic(this._geoPloygon,
                        // this._dciMap.fillSymbol);
                        this._AGraphic = new esri.Graphic(this._geoPloygon, this.fillSymbol);
                        this._graphicsLayer.add(this._AGraphic);

                        this._ACount++;
                        this._AGraphics.push(this._AGraphic);

                        var textSymbol = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([255, 56, 99])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                        var graphicLabel = new esri.Graphic(pt, textSymbol);
                        this._graphicsLayer.add(graphicLabel);
                        this._AGraphicLabels.push(graphicLabel);
                    } else {
                        // 面积
                        var areaZmove = this._areaZ + this.getTriangleArea(pt, this._APoints[this._AClickNum], this._APoints[0]);
                        this._areaZ = areaZmove;
                        var areaUnit = this.areaUnit;
                        var areaWithUnit = "";
                        if (areaUnit == HJMeatureUnit.HECTARE) {
                            areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 10000) > 1 ? (Math.abs(areaZmove) / 10000).toFixed(2) : (Math.abs(areaZmove) / 10000).toFixed(4)) + "公顷";
                        } else if (areaUnit == HJMeatureUnit.SMETER) {
                            areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                        } else if (areaUnit == HJMeatureUnit.SKILOMETER) {
                            if (Math.abs(areaZmove) / 1000000 > 1) {
                                areaWithUnit = "面积:" + (Math.abs(areaZmove) / 1000000).toFixed(3) + "平方公里";
                            } else {
                                areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                            }
                        } else if (areaUnit == HJMeatureUnit.ACRES) {
                            areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 666.7) > 1 ? (Math.abs(areaZmove) / 666.7).toFixed(1) : (Math.abs(areaZmove) / 666.7).toFixed(2)) + "亩";
                        }

                        text = areaWithUnit;
                        var graphicLabel = null;
                        if (this._AGraphicLabels.length >= this._ACount) {
                            graphicLabel = this._AGraphicLabels[this._ACount - 1];
                            graphicLabel.setGeometry(pt);
                            var textSymbol2 = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([255, 56, 99])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                            graphicLabel.setSymbol(textSymbol2);
                        }
                        this._geoPloygon.insertPoint(0, this._geoPloygon.rings[0].length - 1, pt);
                        this._AGraphic.setGeometry(this._geoPloygon);
                    }
                    this._AClickNum++;
                    this._APoints.push(pt);
                }
            },
            _onMouseMoveHandler: function (evt) {
                evt = evt ? evt : (window.event ? window.event : null);
                if (this._meatureType == HJMeatureType.DISTANCE) {
                    this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, "单击确定起点");
                    var pt = evt.mapPoint;
                    if (this._DClickNum != -1) {
                        this._length = this.getDistanceInEarth(pt, this._DPoints[this._DClickNum]);
                        if ((this._lengthZ + this._length) < 1000) {
                            this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, (this._lengthZ + this._length).toFixed(0) + "米<br/>单击确定地点，双击结束");
                        } else {
                            this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, ((this._lengthZ + this._length) / 1000).toFixed(1) + "公里<br/>单击确定地点，双击结束");
                        }
                    }
                } else if (this._meatureType == HJMeatureType.AREA) {
                    var pt = evt.mapPoint;
                    if (this._AClickNum != -1) {
                        var areaZmove = this._areaZ + this.getTriangleArea(pt, this._APoints[this._AClickNum], this._APoints[0]);
                        var areaWithUnit = "";
                        var areaUnit = this.areaUnit;
                        if (areaUnit == HJMeatureUnit.HECTARE) {
                            areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 10000) > 1 ? (Math.abs(areaZmove) / 10000).toFixed(2) : (Math.abs(areaZmove) / 10000).toFixed(4)) + "公顷";
                        } else if (areaUnit == HJMeatureUnit.SMETER) {
                            areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                        } else if (areaUnit == HJMeatureUnit.SKILOMETER) {
                            if (Math.abs(areaZmove) / 1000000 > 1) {
                                areaWithUnit = "面积:" + (Math.abs(areaZmove) / 1000000).toFixed(3) + "平方公里";
                            } else {
                                areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                            }
                        } else if (areaUnit == HJMeatureUnit.ACRES) {
                            areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 666.7) > 1 ? (Math.abs(areaZmove) / 666.7).toFixed(1) : (Math.abs(areaZmove) / 666.7).toFixed(2)) + "亩";
                        }
                        this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, areaWithUnit + "<br/>单击确定地点，双击结束");
                    }
                }
            },
            _onDrawEndHandler: function (geometry) {
                switch (this._meatureType) {
                    case HJMeatureType.DISTANCE:
                        var graphic = new esri.Graphic(geometry, this.lineSymbol);
                        this._graphicsLayer.add(graphic);
                        this._DGraphics[this._DCount - 1].push(graphic);
                        this._checkDistance();
                        break;
                    case HJMeatureType.AREA:
                        this._checkArea();
                        break;
                }
                this._isEnd = true; // 正常结束
                this.deactivate();
                this.setMapCursor("auto");
            },
            // 终止,在测量未完成的情况下，进行其他操作（如拉框放大、缩小）导致测量结束（漫游除外）
            terminate: function () {
                if (this._isEnd == false) {
                    if (this._meatureType == HJMeatureType.DISTANCE) {
                        var len = this._DCount;
                        if (len > 0) {
                            for (var j = this._DGraphics[len - 1].length - 1; j >= 0; j--) {
                                this._graphicsLayer.remove(this._DGraphics[len - 1][j]);
                            }
                            this._DGraphics.pop();
                            this._DClickNum = -1;
                            this._DPoints = [];
                            this._length = 0;
                            this._lengthZ = 0;
                            this._DCount--;
                        }
                    } else if (this._meatureType == HJMeatureType.AREA) {
                        var len = this._ACount;
                        if (len > 0) {
                            this._graphicsLayer.remove(this._AGraphics[len - 1]);
                            this._graphicsLayer.remove(this._AGraphicLabels[len - 1]);
                            this._AGraphics.pop();
                            this._AGraphicLabels.pop();
                            this._area = 0;
                            this._areaZ = 0;
                            this._APoints = [];
                            this._AClickNum = -1;
                            this._length = 0;
                            this._lengthZ = 0;
                            this._geoPolygon = null;
                            this._ACount--;
                        }
                    }
                    this._isEnd = true;
                }
            },
            // 清除所有
            clearAll: function () {
                this.deactivate();
                // 清除测距
                for (var i = 0; i < this._DCount; i++) {
                    for (var j = this._DGraphics[i].length - 1; j >= 0; j--) {
                        this._graphicsLayer.remove(this._DGraphics[i][j]);
                    }
                    this._graphicsLayer.remove(this._DDelGraphics[i]);
                }
                this._DPoints = [];
                this._DClickNum = -1;
                this._DCount = 0;
                this._DGraphic = null;
                this._DGraphics = [];
                this._length = 0;
                this._lengthZ = 0;
                this._DDelGraphics = [];

                // 清除测面积
                for (var i = 0; i < this._ACount; i++) {
                    this._graphicsLayer.remove(this._AGraphics[i]);
                    this._graphicsLayer.remove(this._AGraphicLabels[i]);
                    this._graphicsLayer.remove(this._ADelGraphics[i]);
                }
                this._AGraphics = [];
                this._ADelGraphics = [];
                this._AGraphicLabels = [];
                this._APoints = [];
                this._AClickNum = -1;
                this._ACount = 0;
                this._AGraphic = null;
                this._geoPloygon = null;
                this._areaZ = 0;
                this.areaUnit = "hectare";

                var div = document.getElementById("pointOutDiv");
                if (div) {
                    div.parentNode.removeChild(div);
                }
                setMapCursor("auto");
            },

            // 选择清除
            _onGraphicClearHandler: function (evt) {
                dojo.stopEvent(evt);
                // 清除选中的测距元素
                if (this._DCount > 0) {
                    var grap = evt.graphic;
                    for (var i = 0; i < this._DCount; i++) {
                        if (grap == this._DDelGraphics[i]) {
                            for (var j = this._DGraphics[i].length - 1; j >= 0; j--) {
                                this._graphicsLayer.remove(this._DGraphics[i][j]);
                            }
                            this._graphicsLayer.remove(this._DDelGraphics[i]);
                            this._DGraphics.splice(i, 1);
                            this._DDelGraphics.splice(i, 1);
                            this._DCount--;
                            return;
                        }
                    }
                    map.removeLayer(map.getLayer('DciMeatureGLyr'));
                }

                // 清除选中的测面积元素
                if (this._ACount > 0) {
                    var grap = evt.graphic;
                    for (var i = 0; i < this._ACount; i++) {
                        if (grap == this._ADelGraphics[i]) {
                            this._graphicsLayer.remove(this._AGraphics[i]);
                            this._graphicsLayer.remove(this._AGraphicLabels[i]);
                            this._graphicsLayer.remove(this._ADelGraphics[i]);
                            this._AGraphicLabels.splice(i, 1);
                            this._AGraphics.splice(i, 1);
                            this._ADelGraphics.splice(i, 1);
                            this._ACount--;
                            break;
                        }
                    }
                }
            },
            _pointOutDbClickEnd: function (x, y, label) {
                var tipDiv = document.getElementById("pointOutDiv");
                if (!tipDiv) {
                    tipDiv = document.createElement("div");
                    tipDiv.id = "pointOutDiv";
                    tipDiv.style.position = "absolute";
                    tipDiv.style.height = "40px";
                    tipDiv.style.zIndex = 800;
                    tipDiv.style.left = x + "px";
                    tipDiv.style.right = "auto";
                    tipDiv.style.top = y + "px";
                    tipDiv.style.bottom = "auto";
                    tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
                    document.body.appendChild(tipDiv);
                } else {
                    tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
                    tipDiv.style.left = x + "px";
                    tipDiv.style.top = y + "px";
                    tipDiv.style.display = "block";
                }
            },
            // 测量距离
            _calculateLength: function (pInPoints) {
                var pts = pInPoints.length;
                var dLen = new Number(0);
                var pt0 = pInPoints[0];

                for (var i = 1; i < pts; i++) {
                    pt1 = pInPoints[i];
                    if (pt0.length > 0) {
                        pt0 = new esri.geometry.Point(pt0[0], pt0[1], this._dciMap.spatialReference);
                    }
                    if (pt1.length > 0) {
                        pt1 = new esri.geometry.Point(pt1[0], pt1[1], this._dciMap.spatialReference);
                    }
                    dLen += getDistanceInEarth(pt0, pt1);
                    pt0 = pt1;
                }
                return Math.abs(Math.ceil(dLen));
            },
            // 处理测距结果
            _checkDistance: function () {
                var pt = this._DPoints[this._DPoints.length - 1];
                if (this._DCount > 0) {
                    // var url = getRootPath() +
                    // "Content/images/measure/shanchu.png";
                    var url = "img/maptoolbar/shanchu.png";
                    var delGraphic = new esri.Graphic(pt, new esri.symbol.PictureMarkerSymbol(url, 16, 16).setOffset(10, -10));
                    this._graphicsLayer.add(delGraphic);
                    this._DDelGraphics.push(delGraphic);
                }
                this._DClickNum = -1;
                this._DPoints = [];
                this._length = 0;
                this._lengthZ = 0;
            },
            _checkArea: function () {
                if (this._APoints.length != 1) {
                    var pt = this._APoints[this._APoints.length - 1];
                    if (this._ACount > 0) {
                        // var url = DCIMapAPIPath + "images/shanchu.png";
                        // var url = getRootPath() +
                        // "Content/images/measure/shanchu.png";
                        var url = "img/maptoolbar/shanchu.png";
                        var delGraphic = new esri.Graphic(pt, new esri.symbol.PictureMarkerSymbol(url, 16, 16).setOffset(10, -10));
                        this._graphicsLayer.add(delGraphic);
                        this._ADelGraphics.push(delGraphic);
                    }
                } else {
                    this._ACount--;;
                    textDivArr1.remove(textDivArr1[areaNum]);
                }
                this._area = 0;
                this._areaZ = 0;
                this._APoints = [];
                this._AClickNum = -1;
                this._length = 0;
                this._lengthZ = 0;
                this._geoPolygon = null;
            },
            disablePan: function () {
                this.map.disablePan();
            },
            enablePan: function () {
                this.map.enablePan();
            },
            extend: function (destination, source) {
                destination = destination || {};
                if (source) {
                    for (var property in source) {
                        var value = source[property];
                        if (value !== undefined) {
                            destination[property] = value;
                        }
                    }
                    var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;
                    if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
                        destination.toString = source.toString;
                    }
                }
                return destination;
            },
            deactivateDraw: function () {
                drawToolbar.deactivate();
                this.onDrawEnd = null;
                this.enablePan();
            },
            getDistanceInEarth: function (point1, point2) {
                var d = new Number(0);
                // 1度等于0.0174532925199432957692222222222弧度
                // var radPerDegree=0.0174532925199432957692222222222;
                var radPerDegree = Math.PI / 180.0;
                if (map.spatialReference.wkid == "4326") {
                    var latLength1 = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point2.y }).x - this.translateLonLatToDistance({ x: point2.x, y: point2.y }).x);
                    var latLength2 = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point1.y }).x - this.translateLonLatToDistance({ x: point2.x, y: point1.y }).x);
                    var lonLength = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point2.y }).y - this.translateLonLatToDistance({ x: point1.x, y: point1.y }).y);
                    d = Math.sqrt(Math.pow(lonLength, 2) - Math.pow(Math.abs(latLength1 - latLength2) / 2, 2) + Math.pow(Math.abs(latLength1 - latLength2) / 2 + Math.min(latLength1, latLength2), 2));
                }
                else {
                    var len_prj = Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2);
                    d = Math.sqrt(len_prj);
                }
                d = Math.ceil(d);
                return d;
            },
            translateLonLatToDistance: function (point) {
                var d = new Number(0);
                // 1度等于0.0174532925199432957692222222222弧度
                // var radPerDegree=0.0174532925199432957692222222222;
                var radPerDegree = Math.PI / 180.0;
                var equatorialCircumference = Math.PI * 2 * 6378137;

                return {
                    x: Math.cos(point.y * radPerDegree) * equatorialCircumference * Math.abs(point.x / 360),
                    y: equatorialCircumference * Math.abs(point.y / 360)
                };
            },
            getTriangleArea: function (point1, point2, point3) {
                var area = 0;

                if (!point1 || !point2 || !point3) {
                    return 0;
                }

                if (map.spatialReference.wkid == "4326") {

                    point1 = this.translateLonLatToDistance(point1);
                    point2 = this.translateLonLatToDistance(point2);
                    point3 = this.translateLonLatToDistance(point3);
                }
                area = ((point1.x * point2.y - point2.x * point1.y) + (point2.x * point3.y - point3.x * point2.y) + (point3.x * point1.y - point1.x * point3.y)) / 2;
                return area;
            }
        });
    });


HJMapAction = {
    ZOOMIN: "action_zoomin",
    ZOOMOUT: "action_zoomout",
    PAN: "action_pan",
    DISTANCE: "action_distance",
    AREA: "action_area"
};
HJMeatureType = {
    DISTANCE: "distance",
    AREA: "area"
};
HJMeatureUnit = {
    HECTARE: "HECTARE",
    SMETER: "SMETER",
    SKILOMETER: "SKILOMETER",
    ACRES: "ACRES"
};



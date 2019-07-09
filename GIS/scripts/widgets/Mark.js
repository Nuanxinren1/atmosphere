define([
  "dojo/_base/declare"
, "dojo/_base/lang"
, "esri/request"
, "dojo/dom"
, "esri/layers/GraphicsLayer"
, "esri/symbols/SimpleFillSymbol"
, "esri/symbols/PictureMarkerSymbol"
, "esri/symbols/SimpleLineSymbol"
, "esri/graphic"
, "esri/toolbars/draw"
, "esri/geometry/Point"
, "esri/toolbars/edit"
, "esri/config"
, "dojo/on"

]
, function (declare, lang, esriRequest, dom, GraphicsLayer, SimpleFillSymbol, PictureMarkerSymbol, SimpleLineSymbol, Graphic, Draw, Point, Edit, config, dojoOn) {

    var map = null;
    var draw = null;
    //图形结果
    var drawGraphicsLayer = null;
    //图形编辑
    var editToolbar = null;
    //图层名称
    var GraphicsLayerId = "GL_Widgets_Mark_01";
    declare("widgets.Mark", null, {
        //构造函数
        constructor: function (args) {

            dojo.safeMixin(this, args);
            map = this.map;
            if (drawGraphicsLayer == null) {
                drawGraphicsLayer = new esri.layers.GraphicsLayer();
                drawGraphicsLayer.id = GraphicsLayerId;
                map.addLayer(drawGraphicsLayer);
            }
        },
        label: function () {
            //判断是否正在查询
            if (config._isSearching == true) {
                return;
            }
            config._isSearching = true;
            draw = new esri.toolbars.Draw(map);
            draw.on("draw-end", showResults);
            draw.activate(esri.toolbars.Draw.POINT);
        }
    });

    function showResults(evt) {
        config._isSearching = false;
        if (map.getLayer(GraphicsLayerId) == null) {
            map.addLayer(drawGraphicsLayer);
        }
        draw.deactivate();
        map.setMapCursor("default");

        var geometry = evt.geometry;
        var pointSymbol = esri.symbol.PictureMarkerSymbol({ "url": config.defaultImageUrl + "/image/mark/mark.png", "height": 24, "width": 16, "yoffset": 10, "type": "esriPMS" });
        var graphic = new Graphic(geometry, pointSymbol);
        var index = new Date().getTime();
        graphic.attributes = { id: index, title: '', content: '', titleTextId: "widgets_mark_txt_mark" + index, contentTextId: "widgets_mark_txa_mark" + index, confirmId: "widgets_mark_btn_confirm" + index, delId: "widgets_mark_btn_del" + index };
        drawGraphicsLayer.add(graphic);
        drawGraphicsLayer.on("mouse-over", showTip);
        //drawGraphicsLayer.on("mouse-out", hideTip);
        map.infoWindow.setTitle("添加标记");

        var html = "<table id='markDetailTable' cellpadding = '0' cellspacing = '0' border = '0' width ='230' style='font-size:12px'><tr><td>名称</td><td><input type = 'text' id ='" + graphic.attributes.titleTextId + "' value='" + graphic.attributes.title + "' style ='width:200px'/></td></tr><tr><td style = 'height:10px'></td></tr><tr><td>备注</td><td><textarea id = '" + graphic.attributes.contentTextId + "' rows = '4' style='overflow:auto; width:198px;resize:none'>" + graphic.attributes.content + "</textarea></td></tr>";
        html += "<tr><td style = 'height:10px'></td></tr><tr><td colspan='2' align = 'right'><input type = 'button' id = '" + graphic.attributes.delId + "' value = '删除'/><input type = 'button' id = '" + graphic.attributes.confirmId + "' value = '确认' /></td></tr></table>";
        map.infoWindow.setContent(html);
        var point = new Point(geometry.x, geometry.y, map.spatialReference);
        map.infoWindow.resize(250, 230)


        map.infoWindow.show(point);
        activeEdit(graphic);

    }
    function activeEdit(graphic) {

        editToolbar = new Edit(map);
        var tool = 0;
        tool = tool | Edit.MOVE;
        var options = {
            allowAddVertices: true,
            allowDeleteVertices: true,
            uniformScaling: true
        };
        editToolbar.activate(tool, graphic, options);
        dojoOn(dojo.byId(graphic.attributes.confirmId), "click", function () {
            saveInfo();
        });
        dojoOn(dojo.byId(graphic.attributes.delId), "click", function (evt) {
            deleteMark(graphic);
        });
    }
    //鼠标移上去事件
    function showTip(evt) {
        map.infoWindow.resize(250, 230)
        var graphic = evt.graphic;
        var html = "<table id='markDetailTable' cellpadding = '0' cellspacing = '0' border = '0' width ='230' style='font-size:12px'><tr><td>名称</td><td><input type = 'text' id ='" + graphic.attributes.titleTextId + "' value='" + graphic.attributes.title + "' style ='width:200px'/></td></tr><tr><td style = 'height:10px'></td></tr><tr><td>备注</td><td><textarea id = '" + graphic.attributes.contentTextId + "' rows = '4' style='overflow:auto; width:198px;resize:none'>" + graphic.attributes.content + "</textarea></td></tr>";
        html += "<tr><td style = 'height:10px'></td></tr><tr><td colspan='2' align = 'right'><input type = 'button' id = '" + graphic.attributes.delId + "' value = '删除'/><input type = 'button' id = '" + graphic.attributes.confirmId + "' value = '确认' /></td></tr></table>";
        map.infoWindow.setContent(html);
        dojoOn(dojo.byId(graphic.attributes.confirmId), "click", function () {
            saveInfo(graphic);
        });
        dojoOn(dojo.byId(graphic.attributes.delId), "click", function (evt) {
            deleteMark(graphic);
        });
         
        var point = new Point(graphic.geometry.x, graphic.geometry.y, map.spatialReference);
        map.infoWindow.show(point);
    }

    function deleteMark(graphic) {

        var length = drawGraphicsLayer.graphics.length;
        for (var i = 0; i < length; i++) {
            if (drawGraphicsLayer.graphics[i]) {
                if (drawGraphicsLayer.graphics[i].attributes.id == graphic.attributes.id) {
                    drawGraphicsLayer.remove(drawGraphicsLayer.graphics[i]);
                    map.infoWindow.hide()
                }
            }
        }
    }
    function saveInfo(graphic) {
        if (graphic == null || graphic == undefined) {
            return;
        }
        for (var i = 0; i < drawGraphicsLayer.graphics.length; i++) {
            if (drawGraphicsLayer.graphics[i].attributes.id == graphic.attributes.id) {
                drawGraphicsLayer.graphics[i].attributes.title = dojo.byId(graphic.attributes.titleTextId).value;
                drawGraphicsLayer.graphics[i].attributes.content = dojo.byId(graphic.attributes.contentTextId).value;
            }
        }
        map.infoWindow.hide();
    }

    //鼠标移开事件
    function hideTip(evt) {
        map.infoWindow.resize(400, 250)
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
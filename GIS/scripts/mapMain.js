var mapzoomChange = null;
var mappanChange = null;
//全局map对象
var map = null;
// 弹出面板变量
var jspanel = null;

/*时间轴*/
var timedemo;
//document ready 初始化
$(function () {

    //初始化地图
    mugis.mapInit.initMap(initMapCallback);

    //初始化弹出水环境弹窗
    // parent.openPopPanel('panel_air');
    //隐藏菜单面板
    $('#mapdiv').click(function () {
        $('#kind').hide();
    })

    $("input[name='region']").click(function (e) {
        if (this.checked) {
            var name = this.parentNode.innerText;
            var url = mapconfig._arcGISServerUrl + '/Boundry/MapServer/0';
            queryLayerByAtribute(url, "NAME = '" + name + "'", function (featureSet) {
                require(["esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"], function (SimpleFillSymbol, SimpleLineSymbol, Color) {
                    var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([169, 0, 230]), 1), new Color([0, 0, 0, 0])
                    );
                    var feature = featureSet.features[0];
                    feature.symbol = sfs;
                    map.graphics.clear();
                    map.graphics.add(feature);
                    var extent = feature.geometry.getExtent();
                    map.setExtent(extent.expand(1.25));
                });
            })

        } else {
            map.graphics.clear();
        }
    });

    //地图环境图层下拉选着框点击事件
    $('ul[name="dropdownMenu"] li').click(function (e) {
        try {
            e.stopPropagation();
            e.preventDefault();
            this.children[0].children[0].click();
        } catch (error) {

        }

    })
    $('#polluter_btn').click(function (e) {
        e.stopPropagation();
        parent.openPopPanel('polluter')
    })


    //textsymbol是否显示
    $(".air_name").click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        var name = "air_polluter" + this.id;
        var checked = this.checked;

        try {
            var graphics = map.getLayer('GL_PointCover_' + name).graphics;
            if (graphics) {

                if (this.style.color == 'rgb(9, 97, 230)') {
                    this.style.color = 'black'

                    for (var i = 0; i < graphics.length; i++) {
                        var g = graphics[i];
                        if (g.symbol.type == 'textsymbol') {
                            g.hide();

                        }
                    }
                } else {
                    this.style.color = 'rgb(9, 97, 230)'

                    for (var i = 0; i < graphics.length; i++) {
                        var g = graphics[i];
                        if (g.symbol.type == 'textsymbol') {
                            g.show();

                        }
                    }
                }
            }

        } catch (e) {

        }

    })

   
    /***demo****/

    //风场事件
    // $("[name='my']").bootstrapSwitch({
    //     //inverse: true,
    //     onText: "开",
    //     offText: "关",
    //     onColor: "success",
    //     offColor:"default",
    //     labelText: '风场',
    //     size: "small",
    //     labelWidth:20,
    //     labelWidth: 30,
    //     onSwitchChange: function (event, state) {
    //layui.form.on('switch(switchwind)', function (data) {
    //    var state = data.elem.checked;
    //    var checkedOfAll = $("#my").prop("checked");
    //    windyLoad(state);
    //}
    //);

    //数据应用
    // $("input[name='data']").click(function (e) {
    //     //超标数据
    //     if (this.value == '1') {
    //         if (map.getLayer("GL_PointCover_overonline")) {
    //             map.getLayer("GL_PointCover_overonline").setVisibility(this.checked);
    //         } else {
    //             //mugis.mapClear.holdLayers(["boundry", "4", "0", "GL_PointCover_overonline"]);
    //             //超标数据
    //             mugis.mapShowPOI.addPOI("overonline", overent, 'Panel/PolluterOnLineMonitor/OverOnLine.html', '', '&starttime=2018-02-08 01:01:06&endtime=2018-02-08 11:01:06', '', '', '02');
    //         }
    //     } else if (this.value == '4') {
    //     } else if (this.value == '5') {
    //     }
    //     //app位置
    //     else if (this.value == '2') {
    //     }
    //     //污染源热力图
    //     else if (this.value == '6') {
    //     }
    // });


    /**
     * 根据时间点加载插值图片
     * @param {} time 
     */
    function idwLoad(time) {
        //加载区域插值
        var idwUrl = "", contourUrl = "";
        var monitorText = $(".areaSearch li.aqiactive span").text(); //获取当前监测类型（AQI,PM2.5,PM10....)
        var monitorType = 'AQI';
        var hour = time.substr(11, 2);
        var day = time.substr(8, 2);
        var month = time.substr(5, 2);
        var year = time.substr(0, 4);
        // var timeObj = new Date();
        // timeObj.setFullYear(year, parseInt(month) - 1, day);
        // timeObj.setHours(hour);
        // var nowTime = new Date();
        // //if (timeObj.getTime() <= nowTime.getTime()) { //插值图层不能大于当前时间
        // var nowMinute = nowTime.getMinutes();
        // if (nowMinute < 51) {  //插值程序在每小时40分时执行，X点40分后获取当前小时数据
        //     if (parseInt(hour) == nowTime.getHours()) {
        //         hour = parseInt(hour) - 1;
        //         hour = (hour < 10) ? "0" + hour : hour;
        //     }
        // }
        idwUrl = config.idwImageRoot + monitorType + "/IDW_" + year + month + day + hour + ".png";  //插值图地址

        //idwUrl = config.idwImageRoot + monitorType + "/IDW_" + "2018041708.png";  //插值图地址
        //contourUrl = idwPicUrlRoot + monitorType + "/Contour_" + year + month + day + hour + ".png"; //等值线图地址
        var idwLayerId = "idw_" + monitorType + "_imgLayer";
        //var contourLayerId = "contour_" + monitorType + "_imgLayer";
        //var idwParam = idwPicParams[monitorType + "_idw_pic"]; //插值图片对角坐标计算参数
        //var contourParam = idwPicParams[monitorType + "_contour_pic"];  //等值线图片对角坐标计算参数
        addImageLayerToMap(idwUrl, idwLayerId); //叠加插值图
        //addImageLayerToMap(contourLayerId, contourUrl, idwPicParams, 1, dzxTurn);//叠加等值线图
        //}
    }

   
    /***demo****/



    $('#monitoringValue li').click(function () {
        $(this).addClass('aqiactive');
        $(this).siblings().removeClass('aqiactive');
        var s = $("#iframe001")[0].contentWindow;
        s.curMonitorType = $("span", this).text();
        s.searchStation(s.curMonitorTime);
    })
    $('#waterMonitoringValue li').click(function () {
        $(this).addClass('aqiactive');
        $(this).siblings().removeClass('aqiactive');

        var time = $("#iframe001")[0].contentWindow.document.getElementById('searchDate1').value.replace('年', '-').replace('月', '-').replace('日', '').replace('时', '');
        var stationtype = $("#iframe001")[0].contentWindow.document.getElementById('stationTj').value;
        var timetype = $("#iframe001")[0].contentWindow.document.getElementById('day_hour').value;
        if (timetype == '1') {
            time += ':00:00';
        } else {
            time += ' 00:00:00';
        }
        $("#iframe001")[0].contentWindow.search(stationtype, timetype, time, this.childNodes[1].id);

    });


})

//判断传入时间是否大于当前时间
function timeCompare(time) {
    var date = new Date();
    var y = date.getFullYear();
    var M = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    var d = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    var h = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();

    var sTime = time;
    var eTime = y + '-' + M + '-' + d + ' ' + h;
    var start = new Date(sTime.replace("-", "/").replace("-", "/"));
    var end = new Date(eTime.replace("-", "/").replace("-", "/"));
    if (end < start) {
        alert('开始时间不能大于当前时间，请重新选择开始时间！');
        return false;
    }
}

function dateType(i) {
    if (i) {
        $('#startDate1').show();
        $('#startDate2').hide();
        //$('#endDate1').show();
        //$('#endDate2').hide();

    } else {
        $('#startDate2').show();
        $('#startDate1').hide();
        //$('#endDate2').show();
        //$('#endDate1').hide();
    }
}

/* demo执行方法 */

/**
 * 清除图标及搜索框内容
 */
function inputClose() {
    $('#keyword').val('');

    $('#searchBox .inputClose').hide();
    $('#kind').show();
    $('#content').html('');
    $('#content').hide();

    require(["widgets/Tool", "esri/geometry/Extent", "esri/config"], function (Tool, Extent, config) {
        // 清空所有图层
        Tool.clearMapAllGraphicsLayer(map, '', ["boundry", "4", "0", "GL_Widgets_AirQuality_draw_online"]);
    })
}


/** ************************************************ */
/**
 * 搜索按钮
 */
function search() {
    map.graphics.clear();
    //$('#content').hide();
    $('#kind').hide();
    $('#searchBox .inputClose').show();
    var keyword = document.getElementById('keyword').value;

    if (jspanel) {
        jspanel.close();
        // 清除图例
        // map_ClearLegend();
    }
    if (!keyword || keyword.indexOf('十堰') >= 0) {
        alert('请输入搜索关键字或具体的关键字。');
        return;
    }
    //$.getJSON('data.json', function (result) {
    $.post(config.basePathApp + 'searchByKeyWords', { param: 'name=' + keyword + '&offset=0' + '&pagesize=50' }, function (result) {
        $('#content').show();
        try {
            var jsondata = JSON.parse(result);

        } catch (error) {
            var jsondata = [];
        }

        addPoint(jsondata.rows);
        loadTable(jsondata.rows);

        /**
         * 加载搜索结果
         * 
         * @param {*} json 
         */
        function addPoint(json) {
            var kind = { '1': [], '2': [], '3': [] };
            for (var i = 0; i < json.length; i++) {
                //构建必要属性id,name,lon,lat,value
                var type = '' + json[i]["type"] + '';

                var id = json[i]["code"];
                json[i]["p_id"] = id;
                json[i]["p_name"] = json[i]["name"];
                json[i]["p_lon"] = Number(json[i]["lon"]) || 0;
                json[i]["p_lat"] = Number(json[i]["lat"]) || 0;
                json[i]["p_value"] = json[i]['FK_PolluterSuperviseType'] || json[i]['AQI'];
                if (type !== '1') {
                    json[i]["p_urlParam"] = '&time=' + json[i]['monitorTime'] + '&pointType=station';
                }
                kind[type].push(json[i]);

                //"&time=2018-04-10 10:00:00&pointType=station"
                //其他必要属性etc
                //json[i]["p_type"] = params.monitorType || "AQI";
            }
            //type可能的值：ent,air,water

            for (var key in kind) {
                if (key == '1') {
                    var datatype = 'polluter';
                    var htmlType = 'polluter';
                } else if (key == '2') {
                    var datatype = 'air';
                    var htmlType = 'AirQuality';
                } else if (key == '3') {
                    var datatype = 'water';
                    var htmlType = 'AirQuality';
                }

                //构建popWindow参数
                var popWindowUrl = "Panel/" + htmlType + "/InfoWindow.html";
                var popWindowParam = {};
                popWindowParam["popWindowUrl"] = popWindowUrl;
                popWindowParam["urlParam"] = null;
                popWindowParam["popHeight"] = 393;
                popWindowParam["popWidth"] = 530;
                mugis.mapClear.holdLayers(["boundry", "4", "0", "GL_PointCover_overonline", "GL_PointCover_polluter", "GL_PointCover_air", "GL_PointCover_water"]);
                //地图加载点位
                //mugis.mapClear.clearLabels(["ring"]);
                mugis.mapShowPOI.addPOI(datatype, kind[key], popWindowParam);
            }
        }
    })

}

/**
 * 清空搜索结果
 */
function clearResult() {
    if ($('#content').css('display') == 'block') {
        require(["widgets/Tool", "esri/geometry/Extent", "esri/config"], function (Tool, Extent, config) {
            // 清空所有图层
            Tool.clearMapAllGraphicsLayer(map, '', ["boundry", "4", "0", "GL_Widgets_AirQuality_draw_online"]);
        })
    }
    $('#content').html('');
    $('#content').hide();
    $('#kind').show();
    $('#keyword').val('');

}

// $('#keyword').on('input propertychange', function () {
//     var n = $('#keyword').val().length;
//     if (n > 0) {
//         //$('.inputClose').css('display','block');
//         $('.inputClose').show();

//         $('#kind').hide();
//     } else {
//         $('#kind').show();
//         $('.inputClose').hide();
//     }
// });

/**
 * 加载查询到的数据
 * @param {array} data
 */
function loadTable(data) {

    var tableHeight = 450;

    var columns = [
        {
            title: "结果名称",
            field: "name",
            align: "left",
            sortable: true,
            formatter: function (value, e) {
                if (value == null) {
                    return "";
                }
                if (e.type == '1') {
                    var src = 'img/search/wuranyuan.png';
                }
                if (e.type == '2') {
                    var src = './img/search/kqwz.png';
                }
                if (e.type == '3') {
                    var src = './img/search/szwz.png';
                }
                if (e.lon && e.lon > 0) {
                    var iconhtml = '';
                } else {
                    var iconhtml = '<i class="glyphicon glyphicon-remove"></i>';
                }

                return '<img style="width:20px;margin-right:5px;margin-left:15px;" src="' + src + '"><span style="color:#3385FF;">' + value + '</span><div style="font-size:13px;line-height:25px;padding-left:40px;">' + iconhtml + (e.address ? e.address : '') + '</div>';
            }

        }
        //,
        //{
        //    title: "地址",
        //    field: "EntAddress",
        //    align: "center",
        //    sortable: false,
        //    width: '60%'
        //}
    ];
    var dataGrid = coustomTool.craeteDataGrid("#searchTable", null, data, columns, tableHeight, false, searchTableOnClick);

}

/**
 * 搜索结果列表点击
 * @param row 对应的json 数据
 * @param element html
 */
function searchTableOnClick(row, element) {
    var lon = Number(row.lon);
    var lat = Number(row.lat);
    if (lon > 0 && lon > 180) {
        map_CenterAtAndZoom(lon, lat, 6, 3857);
    } else if (lon > 0 && lon < 180) {
        map_CenterAtAndZoom(lon, lat, 6);
    }

    else {
        alert('经纬度不正确');
    }


}

/**
 * //添加风场数据
 * @param {bool} state 
 */
function windyLoad(state) {
    var timeObj = new Date();
    // timeObj.setFullYear(year, parseInt(month) - 1, day);
    // timeObj.setHours(hour);
    var backTime = new Date(timeObj.getTime() - 13 * 60 * 60 * 1000); //数据推迟13小时更新
    var backHour = Math.floor(backTime.getHours() / 6) * 6;    //计算最新预报时间点
    var hourOffset = backTime.getHours() % 6;//预报时间偏移量
    var backMonth = (backTime.getMonth() + 1 < 10) ? "0" + (backTime.getMonth() + 1) : String((backTime.getMonth() + 1));
    var backDay = (backTime.getDate() < 10) ? "0" + backTime.getDate() : String(backTime.getDate());
    var datadate = String(backTime.getFullYear()) + backMonth + backDay + ((backHour < 10) ? "0" + backHour : backHour)
    var filename = datadate + '_00' + hourOffset;


    windDataUrl = config.windDataRoot + "/" + datadate + "/lev_10_m_above_ground/wind_lev_10_m_above_ground_" + filename + ".json";
    //recordFile = '2018030618_002';
    //windDataUrl = config.windDataRoot + "/json/wind_lev_10_m_above_ground_" + recordFile + ".json";
    if (state) {
        createwind(windDataUrl);
        $('#windyspeed').show();
    } else {
        $('#windyspeed').hide();
        try {
            windevent.remove();
            map.infoWindow.hide();
            map.removeLayer(map.getLayer('wind'))
        } catch (e) {
        }
    }
}
function createwind(windDataUrl) {

    // Add raster layer
    if (document.createElement("canvas").getContext) {

        require(["plugins/RasterLayer", "esri/request",], function (RasterLayer, esriRequest) {
            rasterLayer = new RasterLayer(null, {
                opacity: 0.55,
                id: 'wind',
                visible: false
            });
            map.addLayer(rasterLayer);

            windevent = map.on("mouse-move", showWindInfo);
            map.on("extent-change", redraw);
            map.on("resize", function () { });
            map.on("zoom-start", redraw);
            map.on("pan-start", redraw);

            var layersRequest = esriRequest({
                url: windDataUrl,
                content: {},
                handleAs: "json"
            });
            layersRequest.then(
                function (response) {
                    windy = new Windy({ canvas: rasterLayer._element, data: response });
                    redraw();
                }, function (error) {
                    console.log("Error: ", error.message);
                });
        })



    } else {
        dom.byId("map").innerHTML = "This browser doesn't support canvas. Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers";
    }

    function redraw() {

        rasterLayer._element.width = map.width;
        rasterLayer._element.height = map.height;
        windy.stop();
        var extent = map.geographicExtent;
        setTimeout(function () {
            windy.start(
                [[0, 0], [map.width, map.height]],
                map.width,
                map.height,
                [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]]
            );
        }, 500);
    }

    function showWindInfo(evt) {

        try {
            var r = windy.get_my1(evt.screenPoint.x, evt.screenPoint.y);
            var v = r[2].toFixed(3);
            var rod = Math.atan2(r[0], r[1]);
            rod = rod / Math.PI * 180;
            if (rod < 0) {
                rod += 360;
            }
            if (rod > 0 && rod < 22.5) {
                rod = "南风";
            }
            else if (rod >= 22.5 && rod <= 67.5) {
                rod = "西南风";
            }
            else if (rod > 67.5 && rod < 112.5) {
                rod = "西风";
            }
            else if (rod >= 112.5 && rod <= 157.5) {
                rod = "西北风";
            }
            else if (rod > 157.5 && rod < 202.5) {
                rod = "北风";
            }
            else if (rod >= 202.5 && rod <= 247.5) {
                rod = "东北风";
            }
            else if (rod > 247.5 && rod < 292.5) {
                rod = "东风";
            }
            else if (rod >= 292.5 && rod <= 337.5) {
                rod = "东南风";
            }
            else if (rod > 337.5 && rod <= 360) {
                rod = "南风";
            }
            else {
                rod = rod.toFixed(3);
            }

            $('#windyspeed').html("风速：<b>" + v + " m/s</b>" + "<br/>" + "风向：<b>" + rod + "</b>");
        } catch (error) {

        }
        // map.infoWindow.resize(150, 100);
        // map.infoWindow.setContent("风速：<b>" + v + " km/h</b>" + "<br/>" + "风向：<b>" + rod + "</b>");
        // map.infoWindow.setTitle("<font style = 'font-weight:bold'>" + "风场" + "</font>");
        // map.infoWindow.show(evt.mapPoint);
    }
}

/**
 * 获取经纬度数据，生成热力图
 * @param {string} method 接口方法名
 * @param {object} param  参数 
 */
function getPosition(method, p) {

    $.post(config.basePathApp + method, p, function (result) {
        try {
            var data = JSON.parse(result);
        } catch (error) {
            console.log(error.message);
            return;
        }
        //经纬度转换成墨卡托坐标
        for (var index = 0; index < data.length; index++) {
            var element = data[index];
            var pointArray = latLng2WebMercator(element.x, element.y);
            element.x = pointArray[0];
            element.y = pointArray[1];
        }
        if (p.param) {
            $('#app_div span').html('从' + p.param.split('&')[0].substr(10, 20) + '到' + p.param.split('&')[1].substr(8, 20) + '共有' + data.length + '人次登录。');
        }

        createHeatMap(data);
    })
    //createHeatMap(coors);
}


//环境治理
function envConservation() {

    var data = [{
        "total": 76128,
        "EntName": "十堰市氧化塘",
        "EntAddress": "湖北省十堰市张湾区西城开发区138号",
        "y": 32.648188,
        "x": 110.651197,
        "type": "氧化塘"
    }, {

        "EntName": "十堰市氧化塘",
        "LegalPpersonName": null,
        "y": 32.279354,
        "x": 109.956828,
        "type": "氧化塘"

    }, {
        "EntName": "丹江蒿坪镇污水处理厂",
        "y": 32.692445,
        "x": 111.192781,
        "type": '人工快渗'
    }, {

        "EntName": "柳陂镇郧阳岛污水厂",
        "y": 32.802570,
        "x": 110.772867,
        "type": '人工快渗'
    }];

    require(["esri/geometry/Point", "esri/InfoTemplate", "esri/layers/GraphicsLayer", "esri/graphic", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"],
        function (Point, InfoTemplate, GraphicsLayer, Graphic, PictureMarkerSymbol, SimpleLineSymbol, Color) {
            var sfs = new PictureMarkerSymbol('img/points/point.png', 18, 25);
            map.graphics.clear();
            for (var i = 0; i < data.length; i++) {
                var attr = data[i];
                var pt = new Point(data[i].x, data[i].y);
                var graphic = new Graphic(pt, sfs, attr);
                var infoTemplate = new InfoTemplate();
                infoTemplate.setTitle("${EntName}");
                infoTemplate.setContent('<div class="btn-group" role="group" aria-label="..."><div>名称：${EntName}<br>地点：十堰<br>类型：${type}<br>信息：...<div/>');
                graphic.setInfoTemplate(infoTemplate);
                map.graphics.add(graphic);
            }
            //var extent = feature.geometry.getExtent().expand(1.2);
            //map.setExtent(extent);
        });

}

//五大河治理
function riverClick() {
    var url = mapconfig._arcGISServerUrl + '/SYMap/MapServer/61';
    queryLayerByAtribute(url, "NAME = '汉江'", function (featureset) {
        require(["esri/InfoTemplate", "esri/layers/GraphicsLayer", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"],
            function (InfoTemplate, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Color) {
                var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([0, 0, 0, 255]), 0),
                    new Color([115, 200, 235, 255])
                );
                var feature = featureset.features[0];
                feature.symbol = sfs;
                var infoTemplate = new InfoTemplate();
                infoTemplate.setTitle("${NAME}");
                infoTemplate.setContent('<div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-info">清污</button><button type="button" class="btn btn-default">截污</button><button type="button" class="btn btn-default">排污</button></div><div>名称：清污<br>地点：十堰<br>层次：建设中<div/>');

                feature.setInfoTemplate(infoTemplate);
                map.graphics.clear();
                map.graphics.add(feature);

                var extent = feature.geometry.getExtent().expand(1.2);
                map.setExtent(extent);

            });
    });
}


/****/

var idPanel;

// 弹出面板
function popPanel(id, title, width, height, src) {
    // $('#legend').hide();
    var layer = map.getLayer("0");
    if (layer != null || layer != undefined) {
        map.removeLayer(map.getLayer('0'));
    }

    $('#kind').hide();
    //左侧菜单ul取消，影响效果
    $('.liborder ul').css('display', 'none');
    idPanel = id;
    if (id == 'panel_air') {
        //风向
        $("input[name='my']").prop("checked", true);
        layui.form.render("checkbox");
        windyLoad(true);
    }
    //关闭已打开的panel
    if (jsPanel.getPanels().length > 0) {
        for (var index = 0; index < jsPanel.getPanels().length; index++) {
            var panel = jsPanel.getPanels()[index];
            panel.close();
        }
    }

    panel = jsPanel.create({
        id: id,
        headerTitle: "<span style='font-weight:bold;font-size: 16px;'>" + title + "</span>",
        animateIn: 'jsPanelFadeIn',
        position: {
            my: "left-top",
            at: "left-top",
            offsetX: 30,
            offsetY: $(".topbar").height() + 53
        },
        panelSize: {
            width: width,
            height: height
        },
        contentSize: {
            width: width,
            height: height - 30
        },
        resizeit: {
            disable: true
        },
        theme: "primary",
        headerControls: {
            maximize: 'remove',
            normalize: 'remove',
            minimize: 'remove'
            //,smallifyrev:'remove'
        },

        content: '<iframe src="' + src + '"  id="iframe001" style="width: 100%; height:' + (height - 50) + 'px;border:0px solid transparent"></iframe>'
    });
    // 解除地图拖动事件
    $(jspanel).bind('mouseover', function () {

    });
};

document.addEventListener('jspanelloaded', function (params) {
    //清空已打开的时间轴
    try {
        map.removeLayer(map.getLayer('idw_AQI_imgLayer'));
        map.removeLayer(map.getLayer('0'));

    } catch (e) {
    }
    $('#timeBase').html('');
    $('#downlaodGif').hide();
})

// 侦听面板的关闭事件
document.addEventListener("jspanelclosed", function closeHandler(evt) {
    //map.removeLayer(map.getLayer('0'));
    //map.removeLayer(map.getLayer(''));
    //$('#legend').hide();
    var layer = map.getLayer("0");
    if (layer != null || layer != undefined) {
        map.removeLayer(map.getLayer('0'));
    };
    var layer1 = map.getLayer("GL_PointCover_polluterCompany");
    if (layer1 != null || layer1 != undefined) {
        map.removeLayer(map.getLayer('GL_PointCover_polluterCompany'));
    };
    $("input:checkbox").removeAttr("checked");
    // $("input:checkbox").prop("checked", false);
    id = evt.detail;
    $('#div_legend').hide();
    //关闭风向
    $("input[name='my']").prop("checked", false);
    // layui.form.render("checkbox");
    // windyLoad(false);
    //自定义清除
    if (jspanelModelCloseClear) {
        jspanelModelCloseClear(id);
    }
    try {
        if (map.getLayer('riverRender')) {
            map.removeLayer(map.getLayer('riverRender'));
        }
        if (map.getLayer('river')) {
            map.removeLayer(map.getLayer('river'));
        }
    } catch (e) { }


    if (mapzoomChange && mappanChange) {
        mapzoomChange.remove();
        mappanChange.remove();
    }

    if (map.getLayer('river')) {
        map.removeLayer(map.getLayer('river'));
    }
    //隐藏监测项标签
    $('#monitoringValue,#waterMonitoringValue').hide();
    $('#timeBase').hide();
    $('#timeBase').html('');
    $('.inputClose').hide();
    $('#setTime').hide();
    // clearIdwLayer();
    map.graphics.clear();
    bufferPanel = null;
    PanelEvluate = null;//中长期弹出面板清除

    if (id == idPanel || id == 'PanelEvluate') {
        require(["widgets/Tool", "esri/geometry/Extent",
            "esri/config"],
            function (Tool, Extent, config) {
                map.infoWindow.hide();
                map.graphics.clear();
                mugis.mapClear.holdLayers(["boundry", "4", "0", "GL_PointCover_overonline"]);
            });
        // 清除图例
        // map_ClearLegend();
    }
    if (id == 'buffetListPanel') {
        var layers = ["GL_HotPoint", "GL_Widgets_Buffer_point", "GL_Widgets_Buffer_draw", "GL_Widgets_Buffer_point1"];

        for (var i = 0; i < layers.length; i++) {
            if (map.getLayer(layers[i])) {
                map.removeLayer(map.getLayer(layers[i]));
            }
        }
    }
    //清除图层   
    mugis.mapClear.clearLayers(['GL_PointCover_' + id.substring(6, id.length)]);
    coustomTool.clearPicLegend();
});
/** ************************************************ */
/**
 * 搜索按钮
 */
// function search() {
//     map.graphics.clear();
//     $('#content').hide();
//     $('#kind').hide();
//     $('#searchBox .inputClose').show();
//     var keyword = document.getElementById('keyword');
//     if (jspanel) {
//         jspanel.close();
//         // 清除图例
//         map_ClearLegend();
//     }
//     $.getJSON('data.json', function (result) {
//         var json = result;
//         $('#content').show();
//         loadTable(json);

//         // map_AddPointInfoToMap('search', json);

//     })

// }

/**
 * 清空搜索结果
 */
function clearResult() {
    if ($('#content').css('display') == 'block') {
        require(["widgets/Tool", "esri/geometry/Extent", "esri/config"], function (Tool, Extent, config) {
            // 清空所有图层
            Tool.clearMapAllGraphicsLayer(map, '', ["boundry", "4", "0", "GL_Widgets_AirQuality_draw_online"]);
        })
    }
    $('#content').hide();
    $('#kind').show();
    $('#keyword').val('');

}

var eventSource;
//超标数据
function getOverData(url) {

    if (eventSource) {
        eventSource.close();
    }

    if (typeof (EventSource) !== "undefined") {
        eventSource = new EventSource(url);
        eventSource.onopen = function () {
            console.log("连接打开。。。。。。");
        };
        eventSource.onerror = function (e) {
            console.log('error');
        };
        eventSource.onmessage = function (event) {
            try {
                var overent = JSON.parse(event.data);
            } catch (error) {
                var overent = [];
            }
            for (var i = 0; i < overent.length; i++) {
                var id = overent[i]["EntCode"];
                overent[i]["p_id"] = id;
                overent[i]["p_name"] = overent[i]["EntName"];
                overent[i]["p_lon"] = overent[i]["Longitude"] || 0;
                overent[i]["p_lat"] = overent[i]["Latitude"] || 0;
                overent[i]["p_value"] = '';
                overent[i]['p_visibility'] = 1;
                overent[i]["p_urlParam"] = '&EnterCode=' + id + '&hours=24&urlParam=&starttime=2018-02-08%2001:01:06&endtime=2018-02-08%2011:01:06';
            }

            var popWindowUrl = 'Panel/polluter/OverOnLine.html';
            var popWindowParam = {};
            popWindowParam["popWindowUrl"] = popWindowUrl;
            popWindowParam["urlParam"] = null;
            popWindowParam["popWidth"] = 430;
            popWindowParam["popHeight"] = 370;

            //mugis.mapClear.holdLayers(["boundry", "4", "0", "GL_PointCover_overonline"]);
            mugis.mapClear.clearLayers(["GL_PointCover_overonline"]);
            //mugis.mapShowPOI.addPOI("overonline", overent, 'Panel/polluter/OverOnLine.html', '', '&starttime=2018-02-08 01:01:06&endtime=2018-02-08 11:01:06', '', '', '02');
            mugis.mapShowPOI.addPOI("overonline", overent, popWindowParam);
        };
    } else {
        console.log('不支持event source');
    }


}
/**
 * 地图加载完之后回调函数.
 */
function initMapCallback() {
    //初始化地图上的按钮绑定事件
    //initButton();
    ////根据权限删除配置的部分城市
    //initCitys_QX();
    ////权限设置
    //initQuanXian();
    ////初始化mark权限遮盖层
    //mapRegion.hightLightUserMarkRegion(regionCodeSub_QX);
    initToolBar();
    //超标数据
    //getOverData(config.basePathApp + 'Emergency/getOverEnt?params=hours=24');
    require(['esri/layers/FeatureLayer', "esri/layers/MapImageLayer", "esri/layers/MapImage"], function (FeatureLayer, MapImageLayer, MapImage) {

        // var f = new FeatureLayer('http://61.184.93.242:5014/arcgis/rest/services/testsyboundry/MapServer/0', { id: 'boundry' });
        // map.addLayer(f);

        // var mi = new MapImage({
        //     'extent': { 'xmin': 109.430334 , 'ymin': 31.508164 , 'xmax': 111.579849 , 'ymax': 33.273370 , 'spatialReference': { 'wkid': 4326 }},
        //     'href': '无标题.png'
        //   });
        // var imagelayer = new MapImageLayer();
        // imagelayer.addImage(mi);

        //添加专题图
        // var f1 = new FeatureLayer(mapconfig._arcGISServerUrl + '/specialData/MapServer/4', { id: '4', visible: false });
        // var f2 = new FeatureLayer(mapconfig._arcGISServerUrl + '/specialData/MapServer/0', { id: '0', visible: false });
        // map.addLayers([f1, f2]);

    });
    try {


        mugis.mapClear.holdLayers(["boundry", "4", "0", "GL_PointCover_overonline"]);

        map.on('click', function () {

            $('#kind').hide();
        });
    } catch (e) {

    }
}


/**
 * 初始化gis工具.
 * @@param {string} param1 - param_desc.
 * @@return undefined
 */
function initToolBar() {

    try {

        //放大
        document.getElementById("toolZoomIn").onclick = function () {
            var grade = map.getLevel();
            map.setLevel(grade + 1);

            $(".tool_drop").css("display", "none");
            $(this).addClass("active").siblings().removeClass("active");
        };
        //缩小
        document.getElementById("toolZoomOut").onclick = function () {
            var grade = map.getLevel();
            map.setLevel(grade - 1);

            $(".tool_drop").css("display", "none");
            $(this).addClass("active").siblings().removeClass("active");
        };
        //漫游
        document.getElementById("toolPan").onclick = function () {
            tool_draw_clear();
            map.setMapCursor("default");

            $(".tool_drop").css("display", "none");
            $(this).addClass("active").siblings().removeClass("active");
        };
        //全图
        document.getElementById("toolFullExtent").onclick = function () {
            mugis.mapZoom.setFullExtent();
        };
        //打印
        document.getElementById("toolPrint").onclick = function () {
            tool_draw_clear();
            map.setMapCursor("default");
            alert('打印');

            $(".tool_drop").css("display", "none");
            $("#toolPan").addClass("active").siblings().removeClass("active");
        };
        //清除
        document.getElementById("toolClear").onclick = function () {
            tool_draw_clear();
            map.setMapCursor("default");
            mugis.mapClear.clearAll();

            $(".tool_drop").css("display", "none");
            $("#toolPan").addClass("active").siblings().removeClass("active");
        };


        //测距
        document.getElementById("toolMeasure").onclick = function () {
            if ($("#toolMeasure" + "_drop").css("display") == "none") {
                $(".tool_drop").css("display", "none");
                $("#toolMeasure" + "_drop").css("display", "block");
            }
            else {
                $("#toolMeasure" + "_drop").css("display", "none");
            }
            $(this).addClass("active").siblings().removeClass("active");
        };
        //空间查询
        document.getElementById("toolSpaceSearch").onclick = function () {
            if ($("#toolSpaceSearch" + "_drop").css("display") == "none") {
                $(".tool_drop").css("display", "none");
                $("#toolSpaceSearch" + "_drop").css("display", "block");
            }
            else {
                $("#toolSpaceSearch" + "_drop").css("display", "none");
            }
            $(this).addClass("active").siblings().removeClass("active");
        };
        //缓冲查询
        document.getElementById("toolBufferSearch").onclick = function () {
            if ($("#toolBufferSearch" + "_drop").css("display") == "none") {
                $(".tool_drop").css("display", "none");
                $("#toolBufferSearch" + "_drop").css("display", "block");
            }
            else {
                $("#toolBufferSearch" + "_drop").css("display", "none");
            }
            $(this).addClass("active").siblings().removeClass("active");
        };
        //标绘
        document.getElementById("toolPlotting").onclick = function () {
            if ($("#toolPlotting" + "_drop").css("display") == "none") {
                $(".tool_drop").css("display", "none");
                $("#toolPlotting" + "_drop").css("display", "block");
            }
            else {
                $("#toolPlotting" + "_drop").css("display", "none");
            }
            $(this).addClass("active").siblings().removeClass("active");
        };
        //常用工具
        document.getElementById("toolCYGJ").onclick = function () {
            if ($("#toolCYGJ" + "_drop").css("display") == "none") {
                $(".tool_drop").css("display", "none");
                $("#toolCYGJ" + "_drop").css("display", "block");
            }
            else {
                $("#toolCYGJ" + "_drop").css("display", "none");
            }
            $(this).addClass("active").siblings().removeClass("active");
        };



        //构建滑块控件
        $("#slider").slider({
            max: 100,
            min: 0,
            value: 100,
            slide: function (event, ui) {
                $("#sp_slidervalue").text(ui.value);
            }
        });
        //构建数字选择器
        $(".spinner").spinner({
            max: 100,
            min: 1,
            numberFormat: "n"
        });
        //构建提示框
        $('.tip').poshytip({
            className: 'tip-twitter',
            showTimeout: 1,
            alignTo: 'target',
            alignX: 'center',
            offsetY: 8,
            alignY: 'bottom',
            allowTipHover: false,
            fade: false,
            slide: false
        });
        //构建颜色选择器
        $(".colorpicker").minicolors({
            defaultValue: "#ff0000",
            change: function (hex, opacity) {
                if (!hex) {
                    return;
                }
                else {

                    $(this).parent().find(".minicolors-swatch").css("background-color", hex);
                }
            }
        });

    } catch (e) {

    }
}


var measure;
var spaceSearch;
var bufferSearch;
var plot;

//清空绘制状态
function tool_draw_clear() {
    if (measure != undefined) {
        measure.clear();
    }
    if (spaceSearch != undefined) {
        spaceSearch.clear();
    }
    if (bufferSearch != undefined) {
        bufferSearch.clear();
    }
    if (plot != undefined) {
        plot.clear();
    }
}

//测量
function btn_measure(index) {
    tool_draw_clear();
    require(["widgets/Measure"], function (Navigation) {
        measure = new widgets.Measure({
            map: map
        });
        if (index == 0) {
            measure.measure(esri.toolbars.Draw.POLYLINE);
        } else if (index == 1) {
            measure.measure(esri.toolbars.Draw.POLYGON);
        }
    });
}

//空间查询
function btn_ExSpace(index) {
    tool_draw_clear();
    require(["dojo/dom", "widgets/SpaceSearch"], function (dom, SpaceSearch) {

        spaceSearch = new widgets.SpaceSearch({
            map: map
        });
        if (index === 0) {

            spaceSearch.search(esri.toolbars.Draw.EXTENT);
        } else if (index === 1) {
            spaceSearch.search(esri.toolbars.Draw.CIRCLE);
        } else if (index === 2) {
            spaceSearch.search(esri.toolbars.Draw.POLYGON);
        } else if (index === 3) {
            spaceSearch.search(esri.toolbars.Draw.FREEHAND_POLYGON);
        }
    });
}



//动态标绘
function btn_DynamicPlot(index) {
    tool_draw_clear();
    //参数处理
    var graphSize = Number($("#txt_graph").val());
    var bgColor = $("#sp_bgcolor").parent().find(".minicolors-swatch").css("background-color");
    var alph = $("#sp_slidervalue").text();
    var borderSize = Number($("#txt_border").val());
    var borderColor = $("#sp_bordercolor").parent().find(".minicolors-swatch").css("background-color");
    //var graphSize = 25;
    //var bgColor = "rgb(255, 0, 0)";
    //var alph = 100;
    //var borderSize =1;
    //var borderColor = "rgb(255, 0, 0)";

    require(["widgets/DynamicPlot"], function (DynamicPlot) {
        plot = new widgets.DynamicPlot({ map: map, graphSize: graphSize, bgColor: bgColor, alph: alph, borderSize: borderSize, borderColor: borderColor });
        switch (index) {
            case 0:
                plot.draw(esri.toolbars.Draw.POINT);
                break;
            case 1:
                plot.draw(esri.toolbars.Draw.MULTI_POINT);
                break;
            case 2:
                plot.draw(esri.toolbars.Draw.LINE);
                break;
            case 3:
                plot.draw(esri.toolbars.Draw.POLYLINE);
                break;
            case 4:
                plot.draw(esri.toolbars.Draw.POLYGON);
                break;
            case 5:
                plot.draw(esri.toolbars.Draw.FREEHAND_POLYLINE);
                break;
            case 6:
                plot.draw(esri.toolbars.Draw.FREEHAND_POLYGON);
                break;
            case 7:
                plot.draw(esri.toolbars.Draw.ARROW);
                break;
            case 8:
                plot.draw(esri.toolbars.Draw.LEFT_ARROW);
                break;
            case 9:
                plot.draw(esri.toolbars.Draw.RIGHT_ARROW);
                break;
            case 10:
                plot.draw(esri.toolbars.Draw.UP_ARROW);
                break;
            case 11:
                plot.draw(esri.toolbars.Draw.DOWN_ARROW);
                break;
            case 12:
                plot.draw(esri.toolbars.Draw.CIRCLE);
                break;
            case 13:
                plot.draw(esri.toolbars.Draw.ELLIPSE);
                break;
            case 14:
                plot.draw(esri.toolbars.Draw.RECTANGLE);
                break;
            case 15:
                plot.draw(esri.toolbars.Draw.CURVE);
                break;
            case 16:
                plot.draw(esri.toolbars.Draw.BEZIER_CURVE);
                break;
            case 17:
                plot.draw(esri.toolbars.Draw.BEZIER_POLYGON);
                break;
            case 18:
                plot.draw(esri.toolbars.Draw.FREEHAND_ARROW);
                break;
            case 19:
                plot.draw(esri.toolbars.Draw.TRIANGLE);
                break;
        }

    });
}

//全屏
function toggleFullScreen() {
    if (!isFullscreen()) { // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

/**
* [isFullscreen 判断浏览器是否全屏]
* @return [全屏则返回当前调用全屏的元素,不全屏返回false]
*/
function isFullscreen() {
    //全屏Element，不全屏false
    return document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement || false;
}


/**通过canvas生成热力图  */

function heatMapLayerControl(type, bool) {
    // / <summary>
    // / 控制热力图显示与隐藏
    // / </summary>
    // / <param name="bool"></param>
    var layid;
    if (type == "heatMap") { layid = 'heatLayer' }
    if (type == "pointMap") { layid = 'GL_Widgets_PointCover_Law_event' }


    if (bool) {
        if (map.getLayer(layid)) {
            map.getLayer(layid).show();
        }

    } else {
        if (map.getLayer(layid)) {
            map.getLayer(layid).hide();
        }
    }

}

/**
 * 创建热力图
 * @param {array} data 
 */
function createHeatMap(data) {
    // / <summary>
    // / 创建热力图
    // / </summary>
    // / <param name="data">污染源数据</param>


    // var data = [

    // {
    // type: "point",
    // x: 115.86,
    // y: 28.692
    // },

    // ];

    if (!document.getElementById('heatLayer')) {

        $("body").append("<div id='heatLayer'></div>");
    }

    require(["dijit/registry", 'widgets/HeatmapLayer'], function (registry, HeatmapLayer) {

        if (registry.byId("heatLayer")) {
            registry.byId("heatLayer").destroy();
            $("body").append("<div id='heatLayer'></div>");  // bot是上一个节点id,append意思是添加在之后，当然按你的需求来，before,after都可以，这是jquery的东西。
        }

        // create heat layer
        var heatLayer = new HeatmapLayer({
            config: {
                "useLocalMaximum": false,
                "radius": 30,
                "gradient": {

                    0.45: "rgb(000,000,255)",
                    0.55: "rgb(000,255,255)",
                    0.65: "rgb(000,255,000)",
                    0.75: "rgb(255,000,000)",
                    1.00: "rgb(255,000,000)"
                }
            },
            positionField: { x: 'x', y: 'y' },
            "map": map,
            "opacity": 0.85

        }, "heatLayer");

        map.addLayer(heatLayer);
        heatLayer.setData(data);

    });
}


/**
 * 打开视频播放界面
 * @param {*} deviceid 
 */
function openVideoPop(deviceid) {
    var w = 950;
    var h = 500;
    var l = (screen.width - w) / 2;
    var t = (screen.height - h) / 2;
    var s = 'width=' + w + ', height=' + h + ', top=' + t + ', left=' + l;
    s += ",toolbar=no,scrollbars=no,menubar=no,location=no,resizable=no,status=no"

}



/*弹窗*/
function popupDiv(id, title, width, height, src, top, left, htmlstr) {
    if ($('#' + id)[0]) {
        $('#' + id)[0].remove();
    }
    var html = '';
    html += '<div id="' + id + '" style="width:' + width + 'px;height:auto;background-color:#fff;position:absolute;top:' + top + 'px;right:' + left + 'px;z-index:330;" class="popDiv">'

    html += '<div class="title" style="width:100%;height:25px;line-height:25px;background-color:#2DBDBE;color:#fff;font-size:14px;font-weight:bold;user-select:none;">'
    html += '<span  style="padding-left:10px;">'
    html += title;
    html += '</span>';
    html += '<img src="img/close.png" style="margin:5px;float:right;cursor:pointer;"  class="popupDivClose">';
    html += '<img src="img/fanhui_meitu_2.png" style="margin:7px 3px;float:right;cursor:pointer;"class="popupDivShowHide">';
    html += '</div>';
    //html += '<iframe src="' + src + '" style="width:100%;height:calc('+height+'px - 30px);border:none;overflow:hidden;background-color:#fff;">'
    //html += '</iframe>'
    html += htmlstr;
    html += '</div>';
    $('body').append(html);

    divMove(id);

    $('.popupDivShowHide').click(function () {
        var src = $(this).attr('src');
        if (src.indexOf('_2') > -1) {
            $(this).attr('src', 'img/fanhui_meitu_1.png');

        } else {
            $(this).attr('src', 'img/fanhui_meitu_2.png');
        }
        $(this).parent().siblings().slideToggle();
    })
    $('.popupDivClose').click(function () {
        $(this).parent().parent('.popDiv').remove();
        map.infoWindow.hide();
        //清除图层
        var layerids = map.graphicsLayerIds;
        var selectLayerIds = [];
        for (var index = 0; index < layerids.length; index++) {

            if (layerids[index].indexOf('Source') >= 0 || layerids[index] == 'GL_PointCover_HotPoint' || layerids[index].indexOf('GL_Widgets') >= 0 || layerids[index] == 'GL_PointCover_dwpoint') {
                selectLayerIds.push(layerids[index]);
            }
        }
        for (var index = 0; index < selectLayerIds.length; index++) {
            map.removeLayer(map.getLayer(selectLayerIds[index]));

        }

    })
}
function divMove(id) {
    $('#' + id).find('.title').mousedown(function (event) {
        $(this).css('cursor', 'move');
        var isMove = true;
        var abs_x = event.pageX - $('#' + id).offset().left;
        var abs_y = event.pageY - $('#' + id).offset().top;
        $(document).mousemove(function (event) {
            if (isMove) {
                var obj = $('#' + id);
                obj.css({ 'left': event.pageX - abs_x, 'top': event.pageY - abs_y });
            }
        }).mouseup(function () {
            isMove = false;
            $('#' + id).find('.title').css('cursor', 'default');
        });
    });
}


/**
 * 查询溯源数据
 * @param {*} lon 
 * @param {*} lat 
 * @param {*} timestr 
 */
function getSourceData(lon, lat, timestr) {
    map.infoWindow.hide();
    var str = '<table id="data" cellpadding="0" cellspacing="0" border="0" width="100%">';
    popupDiv('resultList', '溯源结果', 270, 530, '', 354, 117, str);
    //查找8个方向的微站列表
    $.get(config.sourceUrl + lon + '&' + lat, {}, function (result) {

        var strhtml = '';
        try {
            for (var i = 0; i < result.length; i++) {
                var element = result[i];
                var name = element['pname'] || element['PointName'];
                strhtml += "<tr style='border:1px  solid #2DBDBE;cursor: pointer;'><td onclick='map_CenterAtAndZoom(" + result[i]['Longitude'] + "," + result[i]['Latitude'] + ",5)'   title='" + "" + "' lon='" + element['Longitude'] + "' lat='" + element['Latitude'] + "'>" + name + '</td></tr>';

                result[i]['p_lon'] = result[i]['Longitude'];
                result[i]['p_lat'] = result[i]['Latitude'];
                result[i]['p_id'] = result[i]['pcode'];
                result[i]['p_name'] = result[i]['pname'];
                result[i]['p_urlParam'] = '&stationcode=' + result[i]['pcode'] + '&timetype=1&timeperiod=1';
            }
            $('#data').html(strhtml);
            //
            mugis.mapShowPOI.addPOI('Source', result, { popWindowUrl: 'Panel/AirQuality/InfoWindow.html', urlParam: '', popWidth: 500, popHeight: 350 }, '');
        } catch (e) {
            $('#data').html('');
            console.log(e.message);
        }
    })
}

/**
 * 控制input的勾选 取消
 * @param {*} inputname 
 * @param {*} valueArr 
 */
function checkContrl(inputname, valueArr) {
    $("input[name='" + inputname + "']").each(function (index, element) {
        var value = $(element).val();
        for (var index = 0; index < valueArr.length; index++) {
            if (value == valueArr[index]) {
                //element.click();
                if (element.checked) {
                    //element.click();
                }

                break;
            }
        }

    })
}


//添加进度加载界面
function addLoading() {
    $('#loadingModal').modal('show');

}

//添加用户行为日志 
function addLog() {

    var param = coustomTool.GetURLParams(parent.location.href);

    $.post('Ashx/httpurl.ashx', { url: config.getUserInfoByLoginName, data: 'loginName=admin' }, function (result) {
        console.log(result);
    })
    var data = { "createUserName": "李开奎", "userAccount": "likaikui", "userId": "95d1109c-817a-4793-8fbd-57306284cd2d", "departmentID": "239d46b8-720b-4ba3-9591-e2c209ed098f", "departmentName": "在线科", "systemName": "资源目录", "module": "首页", "operType": "查看", "operDescription": "查看,实时数据超标预警" };
    $.post('Ashx/httpurl.ashx', { url: config.OperationLog, data: JSON.stringify(data) }, function (result) {
        console.log(result);
    });
}

//我的标绘
var myPlot = {
    myPlotclick: function () {

        var name = parent.location.href.substr(parent.location.href.indexOf('?') + 1, 20).split('=')[1]
        $.get(config.basePathApp + 'getGraphics', { name: name }, function (result) {
            try {
                var json = JSON.parse(result);
                console.log(json);
                require(["esri/graphic", "esri/layers/GraphicsLayer"], function (Graphic, GraphicsLayer) {
                    if (!map.getLayer('plot')) {
                        var glayer = new GraphicsLayer({ id: 'plot' });
                        map.addLayer(glayer);
                    } else {
                        var glayer = map.getLayer('plot');
                    }
                    glayer.clear();
                    var strArry = json[0].graphicStr.split(';')
                    for (var i = 0; i < strArry.length; i++) {
                        var gra = new Graphic(JSON.parse(strArry[i]));
                        glayer.add(gra);
                    }
                });
                this.poltLayerEventInit();

            } catch (e) {
                //alert("暂无标绘信息");
            }

        });
    },

    poltLayerEventInit: function () {

        map.getLayer('plot').on("dbl-click", function (evt) {
            selectGraphic = evt.graphic;
            //event.stop(evt);
            //activateToolbar(evt.graphic);
        });
        map.getLayer('plot').on("click", function (evt) {
            selectGraphic = evt.graphic;
            //点标注	
            /* if (evt.graphic.attributes) {
                if (map.infoWindow.isShowing) {
                    map.infoWindow.hide();
                }
                map.infoWindow.resize(300, 210);
                map.infoWindow.setTitle(evt.graphic.attributes.name);
                //map.infoWindow.setContent('经度：'+evt.graphic.geometry.x+'<br>纬度：'+evt.graphic.geometry.y+'<br>'+"信息：<input id='info' value='"+evt.graphic.attributes.info+"' type='text' />"+"<br><button id='savePointInfo' style='margin-right: 6px;' onclick='savePointInfo()' >保存</button><button id='canclePointInfo' onclick='canclePointInfo()'>取消</button>");
                map.infoWindow.setContent("<span  style='display:inline-block;margin-bottom:5px'>经度：" + evt.graphic.geometry.x + '</span><br><span  style="display:inline-block;margin-bottom:5px">纬度：' + evt.graphic.geometry.y + '</span><br>' + "<span>信息：</span><textarea  style='height:80px;resize:none'  id='info'>" + evt.graphic.attributes.info + "</textarea>" + "<br><button id='savePointInfo' style='margin-right: 6px;' onclick='savePointInfo()' >保存</button><button id='canclePointInfo' onclick='canclePointInfo()'>取消</button>");
                map.infoWindow.show(evt.graphic.geometry);
            } */
        });
    }
}


/****标绘工具****/

var editToolbar;
var selectGraphic = null;

// 动态标绘,使用dynamicplots.js
function btn_Plot(t) {
    require(["dojo/_base/event", "esri/toolbars/edit", "widgets/Extension/DrawEx", "widgets/plotDraw/DrawExt"], function (event, Edit, DrawEx, DrawExt) {

        if (t == 1) {
            if (CYF.Plot.dialog) {
                CYF.Plot.dialog.close();
            }
            return;
        }
        // 初始化军势标绘接口
        if (!CYF.Plot.isload) {
            CYF.Plot.Init(map, DrawEx, DrawExt);
        }
        //初始化工具	
        createEditTool();
        if (CYF.Plot.dialog) {
            CYF.Plot.dialog.close();
        }
        CYF.Plot.dialog = jDialog.dialog({
            title: '态势标绘',
            width: 420,
            height: 200,
            left: 50,
            top: 50,
            //position:'absolute',
            modal: false,
            content: CYF.Plot.Html,
            events: {
                close: function (params) {
                    CYF.Plot.isload = false;
                    CYF.Plot.toolbar.deactivate();
                    CYF.Plot.deactivateDraw();
                }, show: function (params) {

                    $('[data-toggle="tooltip"]').tooltip()
                }
            }
        });
        CYF.Plot.InitEvent();

        //激活编辑工具
        function activateToolbar(graphic) {
            var tool = 0;
            tool = tool | Edit.MOVE | Edit.EDIT_VERTICES | Edit.SCALE | Edit.ROTATE;
            // enable text editing if a graphic uses a text symbol
            if (graphic.symbol.declaredClass === "esri.symbol.TextSymbol") {
                tool = tool | Edit.EDIT_TEXT;
            }
            //specify toolbar options        
            var options = {
                allowAddVertices: true,
                allowDeleteVertices: true,
                uniformScaling: true
            };
            editToolbar.activate(tool, graphic, options);
        }

        function createEditTool() {
            editToolbar = new Edit(map);
            //Activate the toolbar when you click on a graphic
            map.getLayer('plot').on("dbl-click", function (evt) {
                selectGraphic = evt.graphic;
                //event.stop(evt);
                activateToolbar(evt.graphic);
            });
            map.getLayer('plot').on("click", function (evt) {
                selectGraphic = evt.graphic;
                //点标注	
                if (evt.graphic.attributes) {
                    /*if (map.infoWindow.isShowing) {
                         map.infoWindow.hide();
                        
                    } */
                    /*  map.infoWindow.resize(300, 210);
                     map.infoWindow.setTitle(evt.graphic.attributes.name);
                     map.infoWindow.setContent("<span  style='display:inline-block;margin-bottom:5px'>经度：" + evt.graphic.geometry.x + '</span><br><span  style="display:inline-block;margin-bottom:5px">纬度：' + evt.graphic.geometry.y + '</span><br>' + "<span>信息：</span><textarea  style='height:80px;resize:none'  id='info'>" + evt.graphic.attributes.info + "</textarea>" + "<br><button id='savePointInfo' style='margin-right: 6px;' onclick='savePointInfo()' >保存</button><button id='canclePointInfo' onclick='canclePointInfo()'>取消</button>");
                     map.infoWindow.show(evt.graphic.geometry); */
                }
            });
            //poltLayerEventInit();
            //deactivate the toolbar when you click outside a graphic
            map.on("click", function (evt) {
                //selectGraphic=null;
                editToolbar.deactivate();
            });
        }
    });
}
function graphicDel() {
    if (selectGraphic) {
        var r = confirm("确定要删除?");
        if (r == true) {
            map.getLayer('plot').remove(selectGraphic);
            map.getLayer('plot').redraw();
            map.setZoom(map.getZoom());
            if (map.infoWindow.isShowing) {
                map.infoWindow.hide();
            }
        }



    } else {
        alert('请点击要删除的图形');
    }
    selectGraphic = null;
}
//保存当前用户绘制的图形到数据库
function graphicSave() {

    var name = parent.location.href.substr(parent.location.href.indexOf('?') + 1, 20).split('=')[1]
    var graphics = map.getLayer('plot').graphics;

    if (graphics.length) {
        var str = '';
        for (var i = 0; i < graphics.length; i++) {
            str = str + JSON.stringify(graphics[i].toJson()) + ";";
        }

        $.post(config.basePathApp + 'saveGraphics', { name: name, graphicStr: str.substr(0, str.length - 1) }, function (result) {

            if (result[0]) {
                alert('保存成功');
            }
            console.log(result);
        });
    }
}

function savePointInfo() {

    selectGraphic.attributes.info = $('#info').val();
    map.infoWindow.hide();
}

function canclePointInfo() {
    map.infoWindow.hide();
}


var project = {
    // 1土2水3气4其他 
    getProjectByType: function (paramsrt, callback) {
        //  http://zkyt.e2.luyouxia.net:27959/GISWebService/project/getProjectByType
        console.log(config.basePathApp + 'project/getProjectByType');
        $.get(config.basePathApp + 'project/getProjectByType', { params: paramsrt }, function (result) {
            try {
                var json = JSON.parse(result);
                callback(json);
            } catch (e) {
                console.log(e.message);
            }

        })

    }

}



var layerControl = {

    layerclick: function (name) {
        var layer = map.getLayer(name);
        layer.on('click', function (evt) {
            var content = "<div style='line-height: 21px;'>";
            //以下是特例选择水资源保护区时才会展示相应的内容
            Fields = mapconfig.soilent[1].Fields;

            for (var key in Fields) {
                var value = evt.graphic.attributes[key];
                content += Fields[key] + ':<span id="' + key + '">' + value + '</span><br>';
            }
            //map.infoWindow.setTitle(evt.graphic.attributes['NAME'] == ' ' ? '专题图' : evt.graphic.attributes['NAME']);
            map.infoWindow.setContent(content + '</div>');
            map.infoWindow.setTitle('');
            map.infoWindow.resize(300, 400);
            map.infoWindow.show(evt.mapPoint);
        })
    },

    addFeatureLayer: function (url, name) {
        require(['esri/InfoTemplate', 'esri/layers/FeatureLayer'], function (InfoTemplate, FeatureLayer) {
            var flayer = new FeatureLayer(url, {
                showLabels: true,
                outFields: ['*'],
                id: name,
                mode: FeatureLayer.MODE_ONDEMAND
            });
            map.addLayer(flayer);

            if (name == 'soilent') {
                layerControl.layerclick('soilent');
                flayer.on("mouse-over", function (event) {
                    layerControl.mouseOverLayer(event.graphic.geometry, event.graphic.attributes['Name']);
                });
                flayer.on("mouse-out", function () {
                    layerControl.mouseOutLayer();
                });

            }

        })

    },
    removeLayer: function (id) {
        if (map.getLayer(id)) {
            map.removeLayer(map.getLayer(id));
        }
    },
    setGraphicSymbol: function (feature) {

        require(["esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"], function (SimpleFillSymbol, SimpleLineSymbol, Color) {
            var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 2), new Color([255, 0, 0, 0.1])
            );

            feature.setSymbol(sfs);
            map.graphics.add(feature);
        });

    },
    mouseOverLayer: function (geometry, text) {
        map.setMapCursor("pointer");
        //console.log(e.graphic);
        var font = new esri.symbol.Font();
        font.setSize("10pt");
        font.setFamily("宋体");
        var cpoint = geometry;
        var text = new esri.symbol.TextSymbol(text);
        text.setFont(font);
        text.setColor(new dojo.Color([0, 0, 0, 100]));
        text.setOffset(20, -35);

        var labelGraphic = new esri.Graphic(cpoint, text);
        map.graphics.add(labelGraphic);
    },
    mouseOutLayer: function () {
        map.graphics.clear();
        map.setMapCursor("default");
    }
}



function removeMapImageLayer(id) {
    if (map.getLayer(id)) {
        map.removeLayer(map.getLayer(id));
    }
}


//'xmin': 113.0129247,'ymin': 22.726323,'xmax': 113.2219036,'ymax': 22.938153,
/**
 * href,xmin,ymin,xmax,ymax
 */
function addMapImage(imageList, id) {
    require(["esri/layers/MapImageLayer", "esri/layers/MapImage"], function (MapImageLayer, MapImage) {

        if (map.getLayer(id)) {
            layer=map.getLayer(id);
            map.getLayer(id).removeAllImages();
        } else {
            var layer = new MapImageLayer({
                'id': id
            });

            map.addLayer(layer);
        }

        for (let i = 0; i < imageList.length; i++) {
            const mapimg = imageList[i];

            /* code goes here */
            var img = new MapImage({
                'extent': {
                    'xmin': mapimg.xmin,
                    'ymin': mapimg.ymin,
                    'xmax': mapimg.xmax,
                    'ymax': mapimg.ymax,
                    'spatialReference': { 'wkid': 32650 }
                },
                'href': mapimg.href
            });
            layer.addImage(img);
        }
    });
}



var videotest = {

    openNewWindow: function (deviceid) {
        var json = [
            {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 113.122 || 0,
                "p_lat": 22.752 || 0

            },
            {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 112.958 || 0,
                "p_lat": 22.831 || 0

            }, {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 113.398 || 0,
                "p_lat": 22.752 || 0

            }, {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 113.574 || 0,
                "p_lat": 22.832 || 0

            }, {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 113.162 || 0,
                "p_lat": 22.892 || 0

            }, {
                "p_id": "jlrzbh",
                "p_type": "polluterCompany",
                "p_name": "stationName",
                "p_lon": 113.053 || 0,
                "p_lat": 22.805 || 0

            }
        ];


        var popWindowParam = {};
        popWindowParam["popWindowUrl"] = null;
        popWindowParam["urlParam"] = null;
        popWindowParam["popHeight"] = 350;
        popWindowParam["popWidth"] = 310;

        //地图加载点位
        mugis.mapShowPOI.addPOI("video", json, popWindowParam);
    },
    popvideo: function name(params) {
        var w = 800;
        var h = 500;
        var l = (screen.width - w) / 2;
        var t = (screen.height - h) / 2;
        var s = 'width=' + w + ', height=' + h + ', top=' + t + ', left=' + l;
        s += ",toolbar=no,scrollbars=no,menubar=no,location=no,resizable=no,status=no"

        window.open('video.html', "newwin", s);


    }

}


//'xmin': 113.0129247,'ymin': 22.726323,'xmax': 113.2219036,'ymax': 22.938153,
/**
 * href,xmin,ymin,xmax,ymax
 */
function addMapImage(imageList, id) {
    require(["esri/layers/MapImageLayer", "esri/layers/MapImage"], function (MapImageLayer, MapImage) {

        if (map.getLayer(id)) {
            layer=map.getLayer(id);
            map.getLayer(id).removeAllImages();
        } else {
            var layer = new MapImageLayer({
                'id': id
            });
            map.addLayer(layer);
        }

        for (let i = 0; i < imageList.length; i++) {
            const mapimg = imageList[i];

            /* code goes here */
            var img = new MapImage({
                'extent': {
                    'xmin': mapimg.xmin,
                    'ymin': mapimg.ymin,
                    'xmax': mapimg.xmax,
                    'ymax': mapimg.ymax,
                    'spatialReference': { 'wkid': 32650 }
                },
                'href': mapimg.href
            });
            layer.addImage(img);
        }
    });
}


var airModel = {
    getdata: function (params) {
        var canvas = document.createElement('canvas');
        canvas.id = '1234345';
        canvas.width = map.width;
        canvas.height = map.height;
        canvas.style.position = "absolute";
        canvas.style.display = "none";
        map.__container.append(canvas);
        require([
            "widgets/CustomDynamaticLayer", "widgets/CustomRasterLayer",
        ], function (CustomDynamaticLayer, CustomRasterLayer) {
            $.getJSON("./2019_M03.json",{},function(result){

                var data=result.data;
                var width=result.header.rows||Math.sqrt(data.length);
                var height=result.header.coluns||Math.sqrt(data.length);
                var leftbottom=[parseFloat(data[0][0])*1000,parseFloat(data[0][1])*1000];
                var righttop=[parseFloat(data[data.length-1][0])*1000,parseFloat(data[data.length-1][1])*1000];

                var first='GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';
                var second='PROJCS["WGS 84 / UTM zone 50N",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","32650"]]'; 
               
                //leftbottom=proj4(first,second).inverse(leftbottom);
                //righttop=proj4(first,second).inverse(righttop);

                var layer = new CustomDynamaticLayer(map, document.getElementById('1234345'), {
                    dataExtent: { xmin: leftbottom[0],ymin:leftbottom[1],xmax:righttop[0], ymax: righttop[1] }, 
                    width: width, height: height,
                    data:data
                }
                    , { id: 'test', opacity: 0.5 }
                )
                map.addLayer(layer);
    
            });

          
        })

    }
}


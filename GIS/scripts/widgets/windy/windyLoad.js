/**
 * 风场和arcgis分析结果叠加.
 */

//空气分析控制开关
//风场开关
var fcTurn = false;
//等值线开关
var dzxTurn = false;
//区域开关
var qyTurn = false;

//风场数据源种类
var windFile = {
    "10": "lev_10_m_above_ground"
}

//idw插值分析结果路径
var idwPicUrlRoot = "http://120.194.188.56:8005/JNIDW/";
//idw插值结果参数
var idwPicParams = {
    "AQI_idw_pic": {
        "pic_w": 1000,
        "pic_h": 548,
        "piex": 320.107848244894290,
        "Xmin": 12430317.304358810000000,
        "Ymax": 4260469.265789442700000
    },
    "AQI_contour_pic": {
        "pic_w": 1000,
        "pic_h": 548,
        //"piex": 320.107848244893430,
        "piex": 320.107848244894290,
        //"Xmin": 12429250.716357633000000,
        //"Ymax": 4273001.674803260700000
        "Xmin": 12430317.304358810000000,
        "Ymax": 4260469.265789442700000
    }
}

//窗体宽度
var windowWidth = $(window).width();
//每3个小时格得宽度（一天8格*7天）
var liWidth = Math.floor((windowWidth - 80) / 56);
//每小时的宽度（用于点击计算和循环播放）
var rateW = liWidth / 3;


//气象图层初始化页面记载及某一类型图层获取
var weatherLayers = {
    //加载风场
    windLoad: function (time) {
        var windDataUrl = "";
        var windKpa = windFile["10"];  //风场大气压
        var hour = time.substr(11, 2);
        var day = time.substr(8, 2);
        var month = time.substr(5, 2);
        var year = time.substr(0, 4);
        var todayFile = year + month + day;

        var timeObj = new Date();
        timeObj.setFullYear(year, parseInt(month) - 1, day);
        timeObj.setHours(hour);
        var backTime = new Date(timeObj.getTime() - 13 * 60 * 60 * 1000); //数据推迟13小时更新
        var backHour = Math.floor(backTime.getHours() / 6) * 6;    //计算最新预报时间点
        var backMonth = (backTime.getMonth() + 1 < 10) ? "0" + (backTime.getMonth() + 1) : (backTime.getMonth() + 1);
        var backDay = (backTime.getDate() < 10) ? "0" + backTime.getDate() : backTime.getDate();
        var recordFile = backTime.getFullYear() + backMonth + backDay + ((backHour < 10) ? "0" + backHour : backHour);
        var goHour = 0;  //计算从预报时间点往后推的小时数

        if ((backHour + 13) > 24) { //考虑时差
            goHour = parseInt(hour) - (backHour + 13 - 24);
        } else {
            goHour = parseInt(hour) - (backHour + 13);
        }
        var fCount = (goHour < 10) ? "0" + goHour : goHour;

        windDataUrl = config.windDataRoot + "wind/" + recordFile + "/" + windKpa + "/wind_" + windKpa + "_" + recordFile + "_0" + fCount + ".json";
        mapLoaded(windDataUrl, fcTurn);
    },

    //加载区域插值
    idwLoad: function (time) {
        var idwUrl = "", contourUrl = "";
        var monitorText = $(".areaSearch li.aqiactive span").text(); //获取当前监测类型（AQI,PM2.5,PM10....)
        monitorText = "AQI";
        var hour = time.substr(11, 2);
        var day = time.substr(8, 2);
        var month = time.substr(5, 2);
        var year = time.substr(0, 4);

        var nowTime = new Date();
        var nowMinute = nowTime.getMinutes();
        if (nowMinute < 41) {  //插值程序在每小时40分时执行，X点40分后获取当前小时数据
            if (parseInt(hour) == nowTime.getHours()) {
                hour = parseInt(hour) - 1;
                hour = (hour < 10) ? "0" + hour : hour;
            }
        }
        idwUrl = idwPicUrlRoot + monitorText + "/IDW_" + year + month + day + hour + ".png";  //插值图地址
        contourUrl = idwPicUrlRoot + monitorText + "/Contour_" + year + month + day + hour + ".png"; //等值线图地址
        var idwLayerId = "idw_" + monitorText + "_imgLayer";
        var contourLayerId = "contour_" + monitorText + "_imgLayer";
        var idwParam = idwPicParams[monitorText + "_idw_pic"]; //插值图片对角坐标计算参数
        var contourParam = idwPicParams[monitorText + "_contour_pic"];  //等值线图片对角坐标计算参数
        addImageLayerToMap(idwLayerId, idwUrl, idwParam, 0.65, qyTurn); //叠加插值图
        addImageLayerToMap(contourLayerId, contourUrl, idwParam, 1, dzxTurn);//叠加等值线图
    }
};


//是否支持canvas
var canvasSupport;
//风场图层
var rasterLayer;
//风场模型对象new
var windy;

/**
 * 加载风场.
 * @@param {string} param1 - param_desc.
 * @@return undefined
 */
function mapLoaded(url, visibility) {
    //test
    url = "http://120.194.188.56:8112/WeatherData/wind/2018030618/lev_10_m_above_ground/wind_lev_10_m_above_ground_2018030618_002.json";

    require([
        "esri/domUtils", "esri/request",
        "dojo/parser", "dojo/number", "dojo/json", "dojo/dom",
        "dijit/registry", "widgets/windy/plugins/RasterLayer", "esri/layers/WebTiledLayer",
        "esri/config",
        "dojo/domReady!"
    ], function (domUtils, esriRequest,
        parser, number, JSON, dom,
        registry, RasterLayer, WebTiledLayer, esriConfig) {

        //是否支持canvas
        if (canvasSupport == null) {
            canvasSupport = supports_canvas();
        }

        // Add raster layer
        if (canvasSupport) {
            if (rasterLayer == null) {
                rasterLayer = new RasterLayer(null, {
                    opacity: 1,
                    id: "windyLayer"
                });
                map.addLayer(rasterLayer);

                //范围变化就重新绘制
                map.on("extent-change", redraw);
                //点击地图展示点位的风速值
                //map.on("mouse-click", displayWindyVelocity);
            }

            //设置风场图层可见状态
            if (rasterLayer) {
                rasterLayer.setVisibility(visibility);
            }

            //map.on("resize", function () { });
            //map.on("zoom-start", redraw);
            //map.on("pan-start", redraw);

            //获取风场json数据
            var layersRequest = esriRequest({
                url: url,
                usePost: true,
                useProxy: false,
                content: {},
                handleAs: "json"
            });

            //加载风场
            layersRequest.then(
              function (response) {
                  if (windy == null) {
                      windy = new Windy({ canvas: rasterLayer._element, data: response });
                  }
                  else {
                      windy.params.data = response;
                  }
                  redraw();
              }, function (error) {
                  console.log("Error: ", error.message);
              });
        } else {
            //dom.byId("mapCanvas").innerHTML = "This browser doesn't support canvas. Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers";
        }
    });
}

// does the browser support canvas?
function supports_canvas() {
    return !!document.createElement("canvas").getContext;
}

//风场重绘
function redraw() {
    rasterLayer._element.width = map.width;
    rasterLayer._element.height = map.height;
    var extent = map.geographicExtent;

    windy.stop();
    setTimeout(function () {
        windy.start(
          [[0, 0], [map.width, map.height]],
          map.width,
          map.height,
          [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]],
          callback1
        );
    }, 1);

    function callback1() {
        //windy.stop();
        //if (lastLayer) {
        //    map.removeLayer(lastLayer);
        //}
    }
}

//点击地图展示点位的风速值
function displayWindyVelocity(e) {
    alert(e.message);
}














//地图叠加图片
function addImageLayerToMap(layerId, imgUrl, params, opacity, visiable) {
    require([
              'esri/layers/MapImage',
              'esri/layers/MapImageLayer'
    ], function (MapImage, MapImageLayer) {
        var xMin = params.Xmin;
        var xMax = params.Xmin + params.piex * params.pic_w;
        var yMin = params.Ymax - params.piex * params.pic_h;
        var yMax = params.Ymax;
        var img = new MapImage({
            'extent': {
                'xmin': xMin, 'ymin': yMin, 'xmax': xMax, 'ymax': yMax,
                'spatialReference': { 'wkid': 3857 }
            },
            'href': imgUrl
        });
        var imgLayer = new MapImageLayer({
            'id': layerId,
            'opacity': opacity,
            'visible': visiable
        });
        if (map.getLayer(layerId)) { //图层已存在
            if (layerId.indexOf("idw") > -1) {
                var cImageLayer = map.getLayer(layerId);
                cImageLayer.addImage(img);
                var imgs = cImageLayer.getImages();
                if (imgs.length > 3) {
                    for (var i = 0; i < imgs.length - 2; i++) {
                        cImageLayer.removeImage(imgs[i]);
                    }
                }
            } else {
                map.removeLayer(map.getLayer(layerId));
                map.addLayer(imgLayer);
                imgLayer.addImage(img);
            }

        } else {
            map.addLayer(imgLayer);
            imgLayer.addImage(img);
        }
    });
}



//最新时间轴处理
var latestTime = "";
//系统初始化加载获取最新时间的数据-实时监测接口
function getLatestMonitorTime(latestTime) {
    var time = latestTime;
    /*初始化时间轴*/
    getDateArr(latestTime);
    aa(currentDateArr);
    insertDate(chooseNewArr);
    clickMove();
    //加载风场图层
    weatherLayers.windLoad(latestTime);
    //arcgis分析图层
    weatherLayers.idwLoad(latestTime);
}

/*获取当前日期数组*/
var currentDateArr = [];
//var currentTime = [];
function getDateArr(time) {
    var now, month, day, hour;
    if (time) {
        var timeObject = new Date();
        var year = Number(time.split('-')[0]);
        month = Number(time.split('-')[1]);
        day = Number(time.split(' ')[0].split('-')[2]);
        hour = Number(time.split(' ')[1].split(':')[0]);
        timeObject.setFullYear(year, month, day);
        timeObject.setHours(Number(hour));
        now = timeObject;
    } else {
        now = new Date();
        month = Number(now.getMonth() + 1);
        day = Number(now.getDate());
        hour = Number(now.getHours());
        var year = Number(now.getFullYear());
    }
    if (day > 3) {
        var d = day - 3;
        var m = month;
    }
    else {
        if (month == 1 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            if (month == 1) {
                var m = 12;
                year = year - 1;
                var d = day + 31 - 3;
            }
            else {
                var m = month - 1;
                var d = day + 30 - 3;
            }
        }
        if (month == 2 || month == 4 || month == 6 || month == 9 || month == 11) {
            var m = month - 1;
            var d = day + 31 - 3;
        }
        if (month == 3) {
            var m = month - 1;
            if (year % 4 == 0) {
                var d = day + 29 - 3;
            }
            else {
                var d = day + 28 - 3;
            }
        }

    }
    d = d > 9 ? d : '0' + d;
    //day = day > 9 ? day : '0' + day;
    currentDateArr = [];
    currentDateArr.push(year + "-" + m + "-" + d + " " + "00:00:00");
    currentDateArr.push(now.getFullYear() + "-" + month + "-" + day + " " + hour + ":00:00");
    //$('#currentTime').html('监测时间: ' + now.getFullYear() + "-" + month + "-" + day + " " + hour + ":00");
}
/*插入日期*/
function insertDate(arr) {
    console.log(arr);
    for (var i = 0; i < arr.length; i++) {
        $('#timecontainer .date').eq(i).text(arr[i]);
    }
}
///计算
function aa(arr) {
    console.log(arr)
    var chooseDate = arr;
    var starDate = chooseDate[0].slice(0, chooseDate[0].indexOf(" "));
    var endDate = chooseDate[1].slice(0, chooseDate[1].indexOf(" "));
    var ymd = starDate.split("-");
    /*年*/
    var y = Number(ymd[0]);
    /*月*/
    var month = Number(ymd[1]);
    /*日*/
    var satarDay = Number(starDate.slice(-2));
    //console.log(satarDay);
    var endDay = Number(endDate.slice(-2));
    DateDiff(starDate, endDate)
    chooseNewArr = [];

    for (var i = satarDay, j = i; i <= satarDay + 6; i++, j++) {
        //if (((month == 1 || 3 || 5 || 7 || 8 || 10 || 12) && j > 31) || (month == 2 && j > 28) || ((month == 4 || 6 || 9 || 11) && j > 31)) {
        //    month += 1;
        //    j = 1;
        //}
        //if(y%4==0){
        //    if (month == 2 && j > 29) {
        //        month += 1;
        //        j = 1;
        //    }
        //}
        if (month == 2) {
            if (y % 4 == 0 && j > 29) {
                month += 1;
                j = 1;
            }
            else if (j > 28) {
                month += 1;
                j = 1;
            }
        }


        if ((month == 1 && j > 31) || (month == 3 && j > 31) || (month == 5 && j > 31) || (month == 7 && j > 31) || (month == 8 && j > 31) || (month == 10 && j > 31)) {
            month += 1;
            j = 1;

        }
        if ((month == 4 && j > 30) || (month == 6 && j > 30) || (month == 9 && j > 30) || (month == 11 && j > 31)) {
            month += 1;
            j = 1;

        }
        if ((month == 12) && j > 31) {

            month = 1;
            j = 1;
            y = y + 1;
            console.log(y);
        }
        //else {
        //    j += 1;
        //    alert(333);
        //}
        var days = j > 9 ? j : '0' + j;
        if (month > 9) {
            chooseNewArr.push(y + "-" + month + "-" + days);
        }
        else {
            chooseNewArr.push(y + "-" + '0' + month + "-" + days);
        }
    }
    var starHours = Number(chooseDate[0].slice(chooseDate[0].indexOf(" "), chooseDate[0].indexOf(":")));
    var endHours = Number(chooseDate[1].slice(chooseDate[1].indexOf(" "), chooseDate[1].indexOf(":")));
    oli = Math.floor((iDays * 24 + endHours) / 3);
    var aa = (iDays * 24 + endHours) % 3;
    owidth = aa * rateW;
    var bb = Math.floor(starHours / 3);
    var bwidth = starHours % 3 * rateW;
    /*渲染选中的时间段*/
    for (var i = 0 ; i < oli ; i++) {
        $('#timecontainer li').eq(i).css('background', 'red');
    }
    var html = '<div class="bbb"><div class="bar"></div></div>'
    $('#timecontainer li').eq(oli).children('div').replaceWith(html);
    $('#timecontainer li').eq(oli).children('.bbb').css('width', owidth);
    for (var i = 0 ; i < bb ; i++) {
        $('#timecontainer li').eq(i).children('.bar').css('width', liWidth);
    }
    $('#timecontainer li').eq(bb).children('.bar').css('width', bwidth);
    liIndex = bb;
    currentWidth = bwidth;
}
//获取两个时间间隔
function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式
    var aDate, oDate1, oDate2;
    aDate = sDate1.split("-");
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  //转换为yyyy-MM-dd格式
    aDate = sDate2.split("-");
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
    return iDays;  //返回相差天数
}

/*点击时间轴某个时间*/
function clickMove() {
    $('#timecontainer li').click(function (e) {
        var ulIndex = $(this).parent().index();
        var oliIndex = $(this).index();
        liIndex = ulIndex * 8 + oliIndex;
        if (liIndex > oli && oli) {
            liIndex = oli;
        }
        var width = e.clientX - $(this).offset().left;
        currentWidth = Math.ceil(width / rateW) * rateW
        $('#timecontainer li').children('.bar').css('width', '0%');
        for (var i = 0; i < liIndex; i++) {
            $('#timecontainer li').eq(i).children('.bar').css('width', '100%');
        }
        $('#timecontainer li').eq(liIndex).children('.bar').css('width', currentWidth);
        gettime(liIndex);
    });
}

//获取当前时间轴时间(点击时间轴时）
function gettime(i) {
    //console.log(i);
    var date = $('#timecontainer li').eq(i).parent().find('.date').text();
    var cc = i % 8;
    var dd = currentWidth / rateW;
    var hours = cc * 3 + dd;
    hours = hours < 10 ? '0' + hours : hours;
    currentTime = date + " " + hours + ":00:00";
    console.log(currentTime);

    //地图联动点位数据切换
    document.getElementById('iframe_AirQualityHour').contentWindow.stationType.searchFunc.search({ time: currentTime });
    
    weatherLayers.windLoad(currentTime);
    weatherLayers.idwLoad(currentTime);
}
var rootPath;
//页面的访问地址截断，获得页面起始根路径
if (window.location.href.indexOf("?") != -1) {
    rootPath = window.location.href.substr(0, window.location.href.indexOf("?"));
    rootPath = rootPath.substr(0, rootPath.lastIndexOf("/") + 1);
} else {
    rootPath = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1);
}
if (window.location.href.lastIndexOf("?token=") != -1) {
    window.location.href = rootPath;
}
//var agsRoot = 'http://123.160.246.203:6180/arcgis/rest/services';
//var agsRoot = 'http://172.16.2.45:6080/arcgis/rest/services';
var agsRoot = 'http://192.168.43.225:6080/arcgis/rest/services';
var hotLayerService=agsRoot+'/SGVector/MapServer/';
//mapconfig配置信息
//(function (window) {
//gis通用方法入口proxyUrl
mugis = {};
//mapconfig配置信息
mapconfig = {
    //水系河流服务
    riverServerUrl: agsRoot + "/ShiyanRiver/MapServer",
    //水系断面服务
    riverSegmentUrl: agsRoot + "/suyuanRiver/MapServer/0",
    retainLayerIds: ["GL_PointCover_overonline", '0', '1', '2', '3', '4', '5', '6'],

    //页面起始根路径
    rootPath: rootPath,
    //跨域文件
    proxyUrl: "proxy/proxy.ashx",
    //图片资源
    defaultImageUrl: rootPath + "IMG",
    /*地图类型，2地图服务3天地图,4混合*/
    mapType: 2,
    zoom:1,
	center:{"x":407790, "y": 4400070, "spatialReference": {"wkid": 32650 } },//
    /*地图服务地址(矢量、栅格DEM，影像)*/
    vectorMapServerUrl: agsRoot + "/test/bj/MapServer",
    imgMapServerUrl: agsRoot + "/SGImg/MapServer",
    DEMMapServerUrl: agsRoot + "/SGImgWithout/MapServer",
    //几何服务地址
    geometryServer: agsRoot + "/Utilities/Geometry/GeometryServer",
    //打印服务
    mapPrintServerUrl: agsRoot + "/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",

    //地图范围
    extent: {
       
        "xmin": 113.000,
        "ymin": 22.680,
        "xmax": 113.39,
        "ymax": 23.01,
        "spatialReference": { "wkid": 32650 }
    },
   
    //地图加载
    baseMap: {
        //地图加载的默认参数layer,zoom level,center...
    },
    /*敏感点图层配置，图形查询，缓冲查询用*/
    hotLayerList: [{
        selected: true,
        name: "eduction",//教育
        icon: "img/SpaceSearch/eduction.png",
        layerUrl: hotLayerService+"12",
        infoTiledField: "信息",
        infoParam: [{ "label": "名称：", "field": "Name" }, { "label": "类型：", "field": "Ctype" }, { "label": "地址：", "field": "Address" }]
    },
    {
        selected: true,
        name: "medincial",//卫生
        icon: "img/SpaceSearch/medincial.png",//卫生
        layerUrl: hotLayerService+"13",
        infoTiledField: "信息",
        infoParam: [{ "label": "名称：", "field": "Name" }, { "label": "类型：", "field": "Ctype" }, { "label": "地址：", "field": "Address" }]
    }, {
        selected: true,
        name: "government",//党政机关
        icon: "img/SpaceSearch/government.png",
        layerUrl: hotLayerService+"6",
        infoTiledField: "信息",
        infoParam: [{ "label": "名称：", "field": "Name" }, { "label": "类型：", "field": "Ctype" }, { "label": "地址：", "field": "Address" }]
    }, {
        selected: true,
        name: "resident",//居民小区
        icon: "img/SpaceSearch/resident.png",
        layerUrl: hotLayerService+"16",
        infoTiledField: "信息",
        infoParam: [{ "label": "名称：", "field": "Name" }, { "label": "类型：", "field": "Ctype" }, { "label": "地址：", "field": "Address" }]
    },
    {
        selected: true,
        name: "Tourist",//旅游景点
        icon: "img/SpaceSearch/Tourist.png",
        layerUrl: hotLayerService+"14",
        infoTiledField: "信息",
        infoParam: [{ "label": "名称：", "field": "Name" }, { "label": "类型：", "field": "Ctype" }, { "label": "地址：", "field": "Address" }]
    }
    ]
};


//map地图对象信息
mapinfo = {
    map: null,
    initExtent: null,
    panStart: null,
    panEnd: null,

};

//})(window);


var itemOverValue = {
    Ent: '',

    Air: {
        PM25: 75,
        PM10: 150,
        O3: 200,
        SO2: 500,
        NO2: 200,
        CO: 10
    },
    Water: {

        'P': '0.2',
        'PH': '9',
        'NH3': '1.0',
        'DO': '5.0',
        'CODMn': '15',
        'CODcr': '15'
    },
    Noise: {
        '0': { '0': 50, '1': 40 },
        '1': { '0': 55, '1': 45 },
        '2': { '0': 60, '1': 50 },
        '3': { '0': 65, '1': 55 },
        '4': { '0': 70, '1': 55 }
    }
}




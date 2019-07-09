/**
 * 初始化地图.
 */
mugis.mapInit = {
    /*地图类型，1地图服务，2地图容器，3天地图*/
    mapType: 1,

    //esriBasemaps配置（外置）
    esriBasemaps: null,

    /**
    * 初始化地图.
    * @param {function} callback - callback加载完地图之后执行回调函数.
    */
    initMap: function (callback) {
        var _this = this;
        //地图初始化
        require([
            "esri/map","esri/geometry/Point",
            "esri/config",
            "esri/basemaps",
            "esri/dijit/Popup",
            "dojo/dom-class",
            "dojo/dom-construct",
            "esri/layers/ArcGISDynamicMapServiceLayer",
            "esri/layers/ArcGISTiledMapServiceLayer",
            "widgets/TDTLayer",
            "dojo/domReady!"
        ], function (Map,Point, esriConfig, esriBasemaps, Popup, domClass, domConstruct, ArcGISDynamicMapServiceLayer, 
            ArcGISTiledMapServiceLayer, TDTLayer, domReady) {
            //esriConfig默认参数配置
            esriConfig.defaults.io.alwaysUseProxy = false;
            esriConfig.defaults.io.proxyUrl = mapconfig.proxyUrl;

            esriConfig._eventHandlers = new Array();//绑定地图事件句柄数组
            esriConfig._isSearching = false;//判断查询是否结束
            esriConfig.defaults.geometryService = mapconfig.geometryServer;
            esriConfig.defaults.extent = mapconfig.extent;
            esriConfig.defaults.hotLayerList = mapconfig.hotLayerList;
            var centerPoint=new Point(mapconfig.center);
            //Popup
            var popup = new Popup({
                titleInBody: false,
                highlight: false
            }, domConstruct.create("div"));
            domClass.add(popup.domNode, "light");

            //默认地图范围
            mapinfo.initExtent = new esri.geometry.Extent(mapconfig.extent);
            //mapType：mapconfig配置优先,会覆盖this.mapType
            _this.mapType = mapconfig.mapType || _this.mapType;
            var _mapType = _this.mapType;

            //加载arcgis地图
            if (_mapType == 1) {
                mapinfo.map = map = new esri.Map("map", {
                    //center: [-118, 34.5],
                    extent: mapconfig.initExtent,
                    //zoom: 8,
                    slider: false,
                    logo: false,
                    //basemap: "topo",
                });
                //ArcGISTiledMapServiceLayer切片   ArcGISDynamicMapServiceLayer动态
                var VectorMap = new ArcGISTiledMapServiceLayer(mapconfig.vectorMapServerUrl, { id: "baseMap_VEC", visible: true });
                var RasterMap = new ArcGISTiledMapServiceLayer(mapconfig.rasterMapServerUrl, { id: "baseMap_DEM", visible: false });
                var ImgMap = new ArcGISTiledMapServiceLayer(mapconfig.imgMapServerUrl, { id: "baseMap_IMG", visible: false });
                map.addLayer(VectorMap);
                map.addLayer(RasterMap);
                map.addLayer(ImgMap);
            }
            else if (_mapType == 2) {
                /*加载地图容器*/
                esriBasemaps.VEC = {
                    id: "VEC",
                    baseMapLayers: [{
                        url: mapconfig.vectorMapServerUrl
                    }],
                    title: "矢量图"
                };

                esriBasemaps.IMG = {
                    id: "IMG",
                    baseMapLayers: [{
                        url: mapconfig.imgMapServerUrl
                    }],
                    title: "影像图"
                };

                esriBasemaps.DEM = {
                    id: "DEM",
                    baseMapLayers: [{
                        url: mapconfig.DEMMapServerUrl
                    }],
                    title: "影像图"
                };

                mapinfo.map = map = new Map("map", {
                    basemap: esriBasemaps.VEC,
                    center: centerPoint,
                    zoom: mapconfig.zoom,
                    logo: false,
                    slider: false,
                    showLabels: true
                });
                map.on('load',  function () {
                    //airModel.getdata();

                    addMapImage([{
                        href: "gis/dbz.png",
                        xmin: 402840, ymin: 4395120,
                        xmax: 412740, ymax: 4405020
                    }],'airmodel');
                });
            }
            else if (_mapType == 3) {

                mapinfo.map = map = new esri.Map("map", {
                    logo: false,
                    slider: false,
                    center: mapconfig.center,
                    center: mapconfig.center,
                    zoom: mapconfig.zoom,
                });
                _this.addTDTBaseMap("baseMap_VEC");
                callback();

                //加载地图边界（data散点值，非图层）

            } else if (_mapType == 4) {
                if (mapconfig.vectorMapServerUrl) {
                    mapinfo.map = map = new esri.Map("map", {
                        logo: false,
                        slider: false,
                        center: mapconfig.center,
                        zoom: 0,
                        minZoom: 0,
                        maxZoom: 17
                    });
                    //ArcGISTiledMapServiceLayer切片   ArcGISDynamicMapServiceLayer动态
                    var VectorMap = new ArcGISTiledMapServiceLayer(mapconfig.vectorMapServerUrl, { id: "baseMap_VEC", visible: true });
                    map.addLayer(VectorMap);
                }
            }

            /*显示经纬度*/
            dojo.connect(map, "onMouseMove", function (event) {
                $("#PositionBar").html("经度:" + event.mapPoint.x.toFixed(3) + "     纬度:" + event.mapPoint.y.toFixed(3));
            });
            // /*地图比例尺*/
            require(["esri/dijit/Scalebar"], function (Scalebar) {
                var scalebar = new Scalebar({
                    map: map,
                    attachTo: "bottom-right",
                    scalebarUnit: "metric"
                });
                //scalebar.startup();
            });


            /*切换底图*/
            $("#mapType div").on("click", function (e) {
                $("input:checkbox").prop("checked", false);
                $(this).addClass('active');
                $(this).siblings().removeClass('active');
                var type = $(this).attr("name");
                var mapTdt;//地图
                var mapTdtMark;//地图标注
                if (mapconfig.mapType == 2) {

                    if (type == "baseMap_IMG") {
                        map.setBasemap(esriBasemaps.IMG);
                    } else if (type == "baseMap_VEC") {
                        map.setBasemap(esriBasemaps.VEC);
                    }else if(type == "baseMap_DEM"){
                        map.setBasemap(esriBasemaps.DEM);
                    }

                } else {
                    map.destroy();
                    if (type == "baseMap_IMG") {//baseMap_IMG
                        //影像        
                        // 旧  http://t0.tianditu.com/img_c/wmts
                        //新  http://t0.tianditu.com/img_c/wmts
                        map = new esri.Map("map", {
                            logo: false,
                            slider: false,
                            center: mapconfig.center,
                            zoom: 7,
                            minZoom: 0,
                            maxZoom: 17
                        });
                        _this.addTDTBaseMap("baseMap_IMG");
                    } else {
                        map = new esri.Map("map", {
                            logo: false,
                            slider: false,
                            center: mapconfig.center,
                            zoom: mapconfig.zoom,
                            minZoom: 0,
                            maxZoom: 17
                        });
                        //ArcGISTiledMapServiceLayer切片   ArcGISDynamicMapServiceLayer动态
                        var VectorMap = new ArcGISTiledMapServiceLayer(mapconfig.vectorMapServerUrl, { id: "baseMap_VEC", visible: true });
                        map.addLayer(VectorMap);

                    }
                }

            });
        });

        setTimeout(function () {
            callback();
        }, 10);
    },

    /**
     * 加载天地图.
     * @param {string} type - 天地图类型参数(baseMap_VEC,baseMap_DEM,baseMap_IMG).
     */
    addTDTBaseMap: function (type) {
        //矢量（baseMap_VEC）、地形（baseMap_DEM）、影像图（baseMap_IMG）
        var tdt;//地图
        var tdlt;//地图标注
        require([
            "widgets/TDTLayer","widgets/CustomDynamaticLayer","widgets/CustomRasterLayer",
            
        ], function (TDTLayer,CustomDynamaticLayer,CustomRasterLayer) {
            if (type == "baseMap_VEC") {
                //矢量
                var tdt = new TDTLayer("http://t0.tianditu.com/vec_c/wmts", { noteType: "vec_c"});
                tdt.id = type;
                //矢量图标注
                //var tdlt = new TDTLayer("http://t0.tianditu.com/cva_c/wmts", { noteType: "cva_c" });
                //tdlt.id = type + "_labelmark";
            } else if (type == "baseMap_DEM") {
                //地形图（不显示）
                var tdt = new TDTLayer("http://t0.tianditu.cn/ter_c/wmts", { noteType: "ter_c" });
                tdt.id = type;
                //地形图标注
                //var tdlt = new TDTLayer("http://t0.tianditu.com/cta_c/wmts", { noteType: "cta_c" });
                //tdlt.id = type + "_labelmark";
            } else if (type == "baseMap_IMG") {
                //影像  
                var tdt = new TDTLayer("http://t0.tianditu.com/img_c/wmts", { noteType: "img_c" });
                tdt.id = type;
                //影像图标注
                //var tdlt = new TDTLayer("http://t0.tianditu.com/cia_c/wmts", { noteType: "cia_c" });
                //tdlt.id = type + "_labelmark";
            }
            var tdlt = new TDTLayer("http://t0.tianditu.com/cva_c/wmts", { noteType: "cva_c" });
            tdlt.id = type + "_labelmark";
            map.addLayer(tdt, 0);
            map.addLayer(tdlt, 1);

           

            airModel.getdata();

            // var rasterLayer = new CustomRasterLayer(null, {
            //     opacity: 0.55,id:'1234'
            // });
            // map.addLayer(rasterLayer);

        });
    },

    /**
     * 切换底图.
     * @param {string} type - 3种地图类型参数(baseMap_VEC,baseMap_DEM,baseMap_IMG).
     */
    changeBaseMap: function (type) {
        var _mapType = this.mapType;
        if (_mapType == "1") {
            var layerName = map.layerIds;
            for (var i = 0; i < layerName.length; i++) {
                if (layerName[i] == type) {
                    map.getLayer(type).setVisibility(true);
                }
                else {
                    map.getLayer(layerName[i]).setVisibility(false);
                }
            }
        }
        else if (_mapType == "2") {
            if (type == "baseMap_VEC") {
                map.setBasemap(this.esriBasemaps.VEC);
            }
            if (type == "baseMap_IMG") {
                map.setBasemap(this.esriBasemaps.IMG);
            }
            if (type == "baseMap_DEM") {
                map.setBasemap(this.esriBasemaps.DEM);
            }
        }
        else if (_mapType == "3") {
            var layerName = map.layerIds;
            for (var i = layerName.length; i > 0; i--) {
                if (layerName[i - 1].indexOf("baseMap") > -1) {
                    map.removeLayer(map.getLayer(layerName[i - 1]));
                }
            }
            this.addTDTBaseMap(type);
        } else if (_mapType == "4") {
            if (type == "baseMap_IMG") {
                map.setBasemap(this.esriBasemaps.IMG);
            }
        }
    }
};


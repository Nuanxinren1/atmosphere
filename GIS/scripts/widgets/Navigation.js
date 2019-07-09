///////////////////////////////////////////////////////////////////////////
// 地图导航功能模块：
//
//
///////////////////////////////////////////////////////////////////////////
define([
"dojo/_base/declare"
, "dojo/_base/lang"
, "esri/request"
, "esri/toolbars/navigation"
]
, function (declare, lang, esriRequest, Navigation) {
    var map = null;
    var navToolbar = null;
    declare("widgets.Navigation", null, {
        map: null,
        constructor: function (args) {
            dojo.safeMixin(this, args);
            map = this.map;
            navToolbar = new esri.toolbars.Navigation(this.map);
            navToolbar.on("extent-history-change", function () {
                map.setMapCursor("default");
                navToolbar.deactivate();
            });
        },
        zoomIn: function () {
            map.setMapCursor("crosshair");
            navToolbar.activate(Navigation.ZOOM_IN);
        },
        zoomOut: function () {
            map.setMapCursor("crosshair");
            navToolbar.activate(Navigation.ZOOM_OUT);
        },

        fullExtent: function () {
            navToolbar.zoomToFullExtent();
            navToolbar.deactivate();
        },

        zoomToPrevExtent: function () { 
            navToolbar.zoomToPrevExtent();
            navToolbar.deactivate();
        },

        zoomToNextExtent: function () {
            navToolbar.zoomToNextExtent();
            navToolbar.deactivate();
        },

        pan: function () {
            navToolbar.activate(Navigation.PAN);

        }

    });

})
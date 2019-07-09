define([
"dojo/_base/declare"
, "widgets/Tool"
, "esri/layers/FeatureLayer"
, "esri/renderers/HeatmapRenderer"
, "esri/config"
, "esri/Color"
, "esri/tasks/query"
, "esri/tasks/QueryTask"
], function (declare, Tool, FeatureLayer, HeatmapRenderer, config, Color, query, QueryTask) {
    var map = null;
    declare("widgets.HeatmapRenderer", null, {
        constructor: function (args) {
            map = args.map;
        },
        renderer: function (layerUrl, field, blurRadius, maxPixelIntensity, minPixelIntensity) {
      
            Tool.clearMapAllGraphicsLayer(map);
            var query = new esri.tasks.Query();
            //需要返回Geometry
            query.returnGeometry = true;
            //需要返回的字段
            query.outFields = ["*"];
            //查询条件
            query.where = "1=1";
            var queryTask = new QueryTask(layerUrl);
            queryTask.execute(query, showResults);
            //高亮显示查询结果
            function showResults(results) {

                var layerDefinition = {
                    "geometryType": "esriGeometryPoint",
                    "fields": [
                                    {
                                        "name": "FID",
                                        "type": "esriFieldTypeOID",
                                        "alias": "FID"
                                    }
                               ]
                }
                var featureCollection = {
                    layerDefinition: layerDefinition,
                    featureSet: results
                };
                var featureLayer = new FeatureLayer(featureCollection, {
                    id: "heatLayer",
                    mode: FeatureLayer.MODE_SNAPSHOT
                });

                var heatmapRenderer = new HeatmapRenderer({
                    field: field,
                    //colors:["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"],
                    blurRadius: blurRadius,
                    maxPixelIntensity: maxPixelIntensity,
                    minPixelIntensity: minPixelIntensity

                });
                featureLayer.setRenderer(heatmapRenderer);
                map.addLayer(featureLayer);
            }
        }
    });

});
/**
 * Created by chenzpa on 2015/10/30.
 */
define([
    "dojo/_base/declare",
    'esri/geometry/Polygon',
    './cu',
    './comfun'
], function (declare,Polygon,cu,comfun) {
    return declare("plot.ext.cn", [Polygon,cu], {
        aa:[],
        c0: new comfun(),
        constructor: function (pts) {
            console.log("plot.ext.cn");
            this.setPoints(pts);
        },
        setPoints:function(value){
            this.aa = ((value) ? value : []);
            if (this.getFgb() > 1){
                this.fw();
            };
        },
        getPoints:function(){
            return (this.aa);
        },
        setFgd:function(value){
            this.aa = value;
            this.fw();
        },
        getFgd:function(){
            return (this.getPoints().slice());
        },
        getFgb:function(){
            return (this.aa.length);
        },
        getFgc :function(){
            return 1;
        },
        fe :function(point, index){
            if ((((index >= 0)) && ((index < this.getFgb())))){
                this.getPoints()[index] = point;
                this.fw();
            };
        },
        ff:function(point){
            this.getPoints()[(this.getFgb() - 1)] = point;
        },
        fw:function(){

        }
    });
}) ;
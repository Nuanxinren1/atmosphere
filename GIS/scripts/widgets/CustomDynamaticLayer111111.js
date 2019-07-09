define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dojo/dom", "dojo/dom-construct",
    "dojo/query",
    "dojo/dom-style",
    "dojo/on",
    "esri/layers/DynamicMapServiceLayer",
    "esri/geometry/screenUtils",
    "esri/geometry/Point"
], function (
    declare, lang, _WidgetBase, domConstruct, dom, query, domStyle, on, DynamicMapServiceLayer, screenUtils, Point) {
        return declare("CustomDynamaticLayer", DynamicMapServiceLayer, {
            
            
            /**
             * 自定义图层
             * @param {map} map 
             * @param {dom} srcCanvas 
             * @param {obj} config  dataExtent,width,height
             * @param {*} args 
             */
            constructor: function (map,srcCanvas,config, args) {

                this.colors=[[255,255,255,255],[0,0,254,255],[0,75,255,255],[0,255,255,255],[129,181,202,255],
                                [5,109,152,255],[0,212,42,255],[98,255,0,255],[255,252,0,255],[254,0,0,255],[254,0,0,255]
                            ];

                this._map = map;
                this.canvas=srcCanvas;
                this.config=config;
                dojo.safeMixin(this, args);
                //this.inherited(arguments,[args]);
                // this.initialExtent = this.fullExtent = new esri.geometry.Extent({ "xmin": -16476154.32, "ymin": 2504688.54, "xmax": -6457400.14, "ymax": 7514065.62, "spatialReference": { "wkid": 102100 } });
                // this.spatialReference = new esri.SpatialReference({ wkid: 102100 });
                this.loaded = true;
                this.onLoad(this);

            },
            /**
             * 根据周边四个像素插值
             * @param {*} x 距离左下角元素的距离,对应的原图像坐标
             * @param {*} y 
             * @param {*} g00 左下角
             * @param {*} g10 
             * @param {*} g01 
             * @param {*} g11 又上角
             * https://blog.csdn.net/sinat_33718563/article/details/78825971
             */
            interpolate : function (dx, dy, g00, g10, g11,g01) {
               // f（x,y)=f(0,0)(1-x)(1-y)+f(1,0)x(1-y)+f(0,1)(1-x)y+f(1,1)xy
               //源图像mxn，目标图像为axb,目标图像的第（i,j）,
               //源图像对应坐标为（i*m/a,j*n/b）
               return g00*(1-dx)*(1-dy)+g01*(1-dx)*dy+g11*dx*dy+g10*dx*(1-dy);
            },

            getImageUrl: function (extent, width, height, callback) {

               var url= this.createImage(extent);
               callback(url);
                
            },
            createImage:function (mapextent,delta) {
				//var c = document.getElementById(this._element.id)||document.getElementById("map_1234");
                var c=this.canvas;
                var ctx = c.getContext("2d");
                ctx.clearRect(0,0,c.width,c.height);//清除原有的图形

				//var dataExtent={xmin: 112.8279401857,ymax: 22.887016271435547}
				var dataExtent =this.config.dataExtent;
				var dx=(dataExtent.xmin-mapextent.xmin)/map.getResolution();
                var dy=Math.abs(dataExtent.ymax-mapextent.ymax)/map.getResolution();
                
                var srcData=this.config.data;//左下角为0,0
                //一维数组转为二维数组
                var newsrcdata=[];//左上角为0,0
                var newsrcdataMax=0;
                var newsrcdataMin=0;
                for (let i = 0; i < this.config.width; i++) {
                    var values=[];
                    for (let j = 0; j < this.config.height; j++) {
                        var index=(this.config.width-i-1) * this.config.width + j;
                        var value=parseFloat(srcData[index][2]);
                        values.push(value);

                        if (value>newsrcdataMax) {
                            newsrcdataMax=value;
                        } 
                        if (value<newsrcdataMin) {
                             tranformMin=value;
                        } 
                    }
                    newsrcdata[i]=values;
                }

                var newwidth=parseInt( (dataExtent.xmax-dataExtent.xmin)/map.getResolution());
                var newheight=parseInt((dataExtent.ymax-dataExtent.ymin)/map.getResolution());
                


                
                // var xscale=this.config.width/newwidth;
                // var yscale=this.config.height/newheight;
                // console.log('newwidth:'+newwidth+';newheight:'+newheight);

                // var tranformData=[];
                // var tranformMax=0;
                // var tranformMin=0;

                // for (let i = 0; i < newwidth; i++) {
                //     var data=[];
                //     for (let j = 0; j < newheight; j++) {
                //         var srcx = parseInt(i * xscale)
                //         var ddx = i * xscale - srcx;
                //         var srcy = parseInt(j * yscale);
                //         var ddy = j * yscale - srcy;
                //         try {
                //                 //var ss=this.interpolate(ddx,ddy,newsrcdata[srcx][srcy],
                //             //     newsrcdata[srcx][srcy+1],newsrcdata[srcx][srcy+1],
                //             //     newsrcdata[srcx][srcy-1],newsrcdata[srcx-1][srcy-1]
                //             //     );
                //             var newvalue=newsrcdata[srcx][srcy];
                //         } catch (error) {
                //             var newvalue=0;
                //         }
                //         data[j]=newvalue;  
                //         if (newvalue>tranformMax) {
                //             tranformMax=newvalue;
                //         } 
                //         if (newvalue<tranformMin) {
                //             tranformMin=newvalue;
                //         }    
                //     }
                //     tranformData[i]=data;
                // }
                //var imgData = ctx.createImageData(newwidth, newheight);//左上角为0,0
                //测试
                var imgData = ctx.createImageData(this.config.width, this.config.height);
                // var value=this.config.data;
				for (var i = 0; i < imgData.data.length; i += 4) {

                    var nums=i/4;
                    var row=parseInt(nums/newwidth)
                    var col=nums%newwidth;
                    //var valueAtRowCol=tranformData[row][col]||0;
                    var valueAtRowCol=newsrcdata[row][col]||0;

                    //var level=parseInt((valueAtRowCol-tranformMin)*10/(tranformMax-tranformMin)); 
                    var level=parseInt((valueAtRowCol-newsrcdataMin)*10/(newsrcdataMax-newsrcdataMin)); 

                    try {
                        var color=this.colors[level];
                        imgData.data[i + 0] = color[0];
					    imgData.data[i + 1] = color[1];
				 	    imgData.data[i + 2] = color[2];
				 	    imgData.data[i + 3] = color[3];
                    } catch (error) {
                        console.log(level);
                        imgData.data[i + 0] = 0;
					    imgData.data[i + 1] = 0;
				 	    imgData.data[i + 2] = 0;
				 	    imgData.data[i + 3]=0;
                    }
                    
                    
					// imgData.data[i + 0] = 155;
					// imgData.data[i + 1] = 220;
				 	// imgData.data[i + 2] = 0;
				 	// imgData.data[i + 3] = 255;
				}
                
                ctx.putImageData(imgData, dx, dy);
                

                var url=c.toDataURL();
                var img=new Image();
                img.src=url;
                ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
                ctx.scale(3, 3);
                img.onload=function(){
	                ctx.drawImage(img, 100, 100);
                }
                return this.canvas.toDataURL();
			}

        })
    })


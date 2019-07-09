
var coustomTool =
    {
        /*时间插件*/
        layDateChoose: function (id, type) {
            laydate.render({
                elem: id, //指定元素
                type: type
            });

        },
        createPicLegend: function (src) {
            if (document.getElementById('div_legend')) {
                $('#div_legend').remove();
            }
            $("body").append("<div id='div_legend' style='width:261px;height:37px; background: url(" + src + ") no-repeat center; position:absolute;z-index:100; right:175px; bottom:5px; display:none'></div>");
            $("#div_legend").show('slow');
        },

        clearPicLegend: function () {

            var element = $("body").find("#div_legend");
            if (element.length > 0) {
                $(element).remove();
            }

        },

        //加载等待图标
        Loading: function (element, imgSrc) {
            var time = new Date().getTime();
            var top = $(element).offset().top;
            var left = $(element).offset().left;
            var height = $(element).height();
            var width = $(element).width();
            var div = "<div id='div_loading" + time + "' style='position:absolute;z-index:999;top:" + top + "px;left:" + left + "px;width:" + width + "px;height:" + height + "px'>"
                + "<table width='100%' height='100%'><tr><td align='center' valign='middle'><img src='" + imgSrc + "'/></td></tr></table>"
                + "</div>";
            $("body").append(div);
            return "div_loading" + time;
        },
        //卸载等待图标
        UnLoading: function (loadingId) {
            $("#" + loadingId).remove();
        },
        //获取系统日期
        getSystemDate: function (fmt) {
            var time = new Date();
            var year = time.getFullYear();
            var month = (time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
            var day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
            if (fmt) {
                if (fmt == "yyyy-MM") {
                    return year + "年" + month + "月";
                }
            }
            else {
                return year + "年" + month + "月" + day + "日";
            }
        },
        //获取系统日期
        getCurrentTime: function (fmt) {
            var time = new Date();
            var year = time.getFullYear();
            var month = (time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
            var day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
            var hours = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();

            if (fmt) {
                if (fmt == "yyyy-MM-dd HH") {
                    return year + "-" + month + "-" + day + ' ' + hours;
                }
            }
            else {
                return year + "年" + month + "月" + day + "日";
            }
        },

        //获取系统时间
        getSystemTime: function (fmt) {
            if (fmt == undefined) fmt = 'HH:mm:ss';
            var time = new Date();
            var hours = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
            var minutes = time.getMinutes < 10 ? "0" + time.getMinutes() : time.getMinutes();
            var seconds = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
            if (fmt == 'HH')
                return hours + "时";
            else if (fmt == 'HH:mm')
                return hours + "时" + minutes + "分";
            else if (fmt == 'HH:mm:ss')
                return hours + "时" + minutes + "分" + seconds + "秒";
        },
        //获取URL参数
        GetURLParams: function (URL) {
            URL = decodeURI(URL);
            var statrIndex = URL.indexOf('?');
            var paramString = URL.substr(statrIndex + 1);
            var paramObject = null
            if (paramString.indexOf('&') > 0) {
                paramObject = new Object();
                var paramArray = paramString.split('&');
                for (var i = 0; i < paramArray.length; i++) {
                    if (paramString.indexOf('=') > 0) {
                        var objName = paramArray[i].split('=')[0];
                        var objValue = paramArray[i].split('=')[1];
                        paramObject[objName] = objValue;
                    }
                }
            }
            else {
                if (paramString.indexOf('=') > 0) {
                    paramObject = new Object();
                    var objName = paramString.split('=')[0];
                    var objValue = paramString.split('=')[1];
                    paramObject[objName] = objValue;
                }
            }
            return paramObject;
        },
        //获取空气质量等级的颜色与图片
        getAirLveAndColor: function (aqi) {
            var object = {};
            var imgColor;
            var borderColor;
            if (aqi >= 0 && aqi <= 50) {
                imgColor = "airquality/aqi_bgs_1.png";
                borderColor = "#6FBE09";
            }
            else if (aqi > 50 && aqi <= 100) {
                imgColor = "airquality/aqi_bgs_2.png";
                borderColor = "#FBD12A";
            }
            else if (aqi > 100 && aqi <= 150) {
                imgColor = "airquality/aqi_bgs_3.png";
                borderColor = "#FFA641";
            }
            else if (aqi > 150 && aqi <= 200) {
                imgColor = "airquality/aqi_bgs_4.png";
                borderColor = "#EB5B13";
            }
            else if (aqi > 200 && aqi <= 300) {
                imgColor = "airquality/aqi_bgs_5.png";
                borderColor = "#960453";
            }
            else if (aqi > 300) {
                imgColor = "airquality/aqi_bgs_6.png";
                borderColor = "#580422";
            }
            else {
                imgColor = "airquality/aqi_bgs_7.png";
                borderColor = "#8e8e8e";
            }
            object.borderColor = borderColor;
            object.imgColor = imgColor;
            return object;
        },
        //获取空气质量预测等级的颜色与图片
        getAirForecastLveAndColor: function (value) {
            var object = {};
            var imgColor;
            var borderColor;
            if (value == "优") {
                imgColor = "airquality/aqi_bgs_1.png";
                borderColor = "#6FBE09";
            }
            else if (value == "良") {
                imgColor = "airquality/aqi_bgs_2.png";
                borderColor = "#FBD12A";
            }
            else if (value == "轻度污染") {
                imgColor = "airquality/aqi_bgs_3.png";
                borderColor = "#FFA641";
            }
            else if (value == "中度污染") {
                imgColor = "airquality/aqi_bgs_4.png";
                borderColor = "#EB5B13";
            }
            else if (value == "重度污染") {
                imgColor = "airquality/aqi_bgs_5.png";
                borderColor = "#960453";
            }
            else if (value == "严重污染") {
                imgColor = "airquality/aqi_bgs_6.png";
                borderColor = "#580422";
            }
            else {
                imgColor = "airquality/aqi_bgs_7.png";
                borderColor = "#8e8e8e";
            }
            object.borderColor = borderColor;
            object.imgColor = imgColor;
            return object;
        },
        //获取获取水质质量等级的颜色与图片
        getWaterLveAndColor: function (lvl) {

            var object = {};
            var imgColor;
            var borderColor;

            // switch (lvl) {
            //     case 1:
            //         imgColor = "waterquality/water_bgs_1.png";
            //         borderColor = "#14C7F8";
            //         break;
            //     case 2:
            //         imgColor = "waterquality/water_bgs_1.png";
            //         borderColor = "#15AAF1";
            //         break;
            //     case 3:
            //         imgColor = "waterquality/water_bgs_3.png";
            //         borderColor = "#24B362";
            //         break;
            //     case 4:
            //         imgColor = "waterquality/water_bgs_4.png";
            //         borderColor = "#DBA219";
            //         break;
            //     case 5:
            //         imgColor = "waterquality/water_bgs_5.png";
            //         borderColor = "#F97638";
            //         break;
            //     case 6:
            //         imgColor = "waterquality/water_bgs_6.png";
            //         borderColor = "#FF2919";
            //         break;
            //     default:
            //         imgColor = "waterquality/water_bgs_7.png";
            //         borderColor = "#8e8e8e";
            //         break;
            // }
            imgColor = "waterquality/water_bgs_7.png";
            borderColor = "#8e8e8e";

            if (lvl == 1 || lvl == 'I类') {
                imgColor = "waterquality/water_bgs_1.png";
                borderColor = "#14C7F8";
            }
            if (lvl == 2 || lvl == 'II类') {
                imgColor = "waterquality/water_bgs_1.png";
                borderColor = "#15AAF1";
            } if (lvl == 3 || lvl == 'III类') {
                imgColor = "waterquality/water_bgs_3.png";
                borderColor = "#24B362";
            } if (lvl == 4 || lvl == 'IV类') {
                imgColor = "waterquality/water_bgs_4.png";
                borderColor = "#DBA219";
            } if (lvl == 5 || lvl == 'V类') {
                imgColor = "waterquality/water_bgs_5.png";
                borderColor = "#F97638";
            } if (lvl == 6 || lvl == '劣V类') {
                imgColor = "waterquality/water_bgs_6.png";
                borderColor = "#FF2919";
            }

            object.imgColor = imgColor;
            object.borderColor = borderColor;
            return object;
        },
        getSoundLveAndColor: function (lvl) {
            var object = {};
            var imgColor;
            var borderColor;
            switch (lvl) {
                case '0类':
                    imgColor = "waterquality/water_bgs_1.png";
                    borderColor = "#4F4FD3";
                    break;
                case '1类':
                    imgColor = "waterquality/water_bgs_1.png";
                    borderColor = "#4F4FD3";
                    break;
                case '2类':
                    imgColor = "waterquality/water_bgs_3.png";
                    borderColor = "#6FBE09";
                    break;
                case '3类':
                    imgColor = "waterquality/water_bgs_4.png";
                    borderColor = "#FCCE10";
                    break;
                case '4类':
                    imgColor = "waterquality/water_bgs_5.png";
                    borderColor = "#FFA620";
                    break;
                default:
                    imgColor = "waterquality/water_bgs_7.png";
                    borderColor = "#8e8e8e";
                    break;
            }
            object.imgColor = imgColor;
            object.borderColor = borderColor;
            return object;
        },
        //获取[生态环境质量] 指数分级
        getEILvel: function (ei) {
            var object = {};
            var levelText;
            if (ei >= 75) {
                levelText = '优';
            } else if (ei < 75 && ei >= 55) {
                levelText = '良';
            } else if (ei < 55 && ei >= 35) {
                levelText = '一般'
            } else if (ei < 35 && ei >= 20) {
                levelText = '较差';
            } else if (ei < 20) {
                levelText = '差';
            } else {
                levelText = '无';
            }
            object.levelText = levelText;
            return object;
        },
        //获取[生态环境质量]颜色
        getEIColor: function (level) {
            var object = {};
            var color;
            var levelText;
            if (level == '优') {
                color = "#4C7300";
            } else if (level == '良') {
                color = "#4DE600";
            } else if (level == '一般') {
                color = "#ADE890";
            } else if (level == '较差') {
                color = "#EAEA5A";
            } else if (level == '差') {
                color = "#FFD281";
            } else {
                color = "#FFFFFF";
            }
            object.color = color;
            return object;
        },
        //创建datagrid
        craeteDataGrid: function (selector, url, data, columns, height, pagination, onClickRow) {
            

            var gird = $(selector).bootstrapTable({

                method: 'get',
                url: url,
                cache: false,
                height: height,

                pagination: pagination,
                striped: false,
                pageSize: 20,
                pageList: [20, 50],
                search: false,
                showColumns: false,
                showRefresh: false,
                minimumCountColumns: 2,
                columns: columns,
                onClickRow: onClickRow
            });
            gird.bootstrapTable("load", data);
            return gird;
        },




        //创建datagrid,参数以对象形式传进来，返回没有加载数据的datagrid。
        createDataTable: function (selector, addtionOption, onClickRow) {
            var defaultOption = {
                method: 'get',
                cache: false,
                striped: false,
                pageSize: 10,
                pageList: [20, 50, 100],
                search: false,
                showColumns: false,
                showRefresh: false,
                minimumCountColumns: 2,
                onClickRow: onClickRow
            };
            //合并默认参数和附加参数对象
            var options = $.extend(defaultOption, addtionOption);
            var gird = $(selector).bootstrapTable(options);
            return gird;
        },

        //HighChart highchart3D饼图
        HighChart_create3DPie: function (element, title, depth, lable, data, size, colors) {
            $('#' + element).highcharts({
                credits: {
                    enabled: false
                },
                chart: {
                    backgroundColor: null,
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    },
                    margin: [0, 0, 0, 0]
                },
                title: title,
                colors: colors,
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 15,
                        dataLabels: {
                            color: 'white',
                            formatter: function () {
                                var myValue = 0;
                                if (this.total) {
                                    myValue = this.total
                                }
                                if (myValue > 0) {
                                    return '<b>' + myValue + '</b>';
                                }
                                else {
                                    return '';
                                }
                            },
                            distance: -25
                        }
                    }
                },
                series: [{
                    name: '统计值',
                    data: data,
                    size: size
                }
                ],
                yAxis: {
                    gridLineColor: null
                },
                xAxis: {
                    gridLineColor: null
                }
            });
        },
        //HighChart highchart3D柱状图
        HighChart_create3DColumn: function (element, title, depth, lable, data) {
            $('#' + element).highcharts({
                credits: {
                    enabled: false
                },
                chart: {
                    backgroundColor: null,
                    type: 'column',
                    options3d: {
                        enabled: true,
                        alpha: 15,
                        beta: 15,
                        depth: 50,
                        viewDistance: 25
                    },
                    margin: [0, 0, 0, 0]
                },
                legend: {
                    enabled: false
                },
                colors: ['#337EBB', '#CD575C', '#E6B600', '#0098D9', '#2B821D', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
                title: title,
                plotOptions: {
                    column: {
                        depth: 25
                    }
                },
                series: [{
                    data: data
                }
                ],
                yAxis: {
                    gridLineColor: null
                },
                xAxis: {
                    gridLineColor: null
                }
            });
        },

        //HighChart highchart柱状图
        HighChart_createColumn: function (element, title, category, color, data) {
            $('#' + element).highcharts({
                credits: {
                    enabled: false
                },
                chart: {
                    backgroundColor: null,
                    type: 'column',
                    margin: [-10, 0, -20, 0],
                    spacing: [-20, 0, -20, 0]

                },
                legend: {
                    enabled: false
                },
                colors: color,
                title: title,
                series: data,
                yAxis: {
                    gridLineColor: null
                },
                xAxis: {
                    gridLineColor: null,
                    categories: category
                },
                tooltip: {
                    enabled: true
                }
            });
        }
    }

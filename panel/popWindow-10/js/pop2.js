$(function(){
    //有毒物质切换
    $(".minTab").click(function(){
        $(this).addClass("tabActive").siblings().removeClass("tabActive");
    })
    //首要污染物浓度变化折线图
    wrChart("wr")
});
function wrChart(id){
    var wrChart = echarts.init(document.getElementById(id));
    var xData=['2时','4时','6时','8时','10时','12时'];
    var allData= [100, 160, 180, 200, 220, 280];
    var option = {
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            show:false
        },
        grid: {
            top:'10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [{
            type : 'category',
            boundaryGap : false,
            axisLine: {
                lineStyle: {
                    color: '#666'
                }
            },
            axisTick: {
                show: false
            },
            data : xData
        }],
        yAxis : [{
            type : 'value',
            axisLine: {
                lineStyle: {
                    color: '#666'
                }
            },
            axisTick: {
                show: false
            }
        }],
        series : [
            {
                name:'浓度',
                type:'line',
                stack: '',
                smooth: true,
                // label: {
                //     normal: {
                //         show: true,
                //         position: 'top'
                //     }
                // },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(231, 180, 142, 0.9)'
                        }, {
                            offset: 1,
                            color: 'rgba(231, 180, 142, 0.9)'
                        }], false),
                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                        shadowBlur: 10
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgba(231, 180, 142, 1)',
                        borderColor: 'rgba(231, 180, 142, 1)'
                    }
                },
                data:allData
            }
        ]
    };
    wrChart.setOption(option);
    window.addEventListener("resize", function(){
        wrChart.resize();
    });
}
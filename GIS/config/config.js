var rootPath2;
//页面的访问地址截断，获得页面起始根路径
if (window.location.href.indexOf("?") != -1) {
    rootPath2 = window.location.href.substr(0, window.location.href.indexOf("?"));
    rootPath2 = rootPath2.substr(0, rootPath2.lastIndexOf("/") + 1);
} else {
    rootPath2 = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1);
}
if (window.location.href.lastIndexOf("?token=") != -1) {
    window.location.href = rootPath2;
}
//config配置信息
//config配置信息
config = {
    //获取用户信息,,http://192.168.120.232:8080/;;;http://61.184.93.242:5035/
    //userInfo
    getUserInfoByLoginName: 'http://61.184.93.242:5035/Sys_UniversalRights/shiyanService/getUserInfoByLoginName',
    //用户行为
    OperationLog: 'http://61.184.93.242:5036/zyml/operationLog/saveOtherSystemsOperationLog.do',
    gifUrl: 'http://172.16.136.11:8030',
    basePathApp: "http://172.16.2.45:8090/GISWebService/",
    waterIndex:'http://172.16.2.48:8021/server/GIS/WaterCWQI.ashx',//?beginDate=2018-05-01&endDate=2019-12-21
    airPolluter:'http://172.16.2.48:8012/Dust/list',//扬尘接口
    //basePathApp: "http://zkyt.e2.luyouxia.net:27959/GISWebService/",
    sourceUrl: 'http://172.16.137.21:5000/',
    //42030000005F
    //172.16.137.11:9192
    oneEnterInfo: 'http://172.16.2.47:8109/particularInformation/searchEntInfo?PolluteNb=',
	airproxy:'http://172.16.1.210/proxy/Ashx/httpurl.ashx',
    //url连接
    url: { login: rootPath2 + "LoginService.asmx" },
    //风向数据
    //windDataRoot: "./windy",数据在0.97:8013
    windDataRoot: "http://61.184.93.242:5033/wind",
    //插值图片地址
    //idwImageRoot: 'http://172.16.136.11/SYIDW/',
    idwImageRoot: 'http://61.184.93.242:5017/SYIDW/',
    //接口服务地址
    service: {
        hjjcService: rootPath2 + "HJJCService.asmx",
        zxjcService: "",
        yjService: ""
    },
    //使用登录控制
    isUseLogin: true,
    //cookie值
    cookie: {
        tokenCookieName: "GIS_USER_TOKEN",
        cookieExpire: 24
    },
    //文档页面标题
    documentTitle: "地理信息公共服务平台数据展示系统",
    //系统logo后的标题，若logo中带有标题，则设置此值为空字符串
    systemTitle: "地理信息公共服务平台数据展示系统",
    //版权信息
    copyrightText: "Copyright &copy; 2018-{now} 中科宇图科技股份有限公司 All rights reserved.",
    //popPanel弹框配置
    popPanelConfig: {
        "panel_air": { id: "AirQuality", title: "气污染防治", src: "Panel/AirQuality/Default.html", width: 360, height: 480, changeHeight: null },
        "water": { id: "WaterSurface", title: "一张总览图", src: "Panel/WaterQualityHour/Default.html", width: 360, height: 480 },
        "soil": { id: "Soil", title: "土壤污染防治一张图", src: "Panel/Soil/Default.html", width: 360, height: 480 },
        "myphoto": { id: "Myphoto", title: "我的照片", src: "Panel/Myphoto/Default.html", width: 360, height: 480 },
        "radiation": { id: "Radiation", title: "移动源污染防治", src: "Panel/Radiation/Default.html", width: 360, height: 480 },
        "polluter": { id: "polluterCompany", title: "污染源企业", src: "Panel/Polluter/Default.html", width: 360, height: 480 },
        
    }
};
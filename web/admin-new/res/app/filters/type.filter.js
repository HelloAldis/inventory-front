(function () {
  'use strict';
  angular.module('JfjAdmin.filters', [])
    .filter('sexFilter', function () { //性别筛选
      return function (input) {
        return {
          "0": "男",
          "1": "女",
          "2": "不限"
        }[input];
      };
    })
    .filter('authTypeFilter', function () { //设计师认证状态
      return function (input) {
        return {
          "0": "未提交",
          "1": "审核中",
          "2": "已通过",
          "3": "不通过",
          "4": "已违规"
        }[input];
      };
    })
    .filter('decTypeFilter', function () { //装修类别
      return function (input) {
        return {
          "0": "家装",
          "1": "商装",
          "2": "软装"
        }[input];
      };
    })
    .filter('decStyleFilter', function () { //擅长风格
      return function (input) {
        return {
          "0": "欧式",
          "1": "中式",
          "2": "现代",
          "3": "地中海",
          "4": "美式",
          "5": "东南亚",
          "6": "田园"
        }[input];
      };
    })
    .filter('designFeeRangeFilter', function () { //设计费报价
      return function (input) {
        return {
          "0": "50-100",
          "1": "100-200",
          "2": "200-300",
          "3": "300以上"
        }[input];
      };
    })
    .filter('designTypeFilter', function () { //习惯沟通方式
      return function (input) {
        return {
          "0": "不限",
          "1": "表达型",
          "2": "聆听型"
        }[input];
      };
    })
    .filter('designOnlineFilter', function () { //设计师在线状态
      return function (input) {
        return {
          "0": "在线",
          "1": "离线"
        }[input];
      };
    })
    .filter('supervisorOnlineFilter', function () { //设计师在线状态
      return function (input) {
        return {
          "0": "正在监理",
          "1": ""
        }[input];
      };
    })
    .filter('workTypeFilter', function () { //习惯沟通方式
      return function (input) {
        return {
          "0": "设计＋施工(半包)",
          "1": "设计＋施工(全包)",
          "2": "纯设计"
        }[input];
      };
    })
    .filter('houseTypeFilter', function () { //意向接单户型
      return function (input) {
        return {
          "0": "一居",
          "1": "二室",
          "2": "三室",
          "3": "四室",
          "4": "复式",
          "5": "别墅",
          "6": "LOFT",
          "7": "其他"
        }[input];
      };
    })
    .filter('userFilter', function () { //用户类型
      return function (input) {
        return {
          "0": "管理员",
          "1": "业主",
          "2": "设计师"
        }[input];
      };
    })
    .filter('platformFilter', function () { //手机类型
      return function (input) {
        return {
          "0": "Android",
          "1": "iOS"
        }[input];
      };
    })
    .filter('processFilter', function () {
      return function (input) {
        return {
          "0": "量房",
          "1": "开工",
          "2": "拆改",
          "3": "水电",
          "4": "泥木",
          "5": "油漆",
          "6": "安装",
          "7": "竣工"
        }[input];
      };
    })
    .filter('authFilter', function () {
      return function (input) {
        return {
          "0": "审核中",
          "1": "已通过",
          "2": "不通过",
          "3": "已违规"
        }[input];
      };
    })
    .filter('requirementFilter', function () {
      return function (input) {
        return {
          "0": "未预约",
          "1": "已预约无人响应",
          "2": "有响应无人量房",
          "6": "已量房无方案",
          "3": "提交方案但无选定方案",
          "4": "选定方案无配置合同",
          "7": "已配置合同",
          "5": "配置工地",
          "8": "已完成"
        }[input];
      };
    })
    .filter('requirePackageTypeFilter', function () {
      return function (input) {
        return {
          '0': '默认包',
          '1': '365块每平米基础包',
          '2': '匠心尊享包'
        }[input];
      };
    })
    .filter('planFilter', function () {
      return function (input) {
        return {
          "0": "已预约无响应",
          "1": "已拒绝业主",
          "7": "无响应过期",
          "2": "有响应未量房",
          "6": "已量房无方案",
          "8": "无方案过期",
          "3": "已提交方案",
          "4": "方案被拒绝",
          "5": "方案被选中"
        }[input];
      };
    })
    .filter('displayStateFilter', function () {
      return function (input) {
        return {
          "0": "页面隐藏",
          "1": "页面显示"
        }[input];
      };
    })
    .filter('articletypeFilter', function () {
      return function (input) {
        return {
          "0": "大百科",
          "1": "小贴士"
        }[input];
      };
    })
    .filter('userInfoProgress', function () { // 业主详情页装修阶段
      return function (input) {
        return {
          "0": "我想看一看",
          "1": "正在做准备",
          "2": "已经开始装修"
        }[input];
      };
    })
    .filter('fieldstatusFilter', function () {
      return function (input) {
        return {
          '0': '未开工',
          '1': '进行中',
          '2': '已完成',
          '3': '改期申请中',
          '4': '改期同意',
          '5': '改期拒绝'
        }[input];
      };
    })
    .filter('platformFilter', function () {
      return function (input) {
        return {
          '0': '安卓APP',
          '1': 'iOSAPP',
          '2': 'PC web',
          '3': '微信',
          '4': '管理员',
          '5': 'iOS web',
          '6': '安卓 web'
        }[input];
      };
    })
    .filter('fieldsNameFilter', function () {
      return function (input) {
        return {
          "kai_gong": "开工",
          "xcjd": "现场交底",
          "qdzmjcl": "墙地砖面积测量",
          "cgdyccl": "橱柜第一次测量",
          "sgxcl": "石膏线测量",
          "mdbcl": "木地板测量",
          "kgmbslcl": "开关面板数量核算",
          "chai_gai": "拆改",
          "cpbh": "成品保护",
          "ztcg": "主体拆改",
          "qpcc": "墙皮铲除",
          "shui_dian": "水电",
          "sdsg": "水电施工",
          "ntsg": "暖通施工",
          "ni_mu": "泥木",
          "sgxaz": "石膏线安装",
          "cwqfssg": "厨卫全防水施工",
          "cwqdzsg": "厨卫墙地砖施工",
          "ktytzsg": "客厅阳台砖施工",
          "dmzp": "地面找平",
          "ddsg": "吊顶施工",
          "gtsg": "柜体施工",
          "you_qi": "油漆",
          "mqqsg": "木器漆施工",
          "qmrjq": "墙面乳胶漆",
          "an_zhuang": "安装",
          "scaz": "石材安装",
          "jjaz": "洁具安装",
          "cwddaz": "厨卫吊顶安装",
          "wjaz": "五金安装",
          "cgscaz": "橱柜水槽安装",
          "yjzjaz": "烟机灶具安装",
          "mdbmmaz": "木地板木门安装",
          "qzpt": "墙纸铺贴",
          "mbdjaz": "面板灯具安装",
          "snzl": "室内整理",
          "jun_gong": "竣工",
          "dbys": "对比验收"
        }[input];
      };
    })
    .filter('pcUrl', function () { //性别筛选
      return function (url) {
        var port = window.location.port ? ':' + window.location.port : '';
        if (window.location.hostname == 'localhost') {
          return 'http://127.0.0.1' + port + url;
        } else if (window.location.hostname == 'devgod.jianfanjia.com') {
          return 'http://dev.jianfanjia.com' + port + url;
        } else {
          return 'http://www.jianfanjia.com' + url;
        }
      };
    })
    .filter('mobileUrl', function () { //性别筛选
      return function (url) {
        var port = window.location.port ? ':' + window.location.port : '';
        if (window.location.hostname == 'localhost') {
          return 'http://192.168.1.150' + port + url;
        } else if (window.location.hostname == 'devgod.jianfanjia.com') {
          return 'http://devm.jianfanjia.com' + port + url;
        } else {
          return 'http://m.jianfanjia.com' + url;
        }
      };
    });
})();

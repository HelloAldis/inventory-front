(function () {
  angular.module('JfjAdmin.pages.chart.product')
    .controller('ProductChartController', ['$scope', '$rootScope', 'adminStatistic', '$filter', 'queryUtil', 'initData',
      ProductChartController
    ]);

  function ProductChartController($scope, $rootScope, adminStatistic, $filter, queryUtil, initData) {
    function initChartTotalPrice(chart) {
      var ranges = [0, 5, 7, 10, 15, 20];
      chart.ranges = [];
      chart.labels = [];
      chart.series = ['作品数'];
      for (var i = 0; i < ranges.length; i++) {
        if (i == ranges.length - 1) {
          var gte = ranges[i];
          chart.ranges.push({
            range: {
              $gte: gte
            }
          });

          chart.labels.push(gte + '万以上');
        } else {
          var gte = ranges[i];
          var lt = ranges[i + 1];
          chart.ranges.push({
            range: {
              $gte: gte,
              $lt: lt
            }
          });

          chart.labels.push(gte + '万 - ' + lt + '万');
        }
      }

      chart.querys = [];
      chart.querys.push({
        key: 'product',
        querys: queryUtil.genQuerys(chart.ranges, 'total_price')
      });

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          // $scope.loading.loadData = true;
          // $scope.loading.notData = true;
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
          // $scope.loading.loadData = true;
          // $scope.loading.notData = false;
        }
      }, function (resp) {
        //返回错误信息
        chart.loadData = false;
        console.log(resp);
      });
    }

    function initChartHouseArea(chart) {
      var ranges = [0, 80, 120, 150, 200];
      chart.ranges = [];
      chart.labels = [];
      chart.series = ['作品数'];
      for (var i = 0; i < ranges.length; i++) {
        if (i == ranges.length - 1) {
          var gte = ranges[i];
          chart.ranges.push({
            range: {
              $gte: gte
            }
          });

          chart.labels.push(gte + '平米以上');
        } else {
          var gte = ranges[i];
          var lt = ranges[i + 1];
          chart.ranges.push({
            range: {
              $gte: gte,
              $lt: lt
            }
          });

          chart.labels.push(gte + '平米 - ' + lt + '平米');
        }
      }

      chart.querys = [];
      chart.querys.push({
        key: 'product',
        querys: queryUtil.genQuerys(chart.ranges, 'house_area')
      });

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          // $scope.loading.loadData = true;
          // $scope.loading.notData = true;
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
          // $scope.loading.loadData = true;
          // $scope.loading.notData = false;
        }
      }, function (resp) {
        //返回错误信息
        chart.loadData = false;
        console.log(resp);
      });
    }

    function initChartDecType(chart) {
      var now = new Date();
      chart.labels = initData.decType.map(function (obj) {
          return obj['name'];
      });

      var querys = initData.decType.map(function (obj) {
          return {dec_type  : obj['id']};
      });

      chart.querys = [{
        key: 'product',
        querys: querys
      }];

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
        }
      }, function (resp) {
        //返回错误信息

        console.log(resp);
      });
    }

    function initChartHouseType(chart) {
      var now = new Date();
      chart.labels = initData.houseType.map(function (obj) {
          return obj['name'];
      });

      var querys = initData.houseType.map(function (obj) {
          return {house_type  : obj['id']};
      });

      chart.querys = [{
        key: 'product',
        querys: querys
      }];

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
        }
      }, function (resp) {
        //返回错误信息

        console.log(resp);
      });
    }

    function initChartWorkType(chart) {
      var now = new Date();
      chart.labels = initData.workType.map(function (obj) {
          return obj['name'];
      });

      var querys = initData.workType.map(function (obj) {
          return {work_type  : obj['id']};
      });

      chart.querys = [{
        key: 'product',
        querys: querys
      }];

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
        }
      }, function (resp) {
        //返回错误信息

        console.log(resp);
      });
    }

    function initChartDecStyle(chart) {
      var now = new Date();
      chart.labels = initData.decStyle.map(function (obj) {
          return obj['txt'];
      });

      var querys = initData.decStyle.map(function (obj) {
          return {dec_style  : obj['num']};
      });

      chart.querys = [{
        key: 'product',
        querys: querys
      }];

      adminStatistic.statistic_info({
        querys: chart.querys
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          chart.statistic = [];
        } else {
          chart.statistic = resp.data.data;
        }
      }, function (resp) {
        //返回错误信息

        console.log(resp);
      });
    }

    $scope.chart_totalprice = {};
    initChartTotalPrice($scope.chart_totalprice);

    $scope.chart_housearea = {};
    initChartHouseArea($scope.chart_housearea);

    $scope.chart_dectype = {};
    initChartDecType($scope.chart_dectype);

    $scope.chart_housetype = {};
    initChartHouseType($scope.chart_housetype);

    $scope.chart_worktype = {};
    initChartWorkType($scope.chart_worktype);

    $scope.chart_decstyle = {};
    initChartDecStyle($scope.chart_decstyle);
  }
})();

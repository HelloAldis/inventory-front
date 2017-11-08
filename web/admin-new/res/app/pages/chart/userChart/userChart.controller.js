(function () {
  angular.module('JfjAdmin.pages.chart.user')
    .controller('UserChartController', ['$scope', '$rootScope', 'adminStatistic', '$filter', 'queryUtil',
      UserChartController
    ]);

  function UserChartController($scope, $rootScope, adminStatistic, $filter, queryUtil) {
    function initChart1() {
      var now = new Date();
      $scope.timeRanges1 = [];
      $scope.labels1 = [];
      for (var i = 0; i > -12; i--) {
        var gte = queryUtil.getNMonth0Clock(i, now).getTime();
        var lte = queryUtil.getNMonth0Clock(i + 1, now).getTime()
        $scope.timeRanges1.push({
          range: {
            $gte: gte,
            $lte: lte
          }
        });
        $scope.labels1.push($filter('date')(gte, 'yyyy-MM', '+0800'));
      }
      $scope.timeRanges1.reverse();
      $scope.labels1.reverse();

      $scope.querys1 = [{
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges1, 'create_at')
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges1, 'create_at', {
          platform_type: '3'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges1, 'create_at', {
          platform_type: '2'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges1, 'create_at', {
          platform_type: '1'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges1, 'create_at', {
          platform_type: '0'
        })
      }];

      $scope.series1 = ['新增业主用户数', '来自微信', '来自Web', '来自iOS', '来自Android'];
      adminStatistic.statistic_info({
        querys: $scope.querys1
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          // $scope.loading.loadData = true;
          // $scope.loading.notData = true;
          $scope.statistic1 = [];
        } else {
          $scope.statistic1 = resp.data.data;
          // $scope.loading.loadData = true;
          // $scope.loading.notData = false;
        }
      }, function (resp) {
        //返回错误信息
        $scope.loadData = false;
        console.log(resp);
      });
    }

    function initChart2() {
      var now = new Date();
      $scope.timeRanges2 = [];
      $scope.labels2 = [];
      for (var i = 0; i > -30; i--) {
        var gte = queryUtil.getNDay0Clock(i, now).getTime();
        var lte = queryUtil.getNDay0Clock(i + 1, now).getTime()
        $scope.timeRanges2.push({
          range: {
            $gte: gte,
            $lte: lte
          }
        });
        $scope.labels2.push($filter('date')(gte, 'MM－dd', '+0800'));
      }
      $scope.timeRanges2.reverse();
      $scope.labels2.reverse();

      $scope.querys2 = [{
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges2, 'create_at')
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges2, 'create_at', {
          platform_type: '3'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges2, 'create_at', {
          platform_type: '2'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges2, 'create_at', {
          platform_type: '1'
        })
      }, {
        key: 'user',
        querys: queryUtil.genQuerys($scope.timeRanges2, 'create_at', {
          platform_type: '0'
        })
      }];

      $scope.series2 = ['新增业主用户数', '来自微信', '来自Web', '来自iOS', '来自Android'];
      adminStatistic.statistic_info({
        querys: $scope.querys2
      }).then(function (resp) {
        if (resp.data.data.total === 0) {
          // $scope.loading.loadData = true;
          // $scope.loading.notData = true;
          $scope.statistic2 = [];
        } else {
          $scope.statistic2 = resp.data.data;
          // $scope.loading.loadData = true;
          // $scope.loading.notData = false;
        }
      }, function (resp) {
        //返回错误信息
        $scope.loadData = false;
        console.log(resp);
      });
    }

    initChart1();
    initChart2();

  }
})();

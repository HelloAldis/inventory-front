(function () {
  angular.module('JfjAdmin.pages.live')
    .controller('LiveController', [ //装修直播列表
      '$scope', '$rootScope', '$http', '$filter', 'adminShare', '$stateParams', '$location',
      function ($scope, $rootScope, $http, $filter, adminShare, $stateParams, $location) {
        $stateParams.detail = JSON.parse($stateParams.detail || '{}');

        //刷新页面公共方法
        function refreshPage(detail) {
          $location.path('/liveList/' + JSON.stringify(detail));
        }

        //数据加载显示状态
        $scope.loading = {
          loadData: false,
          notData: false
        };
        //分页控件
        $scope.pagination = {
          currentPage: 1,
          totalItems: 0,
          maxSize: 5,
          pageSize: 10,
          pageChanged: function () {
            refreshPage(refreshDetailFromUI($stateParams.detail));
          }
        };

        //从url详情中初始化页面
        function initUI(detail) {
          detail.from = detail.from || 0;
          detail.limit = detail.limit || 10;
          $scope.pagination.pageSize = detail.limit;
          $scope.pagination.currentPage = (detail.from / detail.limit) + 1;
          detail.sort = detail.sort || {
            start_at: -1
          };
          $scope.sort = detail.sort;
        }

        //从页面获取详情
        function refreshDetailFromUI(detail) {
          detail.from = ($scope.pagination.pageSize) * ($scope.pagination.currentPage - 1);
          detail.limit = $scope.pagination.pageSize;
          detail.sort = $scope.sort;
          return detail;
        }

        function loadList(detail) {
          adminShare.search(detail).then(function (resp) {
            //返回信息
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.liveList = resp.data.data.shares;
              $scope.pagination.totalItems = resp.data.data.total;
              $scope.loading.loadData = true;
              $scope.loading.notData = false;
            }
          }, function (resp) {
            //返回错误信息
            console.log(resp);
          })
        }

        //排序
        $scope.sortData = function (sortby) {
          if ($scope.sort[sortby]) {
            $scope.sort[sortby] = -$scope.sort[sortby];
          } else {
            $scope.sort = {};
            $scope.sort[sortby] = -1;
          }
          $scope.pagination.currentPage = 1;
          refreshPage(refreshDetailFromUI($stateParams.detail));
        };

        //初始化UI
        initUI($stateParams.detail);
        //初始化数据
        loadList($stateParams.detail);

        $scope.deleteLive = function (id) {
          if (confirm("你确定要删除吗？删除不能恢复")) {
            adminShare.remove({
              "_id": id
            }).then(function (resp) {
              //返回信息
              if (resp.data.msg === "success") {
                loadList(refreshDetailFromUI($stateParams.detail));
              }
            }, function (resp) {
              //返回错误信息
              console.log(resp);
            })
          }
        }
      }
    ]);
})();

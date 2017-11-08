(function () {
  'use strict';
  angular.module('JfjAdmin.pages.feedback')
    .controller('ImageController', [
      '$scope', '$rootScope', 'adminImage', '$stateParams', '$location',
      function ($scope, $rootScope, adminImage, $stateParams, $location) {
        $scope.config = {
          title: '创建时间过滤：',
          placeholder: '图片ID/用户ID',
          search_word: $scope.search_word
        }

        $scope.delegate = {};

        // 搜索
        $scope.delegate.search = function (search_word) {
          $scope.pagination.currentPage = 1;
          refreshPage(refreshDetailFromUI($stateParams.detail));
        }

        // 重置
        $scope.delegate.clearStatus = function () {
          $scope.pagination.currentPage = 1;
          $scope.dtStart = '';
          $scope.dtEnd = '';
          $scope.config.search_word = undefined;
          $stateParams.detail = {};
          refreshPage(refreshDetailFromUI($stateParams.detail));
        }

        $stateParams.detail = JSON.parse($stateParams.detail || '{}');

        //刷新页面公共方法
        function refreshPage(detail) {
          $location.path('/image/' + JSON.stringify(detail));
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
          if (detail.query) {
            if (detail.query.create_at) {
              if (detail.query.create_at["$gte"]) {
                $scope.dtStart = new Date(detail.query.create_at["$gte"]);
              }

              if (detail.query.create_at["$lte"]) {
                $scope.dtEnd = new Date(detail.query.create_at["$lte"]);
              }
            }

            $scope.config.search_word = detail.search_word;
          }

          detail.from = detail.from || 0;
          detail.limit = detail.limit || 10;
          $scope.pagination.pageSize = detail.limit;
          $scope.pagination.currentPage = (detail.from / detail.limit) + 1;
          detail.sort = detail.sort || {
            create_at: -1
          };
          $scope.sort = detail.sort;
        }

        //从页面获取详情
        function refreshDetailFromUI(detail) {
          var gte = $scope.dtStart ? $scope.dtStart.getTime() : undefined;
          var lte = $scope.dtEnd ? $scope.dtEnd.getTime() : undefined;
          var createAt = gte || lte ? {
            "$gte": gte,
            "$lte": lte
          } : undefined;

          detail.query = detail.query || {};
          detail.query.create_at = createAt;
          detail.search_word = $scope.config.search_word || undefined;
          detail.from = ($scope.pagination.pageSize) * ($scope.pagination.currentPage - 1);
          detail.limit = $scope.pagination.pageSize;
          detail.sort = $scope.sort;
          return detail;
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

        //加载数据
        function loadList(detail) {
          adminImage.search_image(detail).then(function (resp) {
            if (resp.data.data.total == 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.list = [];
            } else {
              $scope.list = resp.data.data.images;
              $scope.pagination.totalItems = resp.data.data.total;
              $scope.loading.loadData = true;
              $scope.loading.notData = false;
            }
          }, function (resp) {
            //返回错误信息
            $scope.loading.loadData = true;
            console.log(resp);
          });
        }
        //初始化UI
        initUI($stateParams.detail);
        //初始化数据
        loadList($stateParams.detail);

        $scope.deleteImage = function (imageid) {
          if (confirm("你确定要删除吗？删除不能恢复")) {
            adminImage.delete_image({
              imageid: imageid
            }).then(function (resp) {
              if (resp.data.msg === "success") {
                loadList(refreshDetailFromUI($stateParams.detail));
              }
            }, function (resp) {
              //返回错误信息
              $scope.loading.loadData = true;
              console.log(resp);
            });
          }
        }
      }
    ]);
})();

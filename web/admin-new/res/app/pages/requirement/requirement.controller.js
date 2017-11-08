(function () {
  angular.module('JfjAdmin.pages.requirement')
    .controller('RequirementController', [
      '$scope', 'toastr', '$stateParams', '$location', 'mutiSelected', 'adminRequirement',
      function ($scope, toastr, $stateParams, $location, mutiSelected, adminRequirement) {
        $scope.authList = [
          {
            id: "0",
            name: '未预约',
            cur: false
          },
          {
            id: "1",
            name: '已预约无人响应',
            cur: false
          },
          {
            id: "2",
            name: '有响应无人量房',
            cur: false
          },
          {
            id: "6",
            name: '已量房无方案',
            cur: false
          },
          {
            id: "3",
            name: '提交方案但无选定方案',
            cur: false
          },
          {
            id: "4",
            name: '选定方案无配置合同',
            cur: false
          },
          {
            id: "7",
            name: '已配置合同',
            cur: false
          },
          {
            id: "5",
            name: '配置工地',
            cur: false
          },
          {
            id: "8",
            name: '已完成',
            cur: false
          }
        ];

        $scope.config = {
          title: '需求提交时间过滤：',
          placeholder: '需求ID/业主ID/地址',
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
          mutiSelected.clearCur($scope.authList);
          $stateParams.detail = {};
          refreshPage(refreshDetailFromUI($stateParams.detail));
        }

        $stateParams.detail = JSON.parse($stateParams.detail || '{}');

        //数据加载显示状态
        $scope.loading = {
          loadData: false,
          notData: false
        };

        //刷新页面公共方法
        function refreshPage(detail) {
          $location.path('/requirement/' + JSON.stringify(detail));
        }

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

            mutiSelected.initMutiSelected($scope.authList, detail.query.status);
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
          detail.query.status = mutiSelected.getInQueryFormMutilSelected($scope.authList);
          detail.query.create_at = createAt;
          detail.search_word = $scope.config.search_word || undefined;
          detail.from = ($scope.pagination.pageSize) * ($scope.pagination.currentPage - 1);
          detail.limit = $scope.pagination.pageSize;
          detail.sort = $scope.sort;
          return detail;
        }

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

        //状态过滤
        $scope.authBtn = function (id) {
          $scope.pagination.currentPage = 1;
          mutiSelected.curList($scope.authList, id);
          refreshPage(refreshDetailFromUI($stateParams.detail));
        };
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
          adminRequirement.search(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.requirements;
              $scope.pagination.totalItems = resp.data.data.total;
              $scope.loading.loadData = true;
              $scope.loading.notData = false;
            }
          }, function (resp) {
            //返回错误信息
            $scope.loadData = false;
            console.log(resp);
          });
        }
        //初始化UI
        initUI($stateParams.detail);
        //初始化数据
        loadList($stateParams.detail);
      }
    ]);
})();

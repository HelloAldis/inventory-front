(function () {
  angular.module('JfjAdmin.pages.plan')
    .controller('PlansController', [
      '$scope', '$rootScope', 'adminPlan', '$stateParams', '$location', 'mutiSelected',
      function ($scope, $rootScope, adminPlan, $stateParams, $location, mutiSelected) {
        $scope.authList = [{
          id: "0",
          name: '已预约无响应',
          cur: false
        }, {
          id: "1",
          name: '已拒绝业主',
          cur: false
        }, {
          id: "7",
          name: '无响应过期',
          cur: false
        }, {
          id: "2",
          name: '有响应未量房',
          cur: false
        }, {
          id: "6",
          name: '已量房无方案',
          cur: false
        }, {
          id: "8",
          name: '无方案过期',
          cur: false
        }, {
          id: "3",
          name: '已提交方案',
          cur: false
        }, {
          id: "4",
          name: '方案被拒绝',
          cur: false
        }, {
          id: "5",
          name: '方案被选中',
          cur: false
        }];

        $scope.config = {
          title: '方案最后更新时间过滤：',
          placeholder: '方案ID/需求ID/业主ID/设计师ID/描述',
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

        //获取url获取json数据
        $stateParams.detail = JSON.parse($stateParams.detail || '{}');

        //刷新页面公共方法
        function refreshPage(detail) {
          $location.path('/plans/' + JSON.stringify(detail));
        }

        //从url详情中初始化页面
        function initUI(detail) {
          if (detail.query) {
            if (detail.query.last_status_update_time) {
              if (detail.query.last_status_update_time["$gte"]) {
                $scope.dtStart = new Date(detail.query.last_status_update_time["$gte"]);
              }

              if (detail.query.last_status_update_time["$lte"]) {
                $scope.dtEnd = new Date(detail.query.last_status_update_time["$lte"]);
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
            request_date: -1
          };
          $scope.sort = detail.sort;
        }

        //从页面获取详情
        function refreshDetailFromUI(detail) {
          var gte = $scope.dtStart ? $scope.dtStart.getTime() : undefined;
          var lte = $scope.dtEnd ? $scope.dtEnd.getTime() : undefined;

          var last_status_update_time = gte || lte ? {
            "$gte": gte,
            "$lte": lte
          } : undefined;

          detail.query = detail.query || {};
          detail.query.status = mutiSelected.getInQueryFormMutilSelected($scope.authList);
          detail.query.last_status_update_time = last_status_update_time;
          detail.search_word = $scope.config.search_word || undefined;
          detail.from = ($scope.pagination.pageSize) * ($scope.pagination.currentPage - 1);
          detail.limit = $scope.pagination.pageSize;
          detail.sort = $scope.sort;
          return detail;
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
          adminPlan.search(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.plans;
              angular.forEach($scope.userList, function (value, key) {
                value.time = parseInt(value._id.substring(0, 8), 16) * 1000;
                angular.forEach($scope.userList, function (value1, key1) {
                  if (value1.requirement.rec_designerids.indexOf(value1.designerid) != -1) {
                    value1.biaoshi = "匹配";
                  } else {
                    value1.biaoshi = "自选";
                  }
                });
              });
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

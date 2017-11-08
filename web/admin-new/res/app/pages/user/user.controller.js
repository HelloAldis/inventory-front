(function () {
  angular.module('JfjAdmin.pages.user')
    .controller('UserController', [
      '$scope', '$state', 'toastr', '$stateParams', '$location', 'adminUser',
      function ($scope, $state, toastr, $stateParams, $location, adminUser) {
        $stateParams.detail = JSON.parse($stateParams.detail || '{}');
        $scope.config = {
          title: '业主注册时间过滤：',
          placeholder: '手机号码/业主名字/业主ID',
          search_word: $scope.search_word
        }
        $scope.delegate = {};
        // 搜索
        $scope.delegate.search = function (search_word) {
            $scope.pagination.currentPage = 1;
            refreshPage(refreshDetailFromUI($stateParams.detail));
          }
          // 清空
        $scope.delegate.clearStatus = function () {
          $scope.pagination.currentPage = 1;
          $scope.dtStart = '';
          $scope.dtEnd = '';
          $scope.config.search_word = undefined;
          $stateParams.detail = {};
          refreshPage(refreshDetailFromUI($stateParams.detail));
        }

        //刷新页面公共方法
        function refreshPage(detail) {
          $location.path('/user/' + JSON.stringify(detail));
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
          detail.search_word = $scope.config.search_word || undefined;
          detail.query.create_at = createAt;
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

        //搜索业主
        $scope.searchBtn = function () {
          $scope.pagination.currentPage = 1;
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
          adminUser.search(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.users;
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

        // 显示添加业主模态框
        $scope.showModel = function () {
          $('.activeModal').modal('show');
          $scope.user = '';
        }

        // 添加业主
        $scope.addUser = function () {
          if ($scope.user) {
            adminUser.addUser($scope.user)
              .then(function (resp) {
                if (resp.data.msg === 'success') {
                  $scope.user.errMsg = '';
                  $('.activeModal').modal('hide');
                  loadList($stateParams.detail);
                } else {
                  $scope.user.errMsg = resp.data.err_msg;
                }
              }, function (err) {
                console.log(err);
              });
          }
        }

        // 提交需求
        $scope.userAddRequirement = function (id, phone) {
          if (phone) {
            $state.go('userAddRequirement', {id: id})
          } else {
            toastr.info('请先绑定手机号');
          }
        }

      }
    ]);
})();

(function () {
  angular.module('JfjAdmin.pages.field')
    .controller('FieldDetailController', [
      '$scope', '$stateParams', 'adminField', '$state',
      function ($scope, $stateParams, adminField, $state) {
        $scope.config = {
          placeholder: '监理姓名',
          search_word: $scope.search_word
        }
        console.log($state.current);

        $scope.delegate = {};

        // 搜索
        $scope.delegate.search = function (search_word) {
          $scope.fieldData();
          $scope.pagination.currentPage = 1;
          loadList(refreshDetailFromUI($stateParams.detail));
        }

        // 重置
        $scope.delegate.clearStatus = function () {
          $scope.fieldData();
          $scope.pagination.currentPage = 1;
          $scope.config.search_word = undefined;
          $stateParams.detail = {};
          loadList(refreshDetailFromUI($stateParams.detail));
        }

        $stateParams.detail = JSON.parse($stateParams.detail || '{}');

        //从url详情中初始化页面
        function initUI(detail) {
          if (detail.query) {
            $scope.config.search_word = detail.search_word;
          }
          detail.from = detail.from || 0;
          detail.limit = detail.limit || 10;
          $scope.pagination.pageSize = detail.limit;
          $scope.pagination.currentPage = (detail.from / detail.limit) + 1;
        }

        //从页面获取详情
        function refreshDetailFromUI(detail) {
          detail.query = detail.query || {};
          detail.search_word = $scope.config.search_word || undefined;
          detail.from = ($scope.pagination.pageSize) * ($scope.pagination.currentPage - 1);
          detail.limit = $scope.pagination.pageSize;
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
            loadList(refreshDetailFromUI($stateParams.detail));
          }
        };

        // 工地管理详情数据
        $scope.fieldData = function () {
          adminField.search({
            "query": {
              '_id': $stateParams.id
            },
            "from": 0,
            "limit": 1
          })
          .then(function (resp) {
            if (resp.data.data.total === 1) {
              $state.current.title = resp.data.data.processes[0].basic_address;
              $scope.processes = resp.data.data.processes[0];
              $scope.hasAssigned = $scope.processes.supervisorids;
              $scope.loading.loadData = true;
              $scope.getNameAssigned($scope.hasAssigned);
              loadList($stateParams.detail);
            }
          }, function (err) {
            console.log(err);
          });
        }

        // 获取该工地已指派监理列表
        $scope.getNameAssigned = function (arrId) {
          adminField.searchSupervisor({
            "query":{
              "_id":{
                "$in": arrId || []
              }
            }
          })
          .then(function (res) {
            $scope.nameList = res.data.data.supervisors;
          }, function (err) {
            console.log(err);
          })
        }

        //加载监理列表数据
        function loadList(detail) {
          adminField.searchSupervisor(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.supervisors;
              $scope.pagination.totalItems = resp.data.data.total;
              $scope.loading.loadData = true;
              $scope.loading.notData = false;
              if ($scope.hasAssigned) {
                $scope.userList.forEach(function(supervisor) {
                  $scope.hasAssigned.forEach(function(id){
                    if (supervisor._id === id) {
                      supervisor.isAssign = true;
                    }
                  })
                })
              }
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
        $scope.fieldData();

        // 操作监理
        $scope.operateSupervisor = function (item) {
          if (item.isAssign) {
            $scope.unassignSupervisor(item);  // 移除监理
          } else {
            $scope.assignSupervisor(item);   // 添加监理
          }
        }

        $scope.assignSupervisor = function (item) {
          adminField.assignSupervisor({
            "processid": $stateParams.id,
            "supervisorids": [item._id]
          }).then(function (res) {
            item.isAssign = true;
            $scope.fieldData();
          }, function (err) {
            console.log(err);
          })
        }

        $scope.unassignSupervisor = function (item) {
          adminField.unassignSupervisor({
            "processid": $stateParams.id,
            "supervisorids": [item._id]
          }).then(function (res) {
            item.isAssign = undefined;
            $scope.fieldData();
          }, function (err) {
            console.log(err);
          })
        }
      }
    ]);
})();

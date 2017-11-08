(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerController', [ //设计师列表
      '$scope', '$rootScope', '$uibModal', 'adminDesigner', '$stateParams', '$location', 'mutiSelected',
      function ($scope, $rootScope, $uibModal, adminDesigner, $stateParams, $location, mutiSelected) {
        $scope.authOnlineList = [
          {
            id: "0",
            name: '在线',
            cur: false
          },
          {
            id: "1",
            name: '离线',
            cur: false
          }
        ];

        $scope.authList = [
          {
            id: "0",
            name: '未提交',
            cur: false
          }, {
            id: "1",
            name: '审核中',
            cur: false
          }, {
            id: "2",
            name: '已通过',
            cur: false
          }, {
            id: "3",
            name: '不通过',
            cur: false
          }, {
            id: "4",
            name: '已违规',
            cur: false
          }
        ];

        $scope.uidAuthList = [
          {
            id: "0",
            name: '未提交',
            cur: false
          }, {
            id: "1",
            name: '审核中',
            cur: false
          }, {
            id: "2",
            name: '已通过',
            cur: false
          }, {
            id: "3",
            name: '不通过',
            cur: false
          }, {
            id: "4",
            name: '已违规',
            cur: false
          }
        ];

        $scope.workAuthList = [
          {
            id: "0",
            name: '未提交',
            cur: false
          }, {
            id: "1",
            name: '审核中',
            cur: false
          }, {
            id: "2",
            name: '已通过',
            cur: false
          }, {
            id: "3",
            name: '不通过',
            cur: false
          }, {
            id: "4",
            name: '已违规',
            cur: false
          }
        ];

        $scope.emailAuthList = [
          {
            id: "0",
            name: '未提交',
            cur: false
          }, {
            id: "1",
            name: '审核中',
            cur: false
          }, {
            id: "2",
            name: '已通过',
            cur: false
          }, {
            id: "3",
            name: '不通过',
            cur: false
          }, {
            id: "4",
            name: '已违规',
            cur: false
          }
        ];

        $scope.config = {
          title: '设计师注册时间过滤：',
          placeholder: '手机号码/设计师名字/设计师ID',
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
          mutiSelected.clearCur($scope.authList);
          mutiSelected.clearCur($scope.uidAuthList);
          mutiSelected.clearCur($scope.workAuthList);
          mutiSelected.clearCur($scope.emailAuthList);
          mutiSelected.clearCur($scope.authOnlineList);
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
          $location.path('/designer/' + JSON.stringify(detail));
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

            mutiSelected.initMutiSelected($scope.authList, detail.query.auth_type);
            mutiSelected.initMutiSelected($scope.uidAuthList, detail.query.uid_auth_type);
            mutiSelected.initMutiSelected($scope.workAuthList, detail.query.work_auth_type);
            mutiSelected.initMutiSelected($scope.emailAuthList, detail.query.email_auth_type);
            mutiSelected.initMutiSelected($scope.authOnlineList, detail.query.online_status);

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
          detail.query.auth_type = mutiSelected.getInQueryFormMutilSelected($scope.authList);
          detail.query.uid_auth_type = mutiSelected.getInQueryFormMutilSelected($scope.uidAuthList);
          detail.query.online_status = mutiSelected.getInQueryFormMutilSelected($scope.authOnlineList);
          detail.query.work_auth_type = mutiSelected.getInQueryFormMutilSelected($scope.workAuthList);
          detail.query.email_auth_type = mutiSelected.getInQueryFormMutilSelected($scope.emailAuthList);
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

        //提示消息
        function tipsMsg(msg, time) {
          time = time || 2000;
          $uibModal.open({
            size: 'sm',
            template: '<div class="modal-header"><h3 class="modal-title">消息提醒</h3></div><div class="modal-body"><p class="text-center">' +
              msg + '</p></div>',
            controller: function ($scope, $timeout, $modalInstance) {
              $scope.ok = function () {
                $modalInstance.close();
              };
              $timeout(function () {
                $scope.ok();
              }, time);
            }
          });
        }
        //加载数据
        function loadList(detail) {
          adminDesigner.search(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.designers;
              // angular.forEach($scope.userList, function (value, key) {
              //   if ($scope.authType) {
              //     value.authDate = value.auth_date;
              //     value.status = value.auth_type;
              //   } else if ($scope.uidAuthType) {
              //     value.authDate = value.uid_auth_date;
              //     value.status = value.uid_auth_type;
              //   } else if ($scope.workAuthType) {
              //     value.authDate = value.work_auth_date;
              //     value.status = value.work_auth_type;
              //   } else if ($scope.emailAuthType) {
              //     value.authDate = value.email_auth_date;
              //     value.status = value.email_auth_type;
              //   }
              // });
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

        $scope.authBtn = function (id, list) {
          mutiSelected.curList(list, id);
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

        //设计师强制下线
        $scope.forcedOffline = function (id, status, designer) {
          status = status == 0 ? "1" : "0"
          if (confirm("你确定该设计师强制下线吗？")) {
            adminDesigner.online({
              "designerid": id,
              "new_oneline_status": status
            }).then(function (resp) {
              if (resp.data.msg === "success") {
                tipsMsg('操作成功');
                // designer.online_status = status;
                loadList(refreshDetailFromUI($stateParams.detail));
              }
            }, function (resp) {
              console.log(resp);
            });
          }
        };

        $scope.getProductDetail = function (designer) {
          var detail = {
            detail: JSON.stringify({
              query: {
                designerid: designer._id
              }
            })
          };
          return detail;
        };
      }
    ]);
})();

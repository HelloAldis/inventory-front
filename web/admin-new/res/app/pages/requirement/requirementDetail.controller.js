(function () {
  angular.module('JfjAdmin.pages.requirement')
    .controller('RequirementDetailController', [
      '$scope', '$stateParams', '$filter', '$window', 'toastr', 'adminRequirement', 'adminDesigner',
      function ($scope, $stateParams, $filter, $window, toastr, adminRequirement, adminDesigner) {
        $scope.requireDetail = function () {
          adminRequirement.requirementDetail({
            requirementid: $stateParams.id
          }).then(function (resp) {
            $scope.user = resp.data.data;
            $scope.recDesignerList = resp.data.data.rec_designers;  //匹配设计师
            $scope.designerList = resp.data.data.order_designers;   // 预约设计师信息
            $scope.orderDesignerids = resp.data.data.order_designerids;  // 预约设计师
            // 成交设计师
            $scope.designerList.forEach(function(designer) {
              if (designer._id === $scope.user.final_designerid) {
                $scope.finalDesigner = designer;
              }
            })
            //初始化设计师列表数据
            loadList($stateParams.detail);
          }, function (err) {
            //返回错误信息
            console.log(err);
          });
        }

        // 获取需求详情
        $scope.requireDetail();

        // 设计师列表
        $scope.config = {
          placeholder: '手机号码/设计师名字/设计师ID',
          search_word: $scope.search_word
        }

        $scope.delegate = {};

        // 搜索
        $scope.delegate.search = function (search_word) {
          $scope.pagination.currentPage = 1;
          loadList(refreshDetailFromUI($stateParams.detail));
        }

        // 重置
        $scope.delegate.clearStatus = function () {
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

        //加载设计师列表数据
        function loadList(detail) {
          adminDesigner.search(detail).then(function (resp) {
            if (resp.data.data.total === 0) {
              $scope.loading.loadData = true;
              $scope.loading.notData = true;
              $scope.userList = [];
            } else {
              $scope.userList = resp.data.data.designers;
              $scope.pagination.totalItems = resp.data.data.total;
              $scope.loading.loadData = true;
              $scope.loading.notData = false;

              // 找出已指派的设计师
              if ($scope.userList && $scope.orderDesignerids) {
                $scope.userList.forEach(function(designer) {
                  $scope.orderDesignerids.forEach(function(id){
                    if (designer._id === id) {
                      designer.isAssign = true;
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

        // 指派设计师
        $scope.assignDesigner = function (designer) {
          adminRequirement.assignDesigner(
            {
              requirementid: $stateParams.id,
              designerids: [designer._id]
            }
          )
          .then(function (res) {
            if (res.data.msg == 'success') {
              designer.isAssign = true;
              $scope.requireDetail();
            } else {
              toastr.info(res.data.err_msg);
            }
          }, function (error) {
            $scope.loadData = false;
            console.log(error);
          })
        }

        // 确认量房
        $scope.houseChecked = function (designer) {
          var status = designer.plans[0].status;
          if ($scope.checkPlanStatus(status)) {
            return;
          }
          adminRequirement.houseChecked({
            designerid: designer._id,
            requirementid: $scope.user._id
          }).then(function (resp) {
            toastr.success('确认量房成功');
            designer.plans[0].status = 6;  //已确认量房但是没有方案
          }, function (err) {
            //返回错误信息
            console.log(err);
          });
        }

        // 选定方案
        $scope.choosePlan = function (designer, plan) {
          if ($scope.checkPlanStatus(plan.status, 'choosePlan')) {
            return;
          }
          adminRequirement.planChoose({
            planid: plan._id,
            designerid: designer._id,
            requirementid: $stateParams.id
          }).then(function (resp) {
            if (resp.data.msg === 'success') {
              toastr.success('方案选定成功');
              plan.status = 5;  // 5. 方案被选中
            } else {
              toastr.error(resp.data.err_msg);
            }
          }, function (err) {
            //返回错误信息
            console.log(err);
          });
        }

        // 确认业主合同及装修流程
        $scope.startProcess = function (requirement) {
          if ($scope.checkRequireStatus(requirement.status)) {
            return;
          }
          adminRequirement.processConfirm({
            requirementid: requirement._id
          }).then(function (resp) {
            requirement.status = 5; // 配置了工地
            toastr.success('确认合同及装修流程成功');
          }, function (err) {
            //返回错误信息
            console.log(err);
          });
        }

        // 预览方案
        $scope.viewPlan = function (pid) {
          var url = '/tpl/user/plans.html?pid=' + pid;
          $scope.afterFilter = $filter("pcUrl")(url);
          $window.open($scope.afterFilter);
        }

        // 预约方案状态验证
        $scope.checkPlanStatus = function(status, type) {
          if (status == 0) {
            toastr.info('需求已预约但没有响应');
            return true;
          } else if (status == 1) {
            toastr.info('设计师已拒绝业主');
            return true;
          } else if (status == 7) {
            toastr.info('设计师无响应导致响应过期');
            return true;
          } else if (type == 'choosePlan') {
            if (status == 0) {
              toastr.info('已确认量房但是没有方案');
              return true;
            } else if (status == 2) {
              toastr.info('已响应但是没有确认量房');
              return true;
            } else if (status == 6) {
              toastr.info('已确认量房但是没有方案');
              return true;
            } else if (status == 8) {
              toastr.info('设计师规定时间内没有上传方案，过期');
              return true;
            } else if (status == 9) {
              toastr.info('业主已选定方案');
              return true;
            }
          }
          return false;
        }

        // 需求状态认证
        $scope.checkRequireStatus = function (status) {
          if (status == 0) {
            toastr.info('未预约任何设计师');
            return true;
          } else if (status == 1) {
            toastr.info('预约过设计师但是没有一个设计师响应过');
            return true;
          } else if (status == 2) {
            toastr.info('有一个或多个设计师响应但没有人量完房');
            return true;
          }  else if (status == 6) {
            toastr.info('有一个或多个设计师量完房但是没有人上传方案');
            return true;
          } else if (status == 3) {
            toastr.info('有一个或多个设计师提交了方案但是没有选定方案');
            return true;
          } else if (status == 4) {
            toastr.info('选定了方案但是还没有配置合同');
            return true;
          }
          return false;
        }
      }
    ]);
})();

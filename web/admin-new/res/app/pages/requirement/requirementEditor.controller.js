(function () {
  angular.module('JfjAdmin.pages.requirement')
    .controller('RequirementEditorController', [
      '$scope', '$stateParams', 'toastr', 'adminRequirement', 'initData',
      function ($scope, $stateParams, toastr, adminRequirement, initData) {
        $scope.requireDetail = function () {
          adminRequirement.requirementDetail({
            requirementid: $stateParams.id
          }).then(function (resp) {
            $scope.requirement = resp.data.data;
            console.log(resp.data.data);
          }, function (err) {
            //返回错误信息
            console.log(err);
          });
        }

        // 获取需求详情
        $scope.requireDetail();

        $scope.dec_type = initData.decType;
        $scope.house_type = initData.houseType;
        // 包工类型
        $scope.work_type = initData.workType;
        // 包类型
        $scope.package_type = initData.packageType;
        // 计划常住成员
        // 风格喜好
        $scope.dec_style = initData.decStyle;
        $scope.family_description = [{
          "num": '单身',
          "name": '单身'
        }, {
          "num": '幸福小两口',
          "name": '幸福小两口'
        }, {
          "num": '三口之家',
          "name": '三口之家'
        }, {
          "num": '三代同堂',
          "name": '三代同堂'
        }, {
          "num": '其他',
          "name": '其他'
        }];
        // 性别
        $scope.prefer_sex = [{
          "num": 0,
          "name": '男'
        }, {
          "num": 1,
          "name": '女'
        }, {
          "num": 2,
          "name": '不限'
        }];
        // 倾向设计师类型
        $scope.communication_type = initData.communicationType;

        $scope.updateUserRequirement = function () {
          if ($scope.checkValid($scope.requirement)) {
            adminRequirement.requirementUpdate($scope.requirement).then(function (resp) {
              if (resp.data.msg === "success") {
                window.history.back();
              } else if (resp.data.err_msg) {
                toastr.error(resp.data.err_msg);
              }
            }, function (resp) {
              console.log(resp);
            });
          }
        }

        $scope.checkValid = function (requirement) {
          if (!requirement.house_area) {
            toastr.info('建筑面积未填写');
            return false;
          } else if (!requirement.total_price) {
            toastr.info('装修预算未填写');
            return false;
          }
          return true;
        }

      }
    ]);

})();

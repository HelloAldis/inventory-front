(function () {
  angular.module('JfjAdmin.pages.user')
    .controller('UserAddRequirementController', [
      '$scope', '$stateParams', '$state', 'toastr', 'adminRequirement', 'adminDesigner', 'adminUser',
      function ($scope, $stateParams, $state, toastr, adminRequirement, adminDesigner, adminUser) {
        // 装修类型
        $scope.dec_type = [
          {
            "num": 0,
            "name": '家装'
          }, {
            "num": 1,
            "name": '商装'
          }, {
            "num": 2,
            "name": '软装'
          }
        ];
        // 户型
        $scope.house_type = [
          {
            "num": 0,
            "name": '一室'
          }, {
            "num": 1,
            "name": '二室'
          }, {
            "num": 2,
            "name": '三室'
          }, {
            "num": 3,
            "name": '四室'
          }, {
            "num": 4,
            "name": '复式'
          }, {
            "num": 5,
            "name": '别墅'
          }, {
            "num": 6,
            "name": 'LOFT'
          }, {
            "num": 7,
            "name": '其他'
          }
        ];
        // 包工类型
        $scope.work_type = [
          {
            "num": 0,
            "name": '设计＋施工(半包)'
          }, {
            "num": 1,
            "name": '设计＋施工(全包)'
          }, {
            "num": 2,
            "name": '纯设计'
          }
        ];
        // 包类型
        $scope.package_type = [
          {
            "num": 0,
             "name": '默认包'
          }, {
            "num": 1,
            "name": '365块每平米基础包'
          }, {
            "num": 2,
            "name": '匠心尊享包'
          }
        ];
        // 计划常住成员
        $scope.family_description = [
          {
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
          }
        ];
        // 风格喜好
        $scope.dec_style = [
          {
            "num": 0,
            "name": '欧式'
          }, {
            "num": 1,
            "name": '中式'
          }, {
            "num": 2,
            "name": '现代'
          }, {
            "num": 3,
            "name": '地中海'
          }, {
            "num": 4,
            "name": '美式'
          }, {
            "num": 5,
            "name": '东南亚'
          }, {
            "num": 6,
            "name": '田园'
          }
        ];
        // 性别
        $scope.prefer_sex = [
          {
            "num": 0,
            "name": '男'
          }, {
            "num": 1,
            "name": '女'
          }, {
            "num": 2,
            "name": '不限'
          }
        ];
        // 倾向设计师类型
        $scope.communication_type = [
          {
            "num": 0,
            "name": '不限'
          }, {
            "num": 1,
            "name": '表达型'
          }, {
            "num": 2,
            "name": '倾听型'
          }
        ];

        // 初始化
        $scope.dataMapped = {
          dec_type: "0",
          dec_style: "0",
          house_type: "0",
          work_type: "0",
          family_description: "单身",
          package_type: "0",
          prefer_sex: "2",
          communication_type: "0"
        };

        // 提交业主需求
        $scope.addUserRequirement = function () {
          if ($scope.checkValid($scope.dataMapped)) {
            adminUser.addRequirement(angular.merge($scope.dataMapped, {userid: $stateParams.id}))
            .then(function (resp) {
              if(!resp.data.err_msg) {
                toastr.success('添加业主需求成功');
                $state.go('requirementDetail', {id: resp.data.data.requirementid});
              } else {
                toastr.error(resp.data.err_msg);
              }
            }, function (err) {
              console.log(err);
            });
          }
        }

        $scope.checkValid = function (dataMapped) {
          if (!dataMapped.house_area) {
            toastr.info('建筑面积未填写');
            return false;
          } else if (!dataMapped.total_price) {
            toastr.info('装修预算未填写');
            return false;
          }
          return true;
        }
      }
    ]);
})();

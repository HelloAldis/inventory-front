(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerInfoAuthController', [ //设计师信息认证
      '$scope', '$stateParams', '$location', 'adminDesigner', 'toastr',
      function ($scope, $stateParams, $location, adminDesigner, toastr) {
        adminDesigner.get($stateParams.id)
        .then(function (res) {
          $scope.user = res.data.data;
        }, function (err) {
          console.log(err);
          promptMessage('获取数据失败', resp.data.msg)
        });

        $scope.success = function (type) {
          if (confirm("你确定要操作吗？")) {
            if (type == "2") {
              msg = '认证成功';
            } else {
              if (!!$scope.errorMsg) {
                msg = $scope.errorMsg;
              } else {
                toastr.info('请填写未认证通过原因');
                return;
              }
            }

            //获取数据
            adminDesigner.infoAuth({
              "_id": $stateParams.id,
              "new_auth_type": type,
              "auth_message": msg
            })
            .then(function (res) {
              window.history.back();
            }, function (err) {
              console.log(err);
              promptMessage('获取数据失败', resp.data.msg)
            });
          }
        }
      }
    ]);
})();

(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerWorkAuthController', [ //设计师实地认证
      '$scope', '$stateParams', '$location', 'toastr', 'adminDesigner',
      function ($scope, $stateParams, $location, toastr, adminDesigner) {
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

            adminDesigner.updateWorkAuth(
              {
                "_id": $stateParams.id,
                "new_auth_type": type,
                "auth_message": msg
              }
            )
            .then(function (resp) {
              //返回信息
              window.history.back();
            }, function (resp) {
              //返回错误信息
              console.log(resp);
              promptMessage('获取数据失败', resp.data.msg)
            })
          }
        }
      }
    ]);
})();

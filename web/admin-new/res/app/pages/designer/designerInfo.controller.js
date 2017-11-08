(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerInfoController', [ //设计师个人信息
      '$scope', '$stateParams', 'adminDesigner', '$state',
      function ($scope, $stateParams, adminDesigner, $state) {
        adminDesigner.idAuth($stateParams.id)
        .then(function (resp) {
          //返回信息
          $scope.user = resp.data.data;
        }, function (resp) {
          //返回错误信息
          console.log(resp);
          promptMessage('获取数据失败', resp.data.msg)
        });

        // 跳转到设计师作品列表
        $scope.getProductDetail = function (designer) {
          var detail = JSON.stringify({
            query: {
              designerid: designer._id
            }
          });
          $state.go('product', { detail: detail });
        }
      }
    ]);
})();

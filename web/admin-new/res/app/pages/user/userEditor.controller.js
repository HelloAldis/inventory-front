(function () {
  angular.module('JfjAdmin.pages.user')
    .controller('UserEditorController', [
      '$scope', '$rootScope', '$stateParams', 'adminUser', 'initData', 'toastr',
      function ($scope, $rootScope, $stateParams, adminUser, initData, toastr) {
        $scope.uploader1 = {};
        $scope.decStyle = initData.decStyle;
        $scope.userSex = initData.userSex;
        $scope.decProgress = initData.decProgress;

        adminUser.search({
          "query": {
            "_id": $stateParams.id
          },
          "from": 0,
          "limit": 1
        }).then(function (resp) {
          if (resp.data.data.total === 1) {
            $scope.user = resp.data.data.users[0];
            $scope.checked = $scope.user.phone ? true : false;
          }
        }, function (resp) {
          //返回错误信息
          console.log(resp);
        });

        $scope.editorUser = function () {
          $scope.user.imageid = $scope.uploader1.uploadImageClient.getAllIds()[0];
          adminUser.editorUser($scope.user).then(function (resp) {
            //返回信息
            if (resp.data.msg === "success") {
              window.history.back();
            } else if (resp.data.err_msg) {
              toastr.error(resp.data.err_msg);
            }
          }, function (resp) {
            //返回错误信息
            console.log(resp);
          })
        }
      }
    ]);
})();

(function () {
  angular.module('JfjAdmin.pages.user')
    .controller('UserRequirementController', [
      '$scope', '$stateParams', 'adminRequirement',
      function ($scope, $stateParams, adminRequirement) {
        adminRequirement.search({
          "query": {
            "userid": $stateParams.id
          },
          "sort": {
            "_id": 1
          },
          "from": 0,
          "limit": 10
        }).then(function (resp) {
          console.log(resp);
          if (resp.data.data.total !== 0) {
            $scope.requireList = resp.data.data.requirements;
          }
        }, function (resp) {
          //返回错误信息
          console.log(resp);
        });
      }
    ]);
})();

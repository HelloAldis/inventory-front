(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerTeamListController', [ //设计师的施工团队
      '$scope', '$stateParams', '$filter', '$location', 'adminDesigner',
      function ($scope, $stateParams, $filter, $location, adminDesigner) {
        adminDesigner.searchTeam(
          {
            "query": {
              "designerid": $stateParams.id
            },
            "sort": {
              "_id": 1
            },
            "from": 0,
            "limit": 1000
          }
        )
        .then(function (resp) {
          //返回信息
          $scope.userList = resp.data.data.teams;
          $scope.deleteTeam = function (id) {
            if (confirm("你确定要删除吗？删除不能恢复")) {
              alert('你没有权限删除');
            } else {
              // alert(id);
            }
          }
        }, function (resp) {
          //返回错误信息
          console.log(resp);
          promptMessage('获取数据失败', resp.data.msg)
        });
      }
    ]);
})();

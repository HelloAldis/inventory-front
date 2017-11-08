(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerTeamEditorController', [ //设计师编辑施工团队
      '$scope', '$rootScope', '$stateParams', '$http', '$filter', '$location',
      function ($scope, $rootScope, $stateParams, $http, $filter, $location) {
        $scope.uploader1 = {};
        $scope.uploader2 = {};

        $http({ //获取数据
          method: "POST",
          url: 'api/v2/web/admin/search_team',
          data: {
            "query": {
              "_id": $stateParams.id
            },
            "sort": {
              "_id": 1
            },
            "from": 0,
            "limit": 1000
          }
        }).then(function (resp) {
          //返回信息
          $scope.team = resp.data.data.teams[0];
          $scope.teamSexs = [{
            "id": "0",
            "name": "男"
          }, {
            "id": "1",
            "name": "女"
          }]

          $scope.teamGoodAts = ["水电", "木工", "油工", "泥工"];
          // console.log(resp.data.data.teams[0]);

          $scope.upDataTeam = function () {
            $scope.team.uid_image1 = $scope.uploader1.uploadImageClient.getAllIds()[0];
            $scope.team.uid_image2 = $scope.uploader2.uploadImageClient.getAllIds()[0];
            // console.log($scope.team)
            $http({ //获取数据
              method: "POST",
              url: 'api/v2/web/admin/update_team',
              data: $scope.team
            }).then(function (resp) {
              //返回信息
              console.log(resp);
              window.history.back();
            }, function (resp) {
              //返回错误信息
              console.log(resp);
              promptMessage('获取数据失败', resp.data.msg)
            });
          };
        }, function (resp) {
          //返回错误信息
          console.log(resp);
          promptMessage('获取数据失败', resp.data.msg)
        });

        $scope.close = function () {
          window.history.back();
        }
      }
    ]);
})();

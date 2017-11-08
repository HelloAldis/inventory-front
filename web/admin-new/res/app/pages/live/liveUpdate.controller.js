(function () {
  angular.module('JfjAdmin.pages.live')
    .controller('LiveUpdateController', [ //更新装修直播
      '$scope', '$rootScope', '$stateParams', '$http', '$filter', '$location', 'adminShare',
      function ($scope, $rootScope, $stateParams, $http, $filter, $location, adminShare) {
        $scope.uploader1 = {};

        $scope.processTime = {
          clear: function () {
            this.dt = null;
          },
          dateOptions: {
            formatYear: 'yy',
            startingDay: 1
          },
          status: {
            opened: false
          },
          open: function ($event) {
            this.status.opened = true;
          },
          today: function () {
            this.dt = new Date();
          }
        };
        $scope.processTime.today();
        $scope.dec_flow = [{
          "num": 0,
          "name": '量房'
        }, {
          "num": 1,
          "name": '开工'
        }, {
          "num": 2,
          "name": '拆改'
        }, {
          "num": 3,
          "name": '水电'
        }, {
          "num": 4,
          "name": '泥木'
        }, {
          "num": 5,
          "name": '油漆'
        }, {
          "num": 6,
          "name": '安装'
        }, {
          "num": 7,
          "name": '竣工'
        }];
        $scope.process = {};
        adminShare.search({
          "query": {
            "_id": $stateParams.id
          },
          "from": 0,
          "limit": 1
        }).then(function (resp) {
          //返回信息
          if (resp.data.data.total === 1) {
            $scope.shares = resp.data.data.shares[0];
            var curId = parseInt($scope.shares.process[$scope.shares.process.length - 1].name);
            $scope.process.processName = curId > $scope.shares.process.length - 1 ? curId : curId + 1;
            $scope.process.processDate = $filter('date')($scope.shares.process[$scope.shares.process.length - 1].date, 'yyyy-MM-dd');
          }
        }, function (resp) {
          //返回错误信息
          console.log(resp);
        })
        $scope.upDataLive = function () {
          for (var i = 0, len = $scope.shares.process.length; i < len; i++) {
            if (i != $scope.process.processName) {
              $scope.shares.process.push({
                "name": $scope.process.processName,
                "description": $scope.process.processDescription,
                "date": (new Date($scope.process.processDate)).getTime(),
                "images": $scope.uploader1.uploadImageClient.getAllIds()
              });
              break;
            } else {
              $scope.shares.process[i] = $scope.shares.process[i];
              break;
            }
          }
          $scope.shares.process.sort(function (n, m) {
            return n.name - m.name;
          })
          if ($scope.shares.process[$scope.shares.process.length - 1].name == 7) {
            $scope.shares.progress = "1";
          }
          submitData()
        }
        $scope.deleteLive = function () {
          console.log($scope.shares.process)
          angular.forEach($scope.shares.process, function (value, key) {
            if (value.name == $scope.process.processName) {
              this.splice(key, 1)
              return;
            }
          }, $scope.shares.process)
          submitData();
        }

        function submitData() {
          adminShare.update($scope.shares).then(function (resp) {
            //返回信息
            window.history.back();
          }, function (resp) {
            //返回错误信息
            console.log(resp);
          })
        }
      }
    ]);
})();

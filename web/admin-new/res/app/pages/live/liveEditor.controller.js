(function () {
  angular.module('JfjAdmin.pages.live')
    .controller('LiveEditorController', [ //编辑装修直播
      '$scope', '$rootScope', '$stateParams', '$http', '$filter', '$location', 'toastr', 'adminShare',
      function ($scope, $rootScope, $stateParams, $http, $filter, $location, toastr, adminShare) {
        $scope.uploader1 = {};

        //时间筛选控件
        $scope.startTime = {
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
        $scope.startTime.today();
        $scope.dec_type = [{
          "num": 0,
          "name": '家装'
        }, {
          "num": 1,
          "name": '商装'
        }, {
          "num": 2,
          "name": '软装'
        }];
        $scope.dec_style = [{
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
        }];
        $scope.house_type = [{
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
        }];
        $scope.work_type = [{
          "num": 0,
          "name": '设计＋施工(半包)'
        }, {
          "num": 1,
          "name": '设计＋施工(全包)'
        }, {
          "num": 2,
          "name": '纯设计'
        }];

        adminShare.search({
          "query": {
            "_id": $stateParams.id
          },
          "from": 0,
          "limit": 1
        }).then(function (resp) {
          //返回信息
          if (resp.data.data.total === 1) {
            $scope.dataMapped = resp.data.data.shares[0];
          }
        }, function (resp) {
          //返回错误信息
          console.log(resp);
        });
        $scope.phoneChange = function (name) { //查找设计师
          if (!name) {
            toastr.info('请输入需要查找的设计师的手机号码或者名字');
            return;
          } else {
            $http({
              method: "POST",
              url: 'api/v2/web/admin/search_designer',
              headers: {
                'Content-Type': 'application/json; charset=utf-8'
              },
              data: {
                "query": {
                  'phone': name
                },
                "sort": {
                  "_id": 1
                },
                "from": 0,
                "limit": 10000
              }
            }).then(function (resp) {
              //返回信息
              if (resp.data.data.total) {
                $scope.designer = [];
                angular.forEach(resp.data.data.designers, function (value, key) {
                  this.push({
                    "num": value._id,
                    "name": value.username + " | " + value.phone
                  });
                }, $scope.designer);

              } else {
                $scope.designer = [];
                $scope.designer.push({
                  "num": '-1',
                  "name": "暂无查询数据"
                })
              }
            }, function (resp) {
              //返回错误信息
              promptMessage('创建失败', resp.data.msg)
              console.log(resp);
            })
          }
        }
        $scope.editorLive = function () { //编辑资料
          $scope.dataMapped.start_at = (new Date($scope.dataMapped.start_at)).getTime();
          $scope.dataMapped.cover_imageid = $scope.uploader1.uploadImageClient.getAllIds()[0];
          adminShare.update($scope.dataMapped).then(function (resp) {
            //返回信息
            if (resp.data.msg === "success") {
              window.history.back();
            }
          }, function (resp) {
            //返回错误信息
            console.log(resp);
          })
        }
      }
    ]);
})();

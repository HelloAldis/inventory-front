(function () {
  angular.module('JfjAdmin.pages.pictures')
    .controller('PicturesAddController', ['$scope', '$rootScope', '$stateParams', '$state', 'adminBeautifulImage', 'imageApi',
      function ($scope, $rootScope, $stateParams, $state, adminBeautifulImage, imageApi) {
        $scope.uploader1 = {};
        $scope.ids = [];
        var currentId = $stateParams.id == undefined ? "" : $stateParams.id;
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
        $scope.section = ['厨房', '客厅', '卫生间', '卧室', '餐厅', '书房', '玄关', '阳台', '儿童房', '走廊', '储物间']
        $scope.images = {
          "title": "",
          "description": "",
          "dec_type": "0",
          "house_type": "0",
          "dec_style": "0",
          "images": [],
          "section": '厨房'
        }
        if (currentId) {
          adminBeautifulImage.search({
            "query": {
              "_id": currentId
            },
            "from": 0,
            "limit": 1
          }).then(function (resp) {
            if (resp.data.data.total === 1) {
              $scope.images = resp.data.data.beautifulImages[0];
              if ($scope.images.keywords.indexOf(",") != -1) {
                $scope.images.keywords = $scope.images.keywords.split(",").join("|");
              }
              $scope.ids = $scope.images.images.map(function (o) {
                return o.imageid;
              });
            }
          }, function (resp) {
            //返回错误信息
            $scope.loadData = false;
            console.log(resp);

          });
        }
        $scope.cancel = function () {
          window.history.back();
        }
        $scope.picturesSubmit = function () {
          if ($scope.images.keywords.indexOf("|") != -1) {
            $scope.images.keywords = $scope.images.keywords.split("|").join(",");
          }
          var ids = $scope.uploader1.uploadImageClient.getAllIds();
          imageApi.imagemeta({
            _ids: ids
          }).then(function (resp) {
            console.log(resp);
            $scope.images.images = resp.data.data.map(function (o) {
              return {
                imageid: o._id,
                width: o.width,
                height: o.height
              }
            });

            if (currentId) {
              adminBeautifulImage.upload($scope.images).then(function (resp) {
                if (resp.data.msg === "success") {
                  $state.go('pictures')
                }
              }, function (resp) {
                //返回错误信息
                $scope.loadData = false;
                console.log(resp);
              });
            } else {
              adminBeautifulImage.add($scope.images).then(function (resp) {
                if (resp.data.msg === "success") {
                  $state.go('pictures')
                }
              }, function (resp) {
                //返回错误信息
                $scope.loadData = false;
                console.log(resp);
              });
            }
          }, function (resp) {
            $scope.loadData = false;
            console.log(resp);
          });


        }
      }
    ]);
})();

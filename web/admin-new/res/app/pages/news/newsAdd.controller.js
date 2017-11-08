(function () {
  angular.module('JfjAdmin.pages.news')
    .controller('NewsAddController', ['$scope', '$rootScope', '$stateParams', '$state', 'adminArticle', function ($scope, $rootScope, $stateParams,
      $state, adminArticle) {
      $scope.uploader1 = {};
      var currentId = $stateParams.id == undefined ? "" : $stateParams.id;
      $scope.article_type = [{
        "num": 0,
        "name": '大百科'
      }, {
        "num": 1,
        "name": '小贴士'
      } ];
      $scope.news = {
        "title": "",
        "keywords": "",
        "cover_imageid": undefined,
        "description": "",
        "content": "",
        "articletype": "1"
      }
      if (currentId) {
        adminArticle.search({
          "query": {
            "_id": currentId
          },
          "from": 0,
          "limit": 1
        }).then(function (resp) {
          if (resp.data.data.total === 1) {
            $scope.news = resp.data.data.articles[0];
            if ($scope.news.keywords.indexOf(",") != -1) {
              $scope.news.keywords = $scope.news.keywords.split(",").join("|");
            }
          }
        }, function (resp) {
          //返回错误信息
          $scope.loadData = false;
          console.log(resp);

        });
      }
      $scope.cancel = function () {
        // $state.go('news');
        window.history.back();
      }
      $scope.newsUeditor = function () {
        if ($scope.news.keywords.indexOf("|") != -1) {
          $scope.news.keywords = $scope.news.keywords.split("|").join(",");
        }
        $scope.news.cover_imageid = $scope.uploader1.uploadImageClient.getAllIds()[0];
        if (currentId) {
          adminArticle.upload($scope.news).then(function (resp) {
            if (resp.data.msg === "success") {
              window.history.back();
            }
          }, function (resp) {
            //返回错误信息
            $scope.loadData = false;
            console.log(resp);
          });
        } else {
          adminArticle.add($scope.news).then(function (resp) {
            if (resp.data.msg === "success") {
              $state.go('news')
            }
          }, function (resp) {
            //返回错误信息
            $scope.loadData = false;
            console.log(resp);
          });
        }
      }
    }]);
})();

(function() {
    angular.module('JfjAdmin.pages.survey')
        .filter('to_trusted', ['$sce', function ($sce) {
          return function (text) {
              return $sce.trustAsHtml(text);
          }
        }])
        .controller('SurveyListController', [
            '$scope','$rootScope','adminEvents',
            function($scope, $rootScope,adminEvents) {
                $scope.userList = [
                  {
                    "_id" : 1,
                    "create_at" : +new Date(),
                    "status" : false,
                    "name" : "内部问卷调查"
                  }
                ]
        }]);
})();

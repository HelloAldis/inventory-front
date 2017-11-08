(function () {
  angular.module('JfjAdmin')
    .controller('topCtrl', [
      '$scope',
      function ($scope) {
        $scope.$on('$stateChangeSuccess', function (event, current, previous) {
          $scope.title = current.title;
        });
      }
    ]);
})();

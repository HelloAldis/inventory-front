(function () {
  'use strict';

  angular.module('JfjAdmin.components')
      .directive('imgUrl', imgUrl);

  /** @ngInject */
  function imgUrl() {
    return {
      replace: true,
      scope:{
        data: '=',
        width: '@',
        height: '@'
      },
      restrict: 'E',
      templateUrl: 'app/components/imgUrl/imgUrl.html'
    }
  }
})();
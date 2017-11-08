/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('strDropdown', strDropdown);

  /** @ngInject */
  function strDropdown() {
    return {
      scope: {
        curopt: '=',
        opts: '='
      },
      restrict: 'E',
      templateUrl: 'app/components/dropdown/strDropdown.html',
      controller: function ($scope, $element, $attrs, $transclude) {
        $scope.selectAOption = function(choice){
          $scope.curopt = choice;
        };
      }
    };
  }

})();

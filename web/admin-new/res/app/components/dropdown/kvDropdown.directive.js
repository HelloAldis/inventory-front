/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('kvDropdown', kvDropdown);

  /** @ngInject */
  function kvDropdown() {
    return {
      scope: {
        curkey: '=',
        opts: '=',
        keyval: '@'
      },
      restrict: 'E',
      templateUrl: 'app/components/dropdown/kvDropdown.html',
      controller: function ($scope, $element, $attrs, $transclude) {
        var keyValname = $scope.keyval.split(/:/);
        $scope.kvKeyName = keyValname[0];
        $scope.kvValName = keyValname[1];

        $scope.$watch('curkey', function (newVal, oldVal) {
          if ($scope.opts !== undefined && $scope.opts['find'] !== undefined) {
            $scope.kvCurOption = $scope.opts.find(function (option) {
              return option[$scope.kvKeyName] == newVal;
            });
          }
        });

        $scope.$watchCollection('opts', function (newVal, oldVal, scope) {
          if ($scope.curkey !== undefined && newVal['find'] !== undefined) {
            $scope.kvCurOption = newVal.find(function (option) {
              return option[$scope.kvKeyName] == $scope.curkey;
            });
          }
        });

        $scope.selectAOption = function(choice){
          $scope.kvCurOption = choice;
          $scope.curkey = choice[$scope.kvKeyName];
        };
      }
    };
  }

})();

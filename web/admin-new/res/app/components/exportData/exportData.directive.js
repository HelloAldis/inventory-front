/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('exportData', exportData);

  /** @ngInject */
  function exportData() {
    return {
      restrict: 'A',
      replace: true,
      controller: function ($scope) {
        $scope.exportCSV = function (tableid) {
          $('table').table2CSV();
        }
      },
      template: '<button type="button" class="btn btn-primary" ng-click="exportCSV()">导出数据</button>'
    };
  }

})();

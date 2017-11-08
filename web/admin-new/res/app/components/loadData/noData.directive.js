/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('noData', noData);

  /** @ngInject */
  function noData() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/components/loadData/noData.html'
    };
  }

})();

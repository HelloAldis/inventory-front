/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('loadData', loadData);

  /** @ngInject */
  function loadData() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/components/loadData/loadData.html'
    };
  }

})();

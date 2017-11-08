/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.plan', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('plans', {
        url: '/plans/:detail',
        templateUrl: 'app/pages/plan/plans.html',
        title: '方案列表',
        controller: 'PlansController',
        sidebarMeta: {
          icon: 'ion-android-clipboard',
          order: 20
        }
      });
  }

})();

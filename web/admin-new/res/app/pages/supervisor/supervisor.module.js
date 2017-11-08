(function () {
  'use strict';

  angular.module('JfjAdmin.pages.supervisor', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('supervisorList', {
        url: '/supervisorList/:detail',
        templateUrl: 'app/pages/supervisor/supervisor.html',
        title: '监理列表',
        controller: 'SupervisorController',
        sidebarMeta: {
          icon: 'fa fa-street-view',
          order: 60
        }
      });
  }

})();
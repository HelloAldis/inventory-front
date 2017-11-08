/**
 * @author Karos
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.recruit', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('recruit', {
        url: '/recruit/:detail',
        templateUrl: 'app/pages/recruit/recruitList.html',
        title: '天使招募',
        controller: 'RecruitListController',
        sidebarMeta: {
          icon: 'fa fa-pagelines',
          order: 90
        }
      });
  }

})();

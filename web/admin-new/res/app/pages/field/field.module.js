/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.field', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('fieldList', {
        url: '/fieldList/:detail',
        templateUrl: 'app/pages/field/fieldList.html',
        title: '工地管理后台',
        controller: 'FieldListController',
        sidebarMeta: {
          icon: 'fa fa-wrench',
          order: 70
        }
      })
      .state('fieldDetail', {
        // title: '工地管理',
        url: '/field/detail/:id/:detail',
        templateUrl: 'app/pages/field/fieldDetail.html',
        controller: 'FieldDetailController'
      })
  }

})();

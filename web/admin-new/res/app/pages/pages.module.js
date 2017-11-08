/**
 * @author Aldis
 * created on 2016
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages', [
      'ui.router',

      'JfjAdmin.pages.index',
      'JfjAdmin.pages.news',
      'JfjAdmin.pages.pictures',
      'JfjAdmin.pages.survey',
      'JfjAdmin.pages.requirement',
      'JfjAdmin.pages.plan',
      'JfjAdmin.pages.user',
      'JfjAdmin.pages.recruit',
      'JfjAdmin.pages.feedback',
      'JfjAdmin.pages.field',
      'JfjAdmin.pages.designer',
      'JfjAdmin.pages.product',
      'JfjAdmin.pages.live',
      'JfjAdmin.pages.chart',
      'JfjAdmin.pages.diary',
      'JfjAdmin.pages.comment',
      'JfjAdmin.pages.supervisor',
      'JfjAdmin.pages.image',
      'JfjAdmin.pages.notify',
      'JfjAdmin.pages.quotation'
    ])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    $urlRouterProvider.otherwise('/index');
  }

})();

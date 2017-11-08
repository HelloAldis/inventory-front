(function () {
  'use strict';

  angular.module('JfjAdmin.pages.notify', [
    'JfjAdmin.pages.notify.user',
    'JfjAdmin.pages.notify.designer'
  ])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('notify', {
      url: '/notify',
      abstract: true,
      template: '<div ui-view></div>',
      title: '消息推送',
      sidebarMeta: {
        icon: 'fa fa-bell',
        order: 50
      }
    });
  }

})();

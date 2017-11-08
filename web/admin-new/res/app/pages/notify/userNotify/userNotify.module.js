(function () {
  'use strict';

  angular.module('JfjAdmin.pages.notify.user', ['toastr'])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('notify.user', {
      url: '/user',
      templateUrl: 'app/pages/notify/userNotify/userNotify.html',
      title: '业主消息推送',
      controller: 'UserNotifyController',
      sidebarMeta: {
        order: 100
      }
    });
  }

})();
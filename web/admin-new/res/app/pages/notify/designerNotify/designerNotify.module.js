(function () {
  'use strict';

  angular.module('JfjAdmin.pages.notify.designer', ['toastr'])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
    .state('notify.designer', {
      url: '/designer',
      templateUrl: 'app/pages/notify/designerNotify/designerNotify.html',
      title: '设计师消息推送',
      controller: 'DesignerNotifyController',
      sidebarMeta: {
        order: 100
      }
    });
  }

})();
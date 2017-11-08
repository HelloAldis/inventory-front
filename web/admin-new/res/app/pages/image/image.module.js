/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.image', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('image', {
        url: '/image/:detail',
        templateUrl: 'app/pages/image/image.html',
        title: '图片列表',
        controller: 'ImageController',
        sidebarMeta: {
          icon: 'ion-camera',
          order: 111
        }
      });
  }

})();

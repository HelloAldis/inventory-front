/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.product', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('product', {
        url: '/product/:detail',
        templateUrl: 'app/pages/product/product.html',
        title: '作品列表',
        controller: 'ProductController',
        sidebarMeta: {
          icon: 'ion-android-desktop',
          order: 50
        }
      });
  }

})();

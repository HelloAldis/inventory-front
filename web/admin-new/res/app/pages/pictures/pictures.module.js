/**
 * @author Karos
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.pictures', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('pictures', {
        url: '/pictures/:detail',
        templateUrl: 'app/pages/pictures/pictureList.html',
        title: '装修美图',
        controller: 'PicturesListController',
        sidebarMeta: {
          icon: 'fa fa-picture-o',
          order: 110
        }
      })
      .state('picturesAdd', {
        title: '装修美图',
        url: '/pictures/add/:id',
        templateUrl: 'app/pages/pictures/pictureAdd.html',
        controller: 'PicturesAddController'
      })
  }

})();

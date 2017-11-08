/**
 * @author Karos
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.news', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('news', {
        url: '/news/:detail',
        templateUrl: 'app/pages/news/newsList.html',
        title: '新闻编辑',
        controller: 'NewsController',
        sidebarMeta: {
          icon: 'fa fa-newspaper-o',
          order: 100
        }
      })
      .state('newsAdd', {
        title: '新闻编辑',
        url: '/news/add/:id',
        templateUrl: 'app/pages/news/newsAdd.html',
        controller: 'NewsAddController'
      });
  }

})();

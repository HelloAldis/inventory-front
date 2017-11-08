(function () {
  'use strict';

  angular.module('JfjAdmin.pages.diary', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('diaryList', {
        url: '/diaryList/:detail',
        templateUrl: 'app/pages/diary/diary.html',
        title: '日记列表',
        controller: 'DiaryController',
        sidebarMeta: {
          icon: 'fa fa-pencil-square-o',
          order: 60
        }
      });
  }

})();
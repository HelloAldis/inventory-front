(function () {
  'use strict';

  angular.module('JfjAdmin.pages.comment', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('commentList', {
        url: '/commentList/:detail',
        templateUrl: 'app/pages/comment/comment.html',
        title: '评论列表',
        controller: 'CommentController',
        sidebarMeta: {
          icon: 'fa fa-commenting',
          order: 60
        }
      });
  }

})();
/**
 * @author Karos
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.feedback', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('feedback', {
        url: '/feedback/:detail',
        templateUrl: 'app/pages/feedback/feedbackList.html',
        title: '用户反馈',
        controller: 'FeedbackListController',
        sidebarMeta: {
          icon: 'fa fa-comment',
          order: 80
        }
      });
  }

})();

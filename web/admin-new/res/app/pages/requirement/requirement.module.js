/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.requirement', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('requirement', {
        url: '/requirement/:detail',
        templateUrl: 'app/pages/requirement/requirement.html',
        title: '需求列表',
        controller: 'RequirementController',
        sidebarMeta: {
          icon: 'fa fa-building',
          order: 10
        }
      }).state('requirementDetail', {
        title: '需求详情',
        url: '/requirement/detail/:id',
        templateUrl: 'app/pages/requirement/requirementDetail.html',
        controller: 'RequirementDetailController'
      }).state('requirementEditor', {
        title: '需求详情',
        url: '/requirement/editor/:id',
        templateUrl: 'app/pages/requirement/requirementEditor.html',
        controller: 'RequirementEditorController'
      })
  }
})();

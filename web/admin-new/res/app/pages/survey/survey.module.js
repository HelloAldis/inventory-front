/**
 * @author Karos
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.survey', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('survey', {
        url: '/survey',
        templateUrl: 'app/pages/survey/surveyList.html',
        title: '问卷调查',
        controller: 'SurveyListController',
        sidebarMeta: {
          icon: 'fa fa-file-text-o',
          order: 120
        }
      })
      .state('surveyDetail', {
        title: '问卷调查',
        url: '/survey/:id',
        templateUrl: 'app/pages/survey/surveyDetail.html',
        controller: 'SurveyDetailController'
      });
  }

})();

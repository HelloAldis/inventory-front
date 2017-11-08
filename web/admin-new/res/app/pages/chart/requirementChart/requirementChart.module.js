/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.chart.requirement', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('chart.requirement', {
        url: '/requirement',
        templateUrl: 'app/pages/chart/requirementChart/requirementChart.html',
        title: '需求图表',
        controller: 'RequirementChartController',
        sidebarMeta: {
          icon: 'ion-arrow-graph-up-right',
          order: 0
        }
      });
  }

})();

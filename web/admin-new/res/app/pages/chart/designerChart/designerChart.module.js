/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.chart.designer', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('chart.designer', {
        url: '/designer',
        templateUrl: 'app/pages/chart/designerChart/designerChart.html',
        title: '设计师用户图表',
        controller: 'DesignerChartController',
        sidebarMeta: {
          icon: 'ion-arrow-graph-up-right',
          order: 10
        }
      });
  }

})();

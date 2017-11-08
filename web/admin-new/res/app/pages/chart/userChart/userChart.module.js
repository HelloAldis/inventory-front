/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.chart.user', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('chart.user', {
        url: '/user',
        templateUrl: 'app/pages/chart/userChart/userChart.html',
        title: '业主用户图表',
        controller: 'UserChartController',
        sidebarMeta: {
          icon: 'ion-arrow-graph-up-right',
          order: 10
        }
      });
  }

})();

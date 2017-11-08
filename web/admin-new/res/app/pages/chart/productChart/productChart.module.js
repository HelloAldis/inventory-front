/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.chart.product', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('chart.product', {
        url: '/product',
        templateUrl: 'app/pages/chart/productChart/productChart.html',
        title: '作品图表',
        controller: 'ProductChartController',
        sidebarMeta: {
          icon: 'ion-arrow-graph-up-right',
          order: 10
        }
      });
  }

})();

(function () {
  'use strict';

  angular.module("JfjAdmin.pages.quotation", [])
    .config(routeConfig);

  function routeConfig($stateProvider) {
    $stateProvider
      .state('quotations', {
        url: '/quotations/:detail',
        templateUrl: 'app/pages/quotation/quotations.html',
        title: '报价列表',
        controller: 'QuotationController',
        sidebarMeta: {
          icon: 'ion-ios-calculator',
          order: 90
        }
      });
  }

})();

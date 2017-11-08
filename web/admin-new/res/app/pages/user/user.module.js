/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.user', [])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('user', {
        url: '/user/:detail',
        templateUrl: 'app/pages/user/user.html',
        title: '业主列表',
        controller: 'UserController',
        sidebarMeta: {
          icon: 'ion-android-person',
          order: 30
        }
      })
      .state('userInfo', {
        title: '业主详细资料',
        url: '/user/info/:id',
        templateUrl: 'app/pages/user/userInfo.html',
        controller: 'UserInfoController'
      })
      .state('userRequirement', {
        title: '需求列表',
        url: '/user/requirement/:id',
        templateUrl: 'app/pages/user/userRequirement.html',
        controller: 'UserRequirementController'
      })
      .state('userAddRequirement', {
        title: '提交需求',
        url: '/user/add/requirement/:id',
        templateUrl: 'app/pages/user/userAddRequirement.html',
        controller: 'UserAddRequirementController'
      })
      .state('userEditor', {
        title: '业主详细资料',
        url: '/user/info/edit/:id',
        templateUrl: 'app/pages/user/userEditor.html',
        controller: 'UserEditorController'
      });
  }

})();

/**
 * @author Aldis
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.pages.designer', ['toastr'])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('designer', {
        url: '/designer/:detail',
        templateUrl: 'app/pages/designer/designer.html',
        title: '设计师列表',
        controller: 'DesignerController',
        sidebarMeta: {
          icon: 'ion-android-walk',
          order: 40
        }
      })
      .state('designerTeamList', {
        title: '施工团队列表',
        url: '/designer/team/:id',
        templateUrl: 'app/pages/designer/designerTeamList.html',
        controller: 'DesignerTeamListController'
      })
      .state('designerEditorTeam', {
        title: '设计师列表',
        url: '/team/editor/:id',
        templateUrl: 'app/pages/designer/designerTeamEditor.html',
        controller: 'DesignerTeamEditorController'
      })
      .state('designerInfo', {
        title: '设计师列表',
        url: '/designer/info/:id',
        templateUrl: 'app/pages/designer/designerInfo.html',
        controller: 'DesignerInfoController'
      })
      .state('designerIdAuth', {
        title: '设计师列表',
        url: '/designer/idauth/:id',
        templateUrl: 'app/pages/designer/designerIdAuth.html',
        controller: 'DesignerIdAuthController'
      })
      .state('designerWorkAuth', {
        title: '设计师列表',
        url: '/designer/workauth/:id',
        templateUrl: 'app/pages/designer/designerWorkAuth.html',
        controller: 'DesignerWorkAuthController'
      })
      .state('designerInfoAuth', {
        title: '设计师列表',
        url: '/designer/infoauth/:id',
        templateUrl: 'app/pages/designer/designerInfoAuth.html',
        controller: 'DesignerInfoAuthController'
      })
      .state('designerEditor', {
        title: '设计师列表',
        url: '/designer/editor/:id',
        templateUrl: 'app/pages/designer/designerEditor.html',
        controller: 'DesignerEditorController'
      });
  }

})();

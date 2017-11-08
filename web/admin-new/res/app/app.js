'use strict';

angular.module('JfjAdmin', [
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'ng.ueditor',
    'ngTouch',
    'toastr',
    'xeditable',
    'ui.slimscroll',
    'angular-progress-button-styles',
    'chart.js',

    'JfjAdmin.theme',
    'JfjAdmin.pages',
    'JfjAdmin.services',
    'JfjAdmin.components',
    'JfjAdmin.filters'
  ])
  .config(moduleConfig);

function moduleConfig(toastrConfig) {
  toastrConfig.timeOut = 2000;
  toastrConfig.positionClass = 'toast-top-right';
  toastrConfig.progressBar = true;
}

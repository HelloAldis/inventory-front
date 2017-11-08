/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.theme.components')
    .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
      controller: function ($scope, userApi) {
        $scope.logout = function () {
          userApi.signout().then(function (resp) {
            window.location.href = "/login.html";
          }, function (resp) {
            console.log(resp);
            window.location.href = "/login.html";
          })
        }
      }
    };
  }

})();

(function () {
  'use strict';

  angular.module('JfjAdmin.components')
      .directive('searchInput', searchInput);

  /** @ngInject */
  function searchInput() {
    return {
      scope:{
        delegate: '=',
        config: '='
      },
      restrict: 'E',
      templateUrl: 'app/components/searchInput/searchInput.html',
      controller: function( $scope, $element) {
        // 键入Enter
        $scope.myKeyup = function keyupListen(e, search_word) {
          var keycode = e.keyCode;
          if (keycode === 13) {
            $scope.search();
          }
        };

        // 搜索
        $scope.search = function (search_word) {
          $scope.delegate.search(search_word);
        }

        // 重置
        $scope.clearStatus = function () {
          $scope.delegate.clearStatus();
        }
      }
    }
  }
})();
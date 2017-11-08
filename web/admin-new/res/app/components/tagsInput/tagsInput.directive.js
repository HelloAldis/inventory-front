(function () {
  'use strict';

  angular.module('JfjAdmin.components')
      .directive('tagsInput', tagsInput);

  /** @ngInject */
  function tagsInput() {
    return {
      scope:{
        tagsInputModel: "="
      },
      restrict: 'E',
      templateUrl: 'app/components/tagsInput/tagsInput.html',
      link: function( $scope, elem, attr) {
        // 添加Tag方式 1: key (键入Enter)  2: button (点击确认)
        // 方式1
        $scope.myKeyup = function keyupListen(e) {
          var keycode = e.keyCode;
          if (keycode === 13) {
            $scope.addTag();
          }
        };

        // 方式2
        $scope.onblur = function() {
          if ($scope.textInput && $scope.textInput !== '') {
            $scope.addTag();
          }
        }

        // 添加Tag
        $scope.addTag = function() {
          $scope.tagsInputModel.push($scope.textInput);
          $scope.setInput();
        }

        // 移除Tag
        $scope.moveTag = function(index) {
          $scope.tagsInputModel.splice(index, 1);
        }

        $scope.setInput = function() {
          $scope.textInput = '';
        }
      }
    }
  }
})();
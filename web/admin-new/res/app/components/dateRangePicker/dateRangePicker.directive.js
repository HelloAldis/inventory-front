(function () {
  'use strict';

  angular.module('JfjAdmin.components')
      .directive('dateRangePicker', dateRangePicker);

  /** @ngInject */
  function dateRangePicker() {
    return {
      scope:{
        dtStart: '=',
        dtEnd: '=',
        delegate: '=',
        config: '='
      },
      restrict: 'E',
      templateUrl: 'app/components/dateRangePicker/dateRangePicker.html',
      controller: function( $scope, $element) {
        //时间筛选控件
        $scope.startTime = {
          clear: function () {
            this.dt = null;
          },
          dateOptions: {
            formatYear: 'yy',
            startingDay: 1
          },
          status: {
            opened: false
          },
          open: function ($event) {
            this.status.opened = true;
          },
          today: function () {
            this.dt = new Date();
          }
        };
        $scope.startTime.today();

        $scope.endTime = {
          clear: function () {
            this.dt = null;
          },
          dateOptions: {
            formatYear: 'yy',
            startingDay: 1
          },
          status: {
            opened: false
          },
          open: function ($event) {
            this.status.opened = true;
          },
          today: function () {
            this.dt = new Date();
          }
        };
        $scope.endTime.today();

        // 键入Enter 搜索
        $scope.myKeyup = function keyupListen(e, search_word) {
          var keycode = e.keyCode;
          if (keycode === 13) {
            $scope.delegate.search(search_word);
          }
        };

        // 结束时间改变
        $scope.setTime = function () {
          if ($scope.dtEnd) {
            $scope.dtEnd.setHours(23, 59, 39);
          }
        }
      }
    }
  }
})();
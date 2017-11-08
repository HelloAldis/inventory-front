/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('JfjAdmin.components')
    .directive('myCities', ['$timeout', 'initData', myCities]);

  /** @ngInject */
  function myCities($timeout, initData) {
    return {
            replace: true,
            scope: {
                myProvince: "=",
                myCity: "=",
                myDistrict: "="
            },
            restrict: 'E',
            templateUrl: 'app/components/myCity/myCities.html',
            controller: ['$scope', '$timeout', function ($scope, $timeout) {

                var timer = null;
                $scope.myProvince = !$scope.myProvince ? '湖北省' : $scope.myProvince;
                $scope.myCity = !$scope.myCity ? '武汉市' : $scope.myCity;
                $scope.myDistrict = !$scope.myDistrict ? '江岸区' : $scope.myDistrict;
                console.log($scope.myProvince,$scope.myCity,$scope.myDistrict);
                $scope.districtsArr = [];
                $scope.closeTimer = function () {
                    $timeout.cancel(timer);
                };
                $scope.closeSelect = function () {
                    $timeout.cancel(timer);
                    timer = $timeout(function () {
                        $scope.select.provinceShow = false;
                        $scope.select.cityShow = false;
                        $scope.select.districtShow = false;
                    }, 1000);
                };
                $scope.tdist = initData.tdist;
                $scope.list = {
                    province: $scope.tdist.province,
                    city: [],
                    district: []
                };
                $scope.index = {
                    province: 0,
                    city: 0,
                    district: 0
                };
                if ($scope.myProvince !== '请选择省份') {
                    $scope.index.province = findIndex($scope.tdist.province, $scope.myProvince) < 0 ? 0 : findIndex($scope.tdist.province, $scope.myProvince);
                }
                if ($scope.myCity !== '请选择市') {
                    $scope.index.city = findIndex($scope.tdist.city[$scope.index.province], $scope.myCity) < 0 ? 0 : findIndex($scope.tdist.city[$scope.index.province], $scope.myCity);
                }
                if ($scope.myDistrict !== '请选择县/区') {
                    $scope.index.district = findIndex($scope.tdist.district[$scope.index.province][$scope.index.city], $scope.myDistrict) < 0 ? 0 : findIndex($scope.tdist.district[$scope.index.province][$scope.index.city], $scope.myDistrict);
                }
                function findIndex(arr, name) {
                    var len = arr.length;
                    if (!len) {
                        return 0;
                    }
                    for (var i = 0; i < len; i++) {
                        if (arr[i].name === name) {
                            return i;
                        }
                    }
                    return -1;
                }

                $scope.select = {
                    provinceShow: false,
                    province: function (index, name) {
                        $scope.list.city = [];
                        $scope.index.province = index;
                        this.provinceShow = false;
                        $scope.myProvince = name;
                        $scope.myCity = "请选择市";
                        $scope.myDistrict = "请选择县/区";
                        $scope.select.cityShow = true;
                    },
                    cityShow: false,
                    city: function (index, name) {
                        $scope.list.district = [];
                        $scope.index.city = index;
                        this.cityShow = false;
                        $scope.myCity = name;
                        $scope.myDistrict = "请选择县/区";
                        $scope.select.districtShow = true;
                    },
                    districtShow: false,
                    district: function (index, name) {
                        this.districtShow = false;
                        $scope.myDistrict = name;
                    }
                };
                $scope.open = {
                    province: function () {
                        hide();
                        $scope.select.provinceShow = true;
                    },
                    city: function () {
                        hide();
                        $scope.select.cityShow = true;
                    },
                    district: function () {
                        hide();
                        $scope.select.districtShow = true;
                    }
                };
                function hide() {
                    $timeout.cancel(timer);
                    $scope.select.districtShow = false;
                    $scope.select.provinceShow = false;
                    $scope.select.cityShow = false;
                }
            }]
        };
  }
})();

(function () {
  'use strict';

  angular.module('JfjAdmin.services.util', [])
    .factory('mutiSelected', function () {

      function initMutiSelected(list, s) {
        if (!list || !s || !s.$in) {
          return;
        }

        initList(list, s.$in);
      }

      function getInQueryFormMutilSelected(list) {
        var ids = getCurId(list);
        return ids.length === 0 ? undefined : {
          '$in': ids
        };
      }

      function initList(list, ids) {
        if (!list || !ids) {
          return;
        }

        angular.forEach(ids, function (id, key) {
          angular.forEach(list, function (value, key) {
            if (value.id == id) {
              value.cur = true;
            }
          });
        });
      }

      function getCurId(list) {
        var ids = [];
        for (var value of list) {
          if (value.cur) {
            ids.push(value.id);
          }
        }

        return ids;
      }

      function curList(list, id) {
        angular.forEach(list, function (value, key) {
          if (value.id == id) {
            value.cur = !value.cur;
          }
        });
      }

      function clearCur(list) {
        angular.forEach(list, function (value, key) {
          value.cur = false;
        });
      }

      return {
        initMutiSelected: initMutiSelected,
        getInQueryFormMutilSelected: getInQueryFormMutilSelected,
        curList: curList,
        clearCur: clearCur
      };
    })
    .factory('queryUtil', function () {
      function getNMonth0Clock(n, date) {
        var time = getNDay0Clock(0, date);
        return new Date(time.setMonth(time.getMonth() + n, 1));
      }

      function getNWeek0Clock(n, date) {
        var time = getNDay0Clock(0, date);
        var diff = date.getDay() - 1;
        diff = diff == -1 ? 6 : diff;
        return new Date(time.setDate(time.getDate() - diff + (n * 7)));
      }

      function getNDay0Clock(n, date) {
        var time = date.getTime() + (n * 1000 * 60 * 60 * 24);
        date = new Date(time);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      function genQuerys(timeRanges, name, obj) {
        var querys = timeRanges.map(function (o) {
          var query = {};
          query[name] = o.range;
          for (var variable in obj) {
            if (obj.hasOwnProperty(variable)) {
              query[variable] = obj[variable];
            }
          }

          return query;
        });

        return querys;
      }

      return {
        getNMonth0Clock: getNMonth0Clock,
        getNWeek0Clock: getNWeek0Clock,
        getNDay0Clock: getNDay0Clock,
        genQuerys: genQuerys
      };
    });
})();

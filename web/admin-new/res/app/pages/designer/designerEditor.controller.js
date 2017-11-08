(function () {
  angular.module('JfjAdmin.pages.designer')
    .controller('DesignerEditorController', ['$scope', '$stateParams', 'adminDesigner', 
      function ($scope, $stateParams, adminDesigner) {
      	$scope.tagsInput = {};
      	adminDesigner.idAuth($stateParams.id)
      	.then(function (result) {
      		$scope.designer = result.data.data;
      	}, function (err) {
      		console.log(err);
      	});

      	$scope.editDesignLevel = function () {
      		adminDesigner.editDesigner({designer:$scope.designer})
      		.then(function (result) {
      			if (result.data.msg === 'success') {
      				window.history.back();
      			}
      		}, function (err) {
      			console.log(err);
      		})
      	}
      }
    ]);
})();
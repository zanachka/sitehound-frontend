ngApp.controller('addWorkspaceController', ['$mdDialog', '$scope', 'workspaceFactory',
    function ($mdDialog, $scope, workspaceFactory) {
    'use strict';


    $scope.cancel = $mdDialog.cancel;

    $scope.addItem = function () {
        $scope.item.form.$setSubmitted();

        if($scope.item.form.$valid) {
            workspaceFactory.add($scope.workspace.name).then(
                function (data) {
                    $mdDialog.hide();
                },
                function (err){
                    console.log(err);
                    if(err.message){
                        alert(err.message);
                    }
                }
            );
        }
    };
}]);

ngApp.controller('deleteWorkspaceController', ['deletedWorkspace', '$mdDialog', '$scope', '$q', 'workspaceFactory',
    function (deletedWorkspace, $mdDialog, $scope, $q, workspaceFactory) {
    'use strict';

    $scope.deletedWorkspace = deletedWorkspace;
    $scope.cancel = $mdDialog.cancel;

    $scope.deleteWorkspace = function(id) {

        workspaceFactory.deleteWorkspace(id).then(
            function (data) {
                $mdDialog.hide();
            },
            function (err){
                console.log(err);
                if(err.message){
                    alert(err.message);
                }
            }
        )
    }

    function onComplete() {
      $mdDialog.hide();
    }

}]);


ngApp.controller('workspaceController', ['$scope', '$filter', '$timeout','workspaceFactory', 'domFactory', '$mdDialog', '$mdEditDialog',
    function ($scope, $filter, $timeout, workspaceFactory, domFactory, $mdDialog, $mdEditDialog) {
    'use strict';

     $scope.master.init();

     $scope.workspace = null;

    $scope.workspaces = [];

    $scope.filter = {};
    $scope.filter.showOnlyMines = false;
    $scope.workspacesCount = 0;

    $scope.selected=[];
    if($scope.master.workspaceId){
        $scope.selected[0] = $scope.master.workspaceId;
    }


    $scope.addItem = function (event) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: 'addWorkspaceController',
        focusOnOpen: true,
        targetEvent: event,
        templateUrl: '/static/partials-md/workspace/add-item-dialog.html',
      }).then(getWorkspaces);
    };


//    $scope.editComment = function (event, workspace) {
//      // if auto selection is enabled you will want to stop the event
//      // from propagating and selecting the row
//      event.stopPropagation();
//      /*
//       * messages is commented out because there is a bug currently
//       * with ngRepeat and ngMessages were the messages are always
//       * displayed even if the error property on the ngModelController
//       * is not set, I've included it anyway so you get the idea
//       */
//      var promise = $mdEditDialog.small({
//        // messages: {
//        //   test: 'I don\'t like tests!'
//        // },
//        modelValue: workspace.name,
//        placeholder: 'Rename',
//        save: function (input) {
//          workspace.name = input.$modelValue;
//        },
//        targetEvent: event,
//        validators: {
//          'md-maxlength': 30
//        }
//      });
//
//      promise.then(function (ctrl) {
//        var input = ctrl.getInput();
//
//        input.$viewChangeListeners.push(function () {
//          input.$setValidity('test', input.$modelValue !== 'test');
//        });
//      });
//    };
/*

    $scope.$watch('query.filter', function (newValue, oldValue) {
      if(!oldValue) {
        bookmark = $scope.query.page;
      }

      if(newValue !== oldValue) {
        $scope.query.page = 1;
      }

      if(!newValue) {
        $scope.query.page = bookmark;
      }

      getDesserts();
    });


*/

    $scope.delete = function (id, name) {
        var workspace = {};
        workspace.id = id;
        workspace.name = name;

		function onDeleteSuccess(){
            $scope.master.onRemovedWorkspaceId(id);
            getWorkspaces();
		}

        $mdDialog.show({
            clickOutsideToClose: true,
            controller: 'deleteWorkspaceController',
            controllerAs: 'ctrl',
            focusOnOpen: true,
            targetEvent: event,
            locals: { deletedWorkspace: workspace},
            templateUrl: '/static/partials-md/workspace/delete-dialog.html',
        }).then(onDeleteSuccess);
    };


	$scope.status = "";
	$scope.loading = false;

	//TODO move this 2 to domFactory
	$scope.startLoading = function(){
		return $timeout(function(){$scope.loading = true;}, 1000);
	};

	$scope.endLoading = function(timeoutHandle){
		$timeout.cancel(timeoutHandle);
		$scope.loading = false;
	};



    $scope.query = {
        filter: '',
        limit: 10,
        orderBy: '-created',
        page: 1
    };

    $scope.originalQuery = $scope.query;

    function getWorkspaces(query) {

        var onSuccess = function (response) {
            $scope.workspaces = response.data.list;
            $scope.workspacesCount = response.data.count;
//            $scope.selected[0] = workspaceSelectedService.getSelectedWorkspaceId();
        };
        var onError = function(response) {
            // $scope.endLoading(tOut);
            var error = response.data;
            $scope.status = 'Unable to load customer data: ' + error.message;
        };

        // var qry = query || $scope.query;
        $scope.query = query || $scope.originalQuery;
		workspaceFactory.get($scope.query).then(onSuccess, onError);
	}

    $scope.prettyPrintWords = function(words) {
        var keywords = [];
        angular.forEach(words, function(v,k){
            keywords.push(" " + v.word + "("  + v.score + ")");
        });
        return keywords.join();
    };


    $scope.onReorder = function (order) {
        getWorkspaces(angular.extend({}, $scope.query, {orderBy: order}));
    };

    $scope.onPaginate = function (page, limit) {
        getWorkspaces(angular.extend({}, $scope.query, {page: page, limit: limit}));
    };

    $scope.mdOnSelect = function (workspaceId){
        console.log("workspace selected: " + workspaceId);
        $scope.master.setWorkspace(workspaceId);
    };

    $scope.mdOnDeselect = function (workspaceId){
        console.log("workspace deselected: " + workspaceId);
        $scope.master.onRemovedWorkspaceId(workspaceId);

    };

    $scope.setWorkspace = function (workspaceId){
        console.log("workspace selected: " + workspaceId);
        $scope.master.setWorkspace(workspaceId);
    };



//     function getDesserts(query) {
//         // $scope.selected = [];
//         var qry = query || $scope.query;
//         // return [];
// //      $scope.promise = $domainResource.domains.get(qry, success).$promise;
//         getWorkspaces(query);
//     }
//
//     getDesserts();
    getWorkspaces();

}])

.directive('workspace-row', function () {
	return {
	restrict : 'C',
		link: function(scope, element) {
			console.log(element);
			element.bind("click" , function(e){
				 element.parent().find("tr").removeClass("workspace-row-selected");
				 element.addClass("workspace-row-selected").removeClass("workspace-row-even");
			});
		}
	}
});

ngApp.controller('seedsController', ['$scope', '$filter', '$mdConstant','seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService', 'importUrlFactory',
function ($scope, $filter, $mdConstant, seedFactory, fetchService, seedUrlFactory, trainingService, importUrlFactory) {

    // $scope.master.init();

    /// BEGIN KEYWORD SEEDS

	$scope.relevantKeywordsObj=[];
	$scope.irrelevantKeywordsObj=[];
	$scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
	$scope.maxChips = 15;

	$scope.keywordHash = function(word, hash, score) {
	  return {
		word: word,
		hash: hash,
		score: score
	  };
	};

	$scope.getSeeds = function(workspaceId){
		if(!workspaceId){
			return;
		}
		seedFactory.get(workspaceId).then(
		function (response) {
			$scope.relevantKeywordsObj=[];
			$scope.irrelevantKeywordsObj=[];

			var words = response.data || [];
			angular.forEach(words, function(v,k){
				if(v.score>3){
					$scope.relevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
				else{
					$scope.irrelevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
			});

			$scope.relevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});

			$scope.irrelevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});
			$scope.master.keywordsCount = $scope.relevantKeywordsObj.length;
		},
		function(){}
		)
	};


	$scope.add = function(chip){
		var onSuccess = function (response) {
			$scope.getSeeds($scope.master.workspaceId);
		};

		var onError = function (response) {};

		seedFactory.save($scope.master.workspaceId, chip.word, chip.score).then(onSuccess, onError);
	}

	$scope.remove = function(chip){
		seedFactory.delete($scope.master.workspaceId, chip.hash).then(function(){
//		$scope.getSeeds()
		},
		function(){})
	}

    $scope.getSeeds($scope.master.workspaceId);

	/** END KEYWORD SEEDS  **/



    // BEGIN UPLOAD
	$scope.upload = {};

	$scope.import = function(ev) {
		if ($scope.upload.urlsToAdd == undefined || $scope.upload.urlsToAdd.length == 0){
			// alert('Please enter some urls');
            var custom = {};
            custom.title = 'URL/s not provided';
            custom.textContent = 'Please enter some URLs to fetch the data from.';
            $scope.master.showAlert(ev, custom);
            return;
		}
		importUrlFactory.save($scope.master.workspaceId, $scope.upload.urlsToAdd, $scope.upload.relevance).then(
			function(response){
				console.log(response.data);
			    $scope.upload.urlsToAdd="";
                $scope.showByurlProgressTab = true;
			},
			function(response){
				console.log(response);
			}
		)
    };

    $scope.showByurlProgressTab = false;



    $scope.results=[
        {"id":"_adfaf1", "host": "host1", "title": "title afaf 1"},
        {"id":"_adfaf2", "host": "host2", "title": "title afaf 2"},
        {"id":"_adfaf3", "host": "host3", "title": "title afaf 3"},
        {"id":"_adfaf4", "host": "host4", "title": "title afaf 4"},
        {"id":"_adfaf5", "host": "host5", "title": "title afaf 5"},
        {"id":"_adfaf6", "host": "host6", "title": "title afaf 6"},
        {"id":"_adfaf7", "host": "host7", "title": "title afaf 7"},
        {"id":"_adfaf8", "host": "host8", "title": "title afaf 8"},
        {"id":"_adfaf9", "host": "host9", "title": "title afaf 9"},
    ];

    $scope.results2=[
        {"id":"_adfaf21", "host": "host1", "title": "title afaf 1"},
        {"id":"_adfaf22", "host": "host2", "title": "title afaf 2"},
        {"id":"_adfaf23", "host": "host3", "title": "title afaf 3"},
        {"id":"_adfaf24", "host": "host4", "title": "title afaf 4"},
        {"id":"_adfaf25", "host": "host5", "title": "title afaf 5"},
        {"id":"_adfaf26", "host": "host6", "title": "title afaf 6"},
        {"id":"_adfaf27", "host": "host7", "title": "title afaf 7"},
        {"id":"_adfaf28", "host": "host8", "title": "title afaf 8"},
        {"id":"_adfaf29", "host": "host9", "title": "title afaf 9"},
    ];


	$scope.bottomOfPageReached = function(){
		Array.prototype.push.apply($scope.results, $scope.results2);
		// console.log("afafaf");
	}
}]);
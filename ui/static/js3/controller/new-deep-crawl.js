/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.sources = [
        {"name":"Search Engines", "code":"searchengine", "shortCode":"SE", "results":0},
        {"name":"Seeds", "code":"imported", "shortCode":"MANUAL", "results":0},
        {"name":"Onions", "code":"tor", "shortCode":"TOR", "results":0},
        // {"name":"DeepDeep", "code":"deepdeep", "shortCode":"DD", "results":0}
    ];

    $scope.selected = [];//["Seeds", "Onions", "Google", "Bing"];
    $scope.seedUrls = [];
    $scope.selectedResults=[];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;

    function init(){
        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            tab.nResults=null;
            tab.elems=[];
            tab.lastId=null;
            tab.selected=[];
            tab.allSelected=false;
            $scope.tabs[source.shortCode] = tab;
            fetch(tab);
        }
        $scope.getAggregated();
    }




    $scope.toggleAll = function() {
        if ($scope.selectedResults.length >= $scope.seedUrls.length) {
            // $scope.selected = [];
            $scope.selectedResults = [];
        } else if ($scope.selectedResults.length === 0 || $scope.selectedResults.length > 0) {
            // $scope.selected = $scope.items.slice();
            for(var i=0; i<$scope.seedUrls.length; i++){
                var idx = $scope.selectedResults.indexOf($scope.seedUrls[i]._id);
                if (idx == -1) {
                    $scope.selectedResults.push($scope.seedUrls[i]._id);
                }
            }
            var res = confirm("Mark all results?");
            if(res){
                console.log("in");
            }
            else{
                console.log("out");
            }
        }
        console.log($scope.selectedResults);
    };

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
        console.log($scope.selectedResults);
    };


    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.isIndeterminate = function() {
        // return $scope.selectedResults.length !== 0 && $scope.selectedResults.length !== $scope.seedUrls.length;
        return $scope.selectedResults.length !== 0 && $scope.selectedResults.length !== getTotalResults();
    };

    $scope.isChecked = function() {
        // return  $scope.selectedResults.length !== 0 && $scope.selectedResults.length === $scope.seedUrls.length;
        return  $scope.selectedResults.length !== 0 && $scope.selectedResults.length === getTotalResults();
    };


    // sub-main
    $scope.filterBySource = function (source) {
        console.log(source);
        $scope.toggle(source.code, $scope.filters.sources)
        $scope.filters.lastId = null;
        $scope.seedUrls=[];
        fetch();
    };


    /** Begins results */

	$scope.currentResults=0;
    $scope.showProgress=false;
	$scope.bottomOfPageReached = function(tab){
	    if($scope.showProgress){
	        return; // don't double do it
        }
	    $scope.showProgress=true;
	    console.log("bottomOfPageReached:" + tab);
		fetch(tab);
	};

    function fetch(tab){
        var filters = {};
        filters["sources"] = [tab.source.code];
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        seedUrlFactory.get($scope.master.workspaceId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				for(var i=0; i<tempResults.length;i++){

                }
				// Array.prototype.push.apply($scope.seedUrls, tempResults);
				Array.prototype.push.apply(tab.elems, tempResults);

				// $scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				// 	($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;

				tab.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					(tab.elems.length > 0 ? tab.elems[tab.elems.length-1]._id : null) ;

				$scope.showProgress=false;

			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }

    // TODO: how often to recalculate this?
    // $scope.currentResults=getTotalResults();



/*
    $scope.filters = {};
	$scope.filters.sources = [];
	$scope.filters.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;


	function fetch(){

        seedUrlFactory.get($scope.master.workspaceId, $scope.filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				for(var i=0; i<tempResults.length;i++){

                }
				Array.prototype.push.apply($scope.seedUrls, tempResults);

				$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;

				$scope.currentResults=getTotalResults();
			},
			function (response) {
				console.log(response);
			});
	}

    fetch();
*/




//TODO count the total results:


/** aggregated results by source */

	$scope.getAggregated = function() {
        // var tOut = $scope.startLoading();
		seedUrlFactory.getAggregated($scope.master.workspaceId)

			.then(
			    function (response) {
                    buildAggregatedBy(response.data);
                    // $scope.endLoading(tOut);
                },
                function (error) {
                    // $scope.endLoading(tOut);
                    $scope.status = 'Unable to load data: ' + error.message;
                }
			);
            // isRunning = false;
	};

    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
        };
        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["neutral"] ;
        });
        // $scope.resultStruct = resultStruct ;


        setTabsValue("SE", resultStruct["SE"]["total"]);
        setTabsValue("MANUAL", resultStruct["MANUAL"]["total"]);
        setTabsValue("TOR", resultStruct["TOR"]["total"]);
        // setTabsValue("DD", resultStruct["DD"]["total"]);
    }

    // function setSourcesValue(shortCode, value){
    //     for(var i=0; i<$scope.sources.length;i++){
    //         if($scope.sources[i].shortCode==shortCode){
    //             $scope.sources[i].results=value;
    //             break;
    //         }
    //     }
    // }

    function setTabsValue(shortCode, value){
        $scope.tabs[shortCode].nResults=value;
    }

    function getTotalResults(){
        var acum =0;
         // for(var i=0; i<$scope.sources.length;i++){
         //    if($scope.filters.sources.length==0 || $scope.filters.sources.indexOf($scope.sources[i].code)>-1){
         //        acum += $scope.sources[i].results;
         //    }
         // }
         return acum;
    }


    /**
     * sends
     * 1) for the ones displayed, the checked status
     * 2) for the ones not yet fetched, the main/submain checkbox status
     * @param ev
     */
	$scope.newDeepCrawl = function (ev) {
	    console.log(ev);
        alert("deepcrawl!");
    }


    init();
}]);


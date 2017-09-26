//Tabs Controller
app.controller('TabsDemoCtrl', function ($scope, $window, $document, $http, NgTableParams) {

	$scope.uniParamList = [];
	$scope.tableParams = new NgTableParams({ count: 10});

	$scope.uniParamBytes = '';

	$scope.loadfile = function (ele) {
		var files = ele.files;
		var reader = new FileReader();
		reader.onload = function () {		 
		  $http.post('http://localhost:8888/getTableUniParam', new Uint8Array(reader.result)).
		  then(function(response) {  
				$scope.uniParamList = response.data.positions;
				$scope.tableParams.settings({ dataset: $scope.uniParamList });

				$scope.uniParamBytes = response.data.bytes;
		  });

		}
		reader.readAsArrayBuffer(files[0]);
	}

	$scope.toReal = function (uni){
		var data = {};
		data.indexName = uni.index;
		data.srcData = $scope.uniParamBytes;

		$http.post('http://localhost:8888/modifyRegUniParam', data).
		then(function(response) {
			$scope.uniParamList = response.data.positions;
			$scope.tableParams.settings({ dataset: $scope.uniParamList });
			$scope.tableParams.reload();

			$scope.uniParamBytes = response.data.bytes;
		});
	}
})

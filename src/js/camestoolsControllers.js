//Controller
app.controller('TabsDemoCtrl', function ($scope, $window, $document, $http, $uibModal, NgTableParams) {

	$scope.uniParamList = [];
	$scope.uniParamBytes = '';
	$scope.mergeBytes = '';
	$scope.tableParams = new NgTableParams({ count: 10});

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
	
	$scope.merge = function (ele) {
		var files = ele.files;
		var reader = new FileReader();
		reader.onload = function () {		 
		  $http.post('http://localhost:8888/getUniParamForMerge', new Uint8Array(reader.result)).
		  then(function(response) {
				//To merge data
				$scope.mergeBytes = response.data.bytes;
				
				var data = {};				
				data.srcData = $scope.uniParamBytes;
				data.toMergeData = $scope.mergeBytes;
		
				$http.post('http://localhost:8888/mergeUniParam', data).
				then(function(response) {
					$scope.uniParamList = response.data.positions;
					
					var current = $scope.tableParams.page();
					$scope.tableParams.settings({ dataset: $scope.uniParamList });
					$scope.tableParams.reload();
					$scope.tableParams.page(current);
		
					$scope.uniParamBytes = response.data.bytes;
				});
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

			var current = $scope.tableParams.page();
			$scope.tableParams.settings({ dataset: $scope.uniParamList });
			$scope.tableParams.reload();
			$scope.tableParams.page(current);

			$scope.uniParamBytes = response.data.bytes;
		});
	}

	$scope.addReal = function (uni, addNumKit){
		var data = {};
		data.indexName = uni.index;
		data.srcData = $scope.uniParamBytes;
		data.numKit = addNumKit;

		$http.post('http://localhost:8888/addRegUniParam', data).
		then(function(response) {
			$scope.uniParamList = response.data.positions;
			
			var current = $scope.tableParams.page();
			$scope.tableParams.settings({ dataset: $scope.uniParamList });
			$scope.tableParams.reload();
			$scope.tableParams.page(current);

			$scope.uniParamBytes = response.data.bytes;
		});
	}

	$scope.getFile = function (){
		var obj = JSON.parse($scope.uniParamBytes);
		var arr = Object.keys(obj).map(function(k) { return obj[k] });
		var sampleBytes = new Int8Array(arr);
		saveByteArray([sampleBytes], 'UniformParameter.bin.unzlib');
	}

	var saveByteArray = (function () {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		return function (data, name) {
			var blob = new Blob(data, {type: "octet/stream"}),
				url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = name;
			a.click();
			window.URL.revokeObjectURL(url);
		};
	}());

	$scope.editKitConfig = function (uni){
		var bytesData = $scope.uniParamBytes;

		var modalInstance = $uibModal.open({
	      templateUrl: 'kitConfig.html',
	      size: 'lg',
		  controller: function ($scope, $uibModalInstance) 
		  {
			  	$scope.title = uni.filename;			  
			  	//
				$scope.filenames = [];
				$scope.tableFileNamesKit = new NgTableParams({ count: 5 },{ counts: [] });
				$scope.colors = [];
				$scope.tableColorKit = new NgTableParams({ count: 5 },{ counts: [] });
				
				var data = {};
				data.indexName = uni.index;
				data.srcData = bytesData;
				$http.post('http://localhost:8888/getConfigData', data).
				then(function(response) {
					$scope.filenames = response.data.filenames;
					$scope.tableFileNamesKit.settings({ dataset: $scope.filenames });
					$scope.tableFileNamesKit.reload();

					$scope.colors = response.data.colors;
					$scope.tableColorKit.settings({ dataset: $scope.colors });
					$scope.tableColorKit.reload();
				});

				//
				$scope.importParamBytes = '';
				$scope.importCfg = function (ele) {
					var files = ele.files;
					var reader = new FileReader();
					reader.onload = function () {		 
					  $http.post('http://localhost:8888/loadConfigImport', new Uint8Array(reader.result)).
					  then(function(response) {				
						$scope.importParamBytes = response.data; 
						$uibModalInstance.close($scope.importParamBytes);
					  });
			
					}
					reader.readAsArrayBuffer(files[0]);
				}

				//
				$scope.ok = function () {
					$uibModalInstance.close();
				};			
				$scope.cancel = function () {
					$uibModalInstance.dismiss('cancel');
				};
	      }
		});
		modalInstance.result.then(function(importData) {
            var data = {};
			data.indexName = uni.index;
			data.srcData = $scope.uniParamBytes;
			data.newData = importData;
	
			$http.post('http://localhost:8888/importCfgUniParam', data).
			then(function(response) {
				$scope.uniParamList = response.data.positions;
				
				var current = $scope.tableParams.page();
				$scope.tableParams.settings({ dataset: $scope.uniParamList });
				$scope.tableParams.reload();
				$scope.tableParams.page(current);
	
				$scope.uniParamBytes = response.data.bytes;
			});
        })
	}
})

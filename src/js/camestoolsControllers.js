//Tabs Controller
app.controller('TabsDemoCtrl', function ($scope, $window, $document, $http, $uibModal, NgTableParams) {

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

	$scope.addReal = function (uni){
		var data = {};
		data.indexName = uni.index;
		data.srcData = $scope.uniParamBytes;

		$http.post('http://localhost:8888/addRegUniParam', data).
		then(function(response) {
			$scope.uniParamList = response.data.positions;
			$scope.tableParams.settings({ dataset: $scope.uniParamList });
			$scope.tableParams.reload();

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
		$uibModal.open({
	      templateUrl: 'kitConfig.html',
	      size: 'lg',
	      controller: function ($scope, $uibModalInstance) {

	      	$scope.title = uni.filename;
			$scope.filenames = [];
	      	$scope.tableFileNamesKit = new NgTableParams({ count: 5 },{ counts: [] });

			var data = {};
			data.indexName = uni.index;
			data.srcData = bytesData;

			$http.post('http://localhost:8888/getConfigData', data).
			then(function(response) {
				$scope.filenames = [response.data.filenameKit, response.data.filenameBack, response.data.filenameChest, response.data.filenameLeg, response.data.filenameName];
				$scope.tableFileNamesKit.settings({ dataset: $scope.filenames });
				$scope.tableFileNamesKit.reload();
			});	      	

	        $scope.ok = function () {
	          $uibModalInstance.close();
	        };
	      
	        $scope.cancel = function () {
	          $uibModalInstance.dismiss('cancel');
	        };
	      }
    })
	}
})

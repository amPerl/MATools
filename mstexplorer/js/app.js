+function()
{
	var module = angular.module("maTools", ["angularUtils.directives.dirPagination", "ngStorage"]);

	module.controller("maTools", ["$scope", "$localStorage", function ($scope, $localStorage)
	{
		// Set storage defaults.
		$localStorage.$default({

			// Default settings
			settings: {
				itemsPerPage: 30
			}

		});

		var reader = new MSTReader();

		function loadFilesArray(filesArray, callback)
		{
			if (filesArray.length > 1)
			{
				Materialize.toast("More than one file was selected.", UI.TOAST_LONG, UI.ERROR_CLASS);
				callback && callback(null, new UIError("More than one file was selected."));
				return;
			}

			var file = filesArray[0];
			reader.load(file, function (files, error)
			{
				if (error)
				{
					Materialize.toast(error.message, UI.TOAST_LONG, UI.ERROR_CLASS);
					callback && callback(null, error);
					return;
				}

				$scope.files = files;
				$scope.$apply(); // Update view.

				Materialize.toast("Found " + files.length + " files.", UI.TOAST_SHORT);
				callback && callback(files);
			});
		}

		$("#settingsOpener").leanModal();

		$scope.files = null;
		$scope.fileTypes =
		[
			{
				"extension": "WLD",
				"name": "Levels",
				"description": "World levels (.WLD)",
				"checked": true
			},
			{
				"extension": "TGA",
				"name": "Textures",
				"description": "Textures (.TGA)",
				"checked": true
			},
			{
				"extension": "APE",
				"name": "Models",
				"description": "3D models (.APE)",
				"checked": true
			},
			{
				"extension": "FPR",
				"name": "Particles",
				"description": "Particle effects (.FPR)",
				"checked": true
			},
			{
				"extension": "WVB",
				"name": "Sounds",
				"description": "Wavebanks containing multiple sounds (.WVB)",
				"checked": true
			},
			{
				"extension": "CSV",
				"name": "CSV tables",
				"description": "Compiled CSV tables (.CSV)",
				"checked": true
			},
			{
				"extension": "other",
				"name": "Other",
				"description": "Other filetypes not yet identified",
				"checked": true
			}
		];
		$scope.settingsForm = [
			{
				"type": "range", // The element input type.
				"meta": {min: 5, max: 100, step: 5},
				"class": "validate", // Classes to apply to the input element.
				"setting": "itemsPerPage", // The setting key in $scope.settings.
				"text": "Files per page",
				"description": "The number of files to show per page."
			}
		];

		$scope.settings = $localStorage.settings;

		$scope.search_filename = "";
		$scope.filter = { query: "", fileTypes: {} };

		// Apply default checked state to filter
		for (var i in $scope.fileTypes)
			$scope.filter.fileTypes[$scope.fileTypes[i].extension.toUpperCase()] = $scope.fileTypes[i].checked;

		// Watch for changes to filename search input and update.
		$scope.$watch("search_filename", function (newVal, oldVal)
		{
			if (newVal == oldVal)
				return;

			$scope.applyFilters();
		});

		$("#dropzone").dragster({
			enter: function (ev)
			{
				$(this).addClass("hover");
			},
			leave: function (ev)
			{
				$(this).removeClass("hover");
			},
			drop: function (ev, jEvent)
			{
				$(this).removeClass("hover");
				var dataTransfer = jEvent.originalEvent.dataTransfer;
				loadFilesArray(dataTransfer.files);
			}
		});

		$scope.applyFilters = function ()
		{
			$scope.filter.query = $scope.search_filename;

			$scope.filter.fileTypes = {};
			for (var i in $scope.fileTypes)
			{
				var fileType = $scope.fileTypes[i];
				$scope.filter.fileTypes[fileType.extension] = fileType.checked;
			}
		};

		$scope.toggleFiletypeCheckboxes = function (state)
		{
			for (var i in $scope.fileTypes)
			{
				var fileType = $scope.fileTypes[i];
				fileType.checked = state;
			}

			$scope.applyFilters();
		};

		$scope.browseForFile = function ()
		{
			var elm = $("#fileBrowser");

			function onChange()
			{
				loadFilesArray(elm[0].files);
			}

			elm.unbind("change").one("change", onChange);
			elm.click();
		};
	}]);
}();

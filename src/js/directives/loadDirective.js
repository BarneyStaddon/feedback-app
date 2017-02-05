/**
 * loadDirective.js
 */

(function () {
				
	'use strict';

	var app = angular.module('commentApp');

	app.directive('commentLoader', function() {
		
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {

				var offset = elem.offset();				
				var threshold = 100;

				$(window).scroll(function(){

					var listHeight = elem.prop('scrollHeight');
					var scrollAmount =  $(window).scrollTop();
					var totalPageHeight = $('body').prop('scrollHeight'); 

					//when within threshold
					if( ((totalPageHeight - window.innerHeight) - scrollAmount) <= threshold ){
						
						scope.lazyLoading = true;
						scope.moreLoading = true;
						scope.showEnd = false;
						scope.$apply();
						scope.debouncedFetch();
						scope.scrollAmount = scrollAmount;	
					}
				});
			}
		};
	});

	app.directive('commentLoaderModerate', function() {
		
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {

				var offset = elem.offset();				
				var threshold = 100;

				$(window).scroll(function(){

					if(scope.useLazy){ //only use on see all page

						var listHeight = elem.prop('scrollHeight');
						var scrollAmount =  $(window).scrollTop();
						var totalPageHeight = $('body').prop('scrollHeight'); 

						//when within threshold
						if( ((totalPageHeight - window.innerHeight) - scrollAmount) <= threshold ){

							scope.lazyLoading = true;
							scope.moreLoading = true;
							//scope.showEnd = false;
							scope.$apply();
							scope.debouncedFetch();
							scope.scrollAmount = scrollAmount;	
						}
					}
					else if(scope.searchLazy){
						var listHeight = elem.prop('scrollHeight');
						var scrollAmount =  $(window).scrollTop();
						var totalPageHeight = $('body').prop('scrollHeight'); 

						//when within threshold
						if( ((totalPageHeight - window.innerHeight) - scrollAmount) <= threshold ){

							scope.lazyLoading = true;
							scope.moreLoading = true;
							scope.showEnd = false;
							scope.$apply();
							scope.debouncedSearch();
							scope.scrollAmount = scrollAmount;	
						}
					}
				});
				
			}
		};
	});
 
}());
/**
 * formDirective.js
 */

(function () {
        
    'use strict';

    var app = angular.module('commentApp');

	app.directive('commentForm', function() {
  	
  		return {
      		restrict: 'AE',
      		replace: 'false',
      		link: function(scope, elem, attrs) {

                var collapser = function(scope, elem){

                    if(scope.data.comment != null){
                        
                        $('.comments-spacer').animate({height:'108px'}, 400);

                        elem.slideUp({complete:function(){

                          $('.comments-inst').css( "position", "fixed" );

                        } });
                        elem.trigger('collapse');
                    }
                    else{
                        scope.emptyComment = true;
                        scope.$apply();
                    } 
                    
                }

                var collapseWatcher = scope.$watch("commentAdded", function(newValue, oldValue) {
                    if(newValue === oldValue){
                        return;
                    }
                    collapseWatcher(); //tidy up
                    collapser(scope, elem);
                });

                document.getElementById('name-input').focus(); 

    		}
      		
  		};
	});
 
}());
/**
 * commentController.js
 */

(function () {
        
    'use strict';

    var app = angular.module('commentApp');
    
    app.controller('QuestionsController', [ '$scope',
    										'$routeParams',
                                            'questions',
                                            'CommentFactory',

                                            function ($scope, $routeParams, questions, CommentFactory) {

        $scope.q1 = questions[0];
        $scope.q2 = questions[1];
        $scope.q3 = questions[2];
        $scope.totals = null;

        $scope.getTotals = function(){

            CommentFactory.getCommentTotals(questions.length, function(response) {
                    
                    if(response.data === '0'){

                       console.log('oops');

                    }
                    else{ //we have comments

                        if(response.data.constructor === Array){ //check definitely have some
                            
                            console.log(response.data);
                            $scope.totals = response.data;
                        }
                        else{
                           console.log('problem getting totals');
                        }
                    }

                }, function(response){
                    
                    //cannot get totals
                    console.log('Problem getting totals data: ' + response.status);
                });
        };


        /* 
        	Add listeners to control the arrow behavior which is inconsistent on the logitech keyboard used
			Also need to ensure that we remove the listeners when the user touches or 'enter' a link and changes page 

        */

        document.addEventListener('keydown', keyArrowListener, false);
        document.addEventListener('touchstart', touchArrowListener, false);

        function keyArrowListener(e){
    		
    		var code = (e.keyCode ? e.keyCode : e.which);

    		if(code == 13){ //enter 

    			if( document.activeElement.id == 'question1' ||
    			    document.activeElement.id == 'question2' ||
    			    document.activeElement.id == 'question3') {

    			    //we're going to the next page 
    				document.removeEventListener('keydown', keyArrowListener, false);
    				document.removeEventListener('touchstart', touchArrowListener, false);
    			}
    		}
 			
 			if(code == 40){ //down arrow

 				var q = Number(document.activeElement.id.substr(document.activeElement.id.length - 1)); 
 				q++;
 				if(q > 3) q = 1;
   				document.getElementById('question'+ q).focus();
 			}

 			if(code == 38){ //up arrow
 				
 				var q = Number(document.activeElement.id.substr(document.activeElement.id.length - 1));  
 				q--;
 				if(q < 1) q = 3;
   				document.getElementById('question'+ q).focus();
  			}
    	}

    	function touchArrowListener(e){

    		if(e.target.tagName === 'A' || e.target.parentElement.tagName === 'A'){

    			//user over a link so we remove the listeners
    			document.removeEventListener('keydown', keyArrowListener, false);
    			document.removeEventListener('touchstart', touchArrowListener, false);

    		}
    	}

        $scope.getTotals();


    }]);
 
}());
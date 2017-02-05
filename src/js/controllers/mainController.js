/**
 * mainController.js
 */

(function () {
        
    'use strict';

    var app = angular.module('commentApp');
    
    app.controller('MainController', [	'$scope', 
    									'$http', 
    									'$location',
    									'baseURL',
                                        'useTimeout',
                                        'timeout',
                                        'countdownStart', 

    									function ($scope,$http,$location,baseURL,useTimeout,timeout,countdownStart) {
    	
    	$scope.timer = null;
    	$scope.idleTime = 0;
        $scope.countdown = countdownStart;
        $scope.showCountdown = false;
        $scope.preCountdownFocus = null;
        $scope.showTerms = false;

        $scope.toggleTermsPanel  = function(use){

            $scope.showTerms = !$scope.showTerms;

            if(use == 1){
                setTimeout(function(){
                    document.getElementById('terms-ok').focus();
                },10);
            } 
        }
 
    	function keydownListener(e){
    		var code = (e.keyCode ? e.keyCode : e.which);
 			if(code == 13) { //Enter keycode
   				removeListeners();
   				startTimer();
 			}
    	}

    	function touchStartListener(e){
    		removeListeners();
    		startTimer();
    	}
    	
    	//Initially detect when user has hit 'enter' (but not 'tab') on the keyboard or touched the screen
    	//just so we know they've interacted at all (and got onto the questions page)
    	function addListeners(){

    		document.addEventListener('keydown', keydownListener, false);
			document.addEventListener('touchstart', touchStartListener, false);
    	}

    	//then remove that detection
    	function removeListeners(){
    		
    		document.removeEventListener('keydown', keydownListener, false);
			document.removeEventListener('touchstart', touchStartListener, false);
    	}

        //resets the constant timer
    	function timerListener(e){
    		$scope.idleTime = 0;
    	}

    	function addTimerListeners(){
    		document.addEventListener('keydown', timerListener, false);
    		document.addEventListener('touchstart', timerListener, false);
    	}
    	
    	function startTimer(){

    		addTimerListeners();

    		$scope.timer = setInterval(function(){

    			$scope.idleTime = $scope.idleTime + 1;

                if($scope.idleTime > (timeout - (countdownStart + 1))){ //show countdown overlay

                    //store the focus so we can reset it when/if user resumes
                    if($scope.preCountdownFocus == null) $scope.preCountdownFocus = document.activeElement;
                    
                    if($scope.idleTime == (timeout - countdownStart)){ //only add these once
                        
                        //need seperate listeners here (that use $apply) to remove the countdown overlay 
                        document.getElementById('countdown').addEventListener('keydown', countdownListener, false);
                        document.getElementById('countdown').addEventListener('touchstart', countdownListener, false);
                    } 

                    $scope.showCountdown = true;
                    $scope.countdown = timeout - $scope.idleTime;
                    $scope.$apply()
                    $("#countdown").focus();
                }

    			if($scope.idleTime > (timeout - 1)){ //20 seconds			
    				window.location.replace(baseURL);
    			}

    		},1000);
    	}

        function countdownListener(e){

            document.getElementById('countdown').removeEventListener('keydown', countdownListener, false);
            document.getElementById('countdown').removeEventListener('touchstart', countdownListener, false);
            
            //we need a slight delay to prevent a tap also activating any links below the tap spot 
            setTimeout(function(){
                $scope.showCountdown = false;
                $scope.countdown = countdownStart;
                $scope.$apply();
                $scope.preCountdownFocus.focus(); //set focus back to where it was
                $scope.preCountdownFocus = null;
            },500);

            
        } 


    	if(useTimeout) addListeners();
         
    }]);
 
}());




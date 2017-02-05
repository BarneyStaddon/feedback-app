/**
 * main.js
 */
 
(function () {
    
    'use strict';
    
    angular.module('commentApp', ['ngRoute']);

    var app = angular.module('commentApp');

    /* CONSTANTS */
    app.constant('questions', [ "What excites you most about the designs presented here?",
    							"If you could put anything in the new Museum of London, what would it be?",
    							"How should the new Museum of London feel?"	 ]);


	app.constant('baseURL', 'http://localhost/comment2/src/');
    app.constant('apiURL', 'http://localhost/comment2/api/comments/');
    //app.constant('baseURL', 'http://apps.museumoflondon.org.uk/new_comment');
    //app.constant('apiURL', 'http://apps.museumoflondon.org.uk/new_comment/api/comments/');
    
    app.constant('useTimeout', false); //toggle timeout
    app.constant('timeout', 45); //seconds of inactivity before returns to home screen
    app.constant('countdownStart', 10); //remaining seconds before returns to home screen when starts visual countdown
    app.constant('commentsChunkSize', 7); //default number of comments first pulled in 
    app.constant('debounceTime', 500); //milliseconds wait before fetching more constants if scroll lazy loading used (basically, throttling ajax calls)  
    
	/* CONFIG */    

    app.config( ['$routeProvider', function($routeProvider){

     		
     		$routeProvider
     		.when('/', {
				templateUrl: 'js/partials/intro.html'
			})
     		.when('/questions', {
				templateUrl: 'js/partials/questions.html',
				controller: 'QuestionsController'
			})
			.when('/mod', {
				templateUrl: 'js/partials/questions-mod.html',
				controller: 'QuestionsController'
			})
			.when('/comments/:questionId', {
				templateUrl: 'js/partials/comments.html',
				controller: 'CommentController'
			})
			.when('/moderate/:questionId', {
				templateUrl: 'js/partials/moderate.html',
				controller: 'ModerateController'
			})
			.otherwise({
				redirectTo: '/'
			});			

    	}]);

})();
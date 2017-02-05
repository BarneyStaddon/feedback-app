/**
 * commentFactory.js
 */

(function () {
        
    'use strict';

    var app = angular.module('commentApp');

    app.factory('CommentFactory', ['$http','apiURL', function($http,apiURL){
	    
    	return {
	        
	        fetchComments: function(questionID, limit, lastCommentDate, successCB, errorCB){
            
                var url = '';

                if(lastCommentDate == null){
                    url = apiURL + 'fetch/' + questionID + '/' + limit;
                }
                else url = apiURL + 'fetch/' + questionID + '/' + limit + '/' + lastCommentDate;

	            $http.get(url)
	                .then(function(response) {
	                	successCB(response);
	                    }, function(response) {
	                	errorCB(response);
	            });

            },

            getCommentTotals: function(numQuestions, successCB, errorCB){

                var url = apiURL + 'totals/' + numQuestions;

                $http.get(url)
                    .then(function(response) {
                        successCB(response);
                        }, function(response) {
                        errorCB(response);
                });
            }, 

            addComment: function(payload, successCB, errorCB){

            	 $http.post(apiURL + 'add', payload)
            	 	.then(function(response) {
                    	successCB(response);
                		}, function(response) {
                    	errorCB(response);
            	});


            },

            toggleCommentVisibility: function(payload, successCB, errorCB){

            	 $http.post(apiURL + 'toggle', payload)
            	 	.then(function(response) {
                    	successCB(response);
                		}, function(response) {
                    	errorCB(response);
            	});

	    	},

            
            //moderation functions

            search: function(payload, successCB, errorCB){

                $http.post(apiURL + 'search', payload)
                    .then(function(response) {
                        successCB(response);
                        }, function(response) {
                        errorCB(response);
                });
            },
	    
	    }
	    
	}]);
    
}());
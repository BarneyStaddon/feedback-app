/**
 * commentController.js
 */

(function () {
        
    'use strict';

    var app = angular.module('commentApp');
    
    app.controller('CommentController', [   '$scope',
                                            '$routeParams',
                                            'CommentFactory',
                                            'commentsChunkSize',
                                            'debounceTime',
                                            'questions',

                                            function ($scope, $routeParams, CommentFactory, commentsChunkSize, debounceTime, questions) {
         
        var questions = {   1 : questions[0],
                            2 : questions[1],
                            3 : questions[2] }; 

        $scope.comments = [];
        $scope.commentAdded = false;
        $scope.lastCommentShownDate = null;
        $scope.loading = true;
        $scope.moreLoading = false;
        $scope.lazyLoading = false;
        $scope.noComments = false;
        $scope.emptyComment = false;
        $scope.probComments = false;
        $scope.probAdding = false;
        $scope.upArrow = false;
        $scope.downArrow = true;
        $scope.showEnd = false;
        $scope.firstNameCheck = null;
        $scope.commentCheck = null;
        $scope.data = { firstName: null,
                        comment: null,   
                        question:  questions[ $routeParams.questionId ] };
        

        $scope.addComment = function() {

            if($scope.data.comment != null){

                //test
                var comment = $scope.data.comment;
                comment = comment.replace(/(\r\n|\n|\r)/gm,"");

                if(comment.length < 1){
                   document.getElementById('comment-input').focus();
                   return; 
                }

                ////// CHECK AS CAN FIRE TWICE ON TABLET /////

                if( $scope.data.firstName == $scope.firstNameCheck && $scope.commentCheck == $scope.data.comment ) {
                    return;
                }

                $scope.firstNameCheck = $scope.data.firstName;
                $scope.commentCheck = $scope.data.comment;

                //////////////////////////////////////////////

                $scope.emptyComment = false;

                CommentFactory.addComment({ firstname:$scope.data.firstName, comment:$scope.data.comment, questionId:$routeParams.questionId}, function(response) {

                        if(response.data === '1'){

                            $scope.probAdding = false;
                            $scope.lastCommentShownDate = null;
                            $scope.fetchComments(true, commentsChunkSize*2);
                            $scope.commentAdded = true;
                        }
                        else{
                            //hack to remove newline char
                            $scope.data.comment = $scope.data.comment + ' ';
                            $scope.probAdding = true;
                        }

                    }, function(response){
                        $scope.data.comment = $scope.data.comment + ' ';
                        $scope.probAdding = true;
                        console.log('Problem adding comment: ' + response.status);
                    });

            }
            else{

                $scope.emptyComment = true;
            }
        };


        $scope.cleanComment = function(comment) {

            //remove escaped apostrophes
            var cleanComment = comment.replace(/\\/g,''); 
            //remove quotation mark entities
            cleanComment = cleanComment.replace(/&quot;/g,'"');
            return cleanComment;
        };


        $scope.fetchComments = function(refresh, commentsSize) {

            var limit = commentsSize ? commentsSize : commentsChunkSize; 

            CommentFactory.fetchComments($routeParams.questionId, limit, $scope.lastCommentShownDate, function(response) {
                
                    $scope.loading = false;
                    $scope.lazyLoading = false;
                    
                    if(response.data === '0'){

                        //if we're showing comments already we don't want to show the 'no comments' message
                        if($scope.comments.length < 1) $scope.noComments = true;
                        else{
                            $scope.downArrow = false;
                            $scope.moreLoading = false;
                            $scope.showEnd = true;
                            //$scope.upArrow = true;
                        }

                    }
                    else{ //we have comments
                        
                        $scope.noComments = false;
                        $scope.probComments = false;
                        $scope.moreLoading = false;

                        if(response.data.comments.constructor === Array){ //check definitely have some
                            if(refresh) $scope.comments = [];
                            $scope.comments.push.apply($scope.comments, response.data.comments);
                            $scope.lastCommentShownDate = response.data.paging.next;
                        }
                        else{
                            $scope.probComments = true;
                        }
                    
                    }

                }, function(response){
                    $scope.loading = false;
                    $scope.probComments = true;
                    console.log('Problem getting data: ' + response.status);
                });
        };

        //so we don't make loads of calls when user bumps bottom
        $scope.debouncedFetch = _.debounce($scope.fetchComments, debounceTime); 
        
        $scope.fetchComments();

        //see instructions in place-holder
        document.getElementById('name-input').addEventListener('keydown', function(e){
            
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code == 13) {
                    document.getElementById('comment-input').focus();

                    setTimeout( function() {
                            document.getElementById('comment-input').value= "";
                        }, 0);
                }  
            
            },false);

        //see instructions in place-holder
        document.getElementById('comment-input').addEventListener('keydown', function(e){
            
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code == 13) {
                    if($scope.data.comment != null && $scope.data.comment.length > 0){
                        $scope.addComment();
                    }
                    else{
                        $scope.emptyComment = true;
                        $scope.data.comment = null;
                        $scope.$apply();
                        
                        /* TO DO (ideally)

                        Remove any newline chars and get the placeholder instruction showing again

                        */

                        document.getElementById('comment-input').value = "";
                    }
                }  
            
            },false);

    }]);
 
}());
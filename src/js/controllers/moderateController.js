(function () {
        
    'use strict';

    var app = angular.module('commentApp');
    
    app.controller('ModerateController', [  '$scope',
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
        $scope.lastCommentShownDate = null;
        $scope.lastSearchType = null;
        $scope.loading = true;
        $scope.lazyLoading = false;
        $scope.searchLazy = false;
        $scope.noComments = false;
        $scope.probComments = false;
        $scope.noResults = false;
        $scope.showEnd = false;
        $scope.useLazy = false;
        $scope.data = { firstName: null,
                        comment: null,   
                        question:  questions[ $routeParams.questionId ],
                        searchTerm: null };

        $scope.show = true;


        $scope.cleanComment = function(comment) {

            //remove escaped apostrophes
            var cleanComment = comment.replace(/\\/g,''); 
           //remove quotation mark entities
            cleanComment = cleanComment.replace(/&quot;/g,'"');
        
            return cleanComment;
        };

        $scope.getButtonLabel = function(visibility){
            return visibility == 1 ? 'Hide' : 'Show';
        }; 

        $scope.toggleComment = function(commentProps) {

            var comment = $scope.cleanComment(commentProps.comment);
            if(comment.length > 50) comment = comment.substring(0,49)+"...";

            var visibilityVerb = commentProps.visibility == 1 ? 'Hide' : 'Show';

            var r = confirm(visibilityVerb + " the following comment by " + commentProps.firstname + "?\n" + comment);
            if (r == true) {
                
                CommentFactory.toggleCommentVisibility({ id:commentProps.id, visibility:commentProps.visibility }, function(response) {
                
                    if(response.data === '1'){
                        $scope.lastCommentShownDate = null;
                        //fetch all the comments currently shown in one block so recently toggled comment is in same place
                        $scope.fetchComments(true, $scope.comments.length); //commentsChunkSize*2);
                    }

                }, function(response){
                    console.log('Problem toggling comment visibility: ' + response.status);
                });
            } 

        };

        $scope.fetchComments = function(refresh, commentsSize) {

            var limit = commentsSize ? commentsSize : commentsChunkSize; 

            $scope.useLazy = true;
            $scope.searchLazy = false;

            CommentFactory.fetchComments($routeParams.questionId, limit, $scope.lastCommentShownDate, function(response) {
                
                    $scope.loading = false;
                    $scope.lazyLoading = false; //hide spinner
                    $scope.noResults = false;

                    if(response.data === '0'){

                        //if we're showing comments already we don't want to show the 'no comments' message
                        if($scope.comments.length < 1) $scope.noComments = true;
                        else{
                            $scope.showEnd = true;
                        }
                    }
                    else{ 

                        $scope.noComments = false;
                        $scope.probComments = false;

                        if(response.data.comments.constructor === Array){
                            if(refresh) $scope.comments = [];
                            $scope.comments.push.apply($scope.comments, response.data.comments);
                            $scope.lastCommentShownDate = response.data.paging.next;
                        }
                        else{
                            $scope.probComments = true;
                        }
                    } 

                }, function(response){
                    console.log('Problem getting data: ' + response.status);
                });
        };

        $scope.search = function(field, refresh, commentsSize){

            var limit = commentsSize ? commentsSize : 8; //commentsChunkSize * 2; 
            
            $scope.useLazy = false;

            //use null on button call then use stored date on subsequent scroll bump calls 
            if(refresh) {
                $scope.lastCommentShownDate = null;
                $scope.lastSearchType = field;
            }


            console.log({type:$scope.lastSearchType, term:$scope.data.searchTerm, questionId:$routeParams.questionId, limit:limit, lastDate:$scope.lastCommentShownDate }); 

            if($scope.data.searchTerm != null){

                CommentFactory.search({ type:         $scope.lastSearchType, 
                                        term:         $scope.data.searchTerm, 
                                        questionId:   $routeParams.questionId, 
                                        limit:        limit, 
                                        lastDate:     $scope.lastCommentShownDate }, 

                                        function(response) {
                        
                        $scope.lazyLoading = false; //hide spinner

                        if(response.data === '0'){

                            if($scope.comments.length < 1) $scope.noResults = true;
                            else $scope.showEnd = true; 
                        }
                        else{ //got search result

                            if(response.data.comments.constructor === Array){

                                $scope.noResults = false;
                                $scope.showEnd = false;

                                if(refresh) $scope.comments = [];
                                $scope.comments.push.apply($scope.comments, response.data.comments);
                                $scope.lastCommentShownDate = response.data.paging.next;
                                $scope.searchLazy = true;
                            }
                            else{
                                alert("There was a problem - please try again");
                            }
                        } 

                    }, function(response){ //error 
                       
                        alert("There was a problem - please try again");
                    });

            }
            else{
                alert('Please enter a search term');
            }  
        } 


        $scope.clear = function(){
            $scope.data.searchTerm ='';
            document.getElementById('term-input').focus();
        }

        $scope.seeAllComments = function(){
            $scope.noResults = false;
            $scope.lastCommentShownDate = null;
            $scope.fetchComments(true, commentsChunkSize * 2);
        } 


         //so we don't make loads of calls when user bumps bottom
        $scope.debouncedFetch = _.debounce($scope.fetchComments, debounceTime);
        $scope.debouncedSearch = _.debounce($scope.search, debounceTime); 

        //$scope.fetchComments(false, commentsChunkSize * 2);
        $scope.fetchComments(false, commentsChunkSize * 2);



    }]);
 
}());
<?php
/**
 * Step 1: Require the Slim Framework
 *
 * If you are not using Composer, you need to require the
 * Slim Framework and register its PSR-0 autoloader.
 *
 * If you are using Composer, you can skip this step.
 */
require 'Slim/Slim.php';

$GLOBALS['env'] = 'dev';
//$GLOBALS['env'] = 'prod';

\Slim\Slim::registerAutoloader();

/**
 * Step 2: Instantiate a Slim application
 *
 * This example instantiates a Slim application using
 * its default settings. However, you will usually configure
 * your Slim application now by passing an associative array
 * of setting names and values into the application constructor.
 */
$app = new \Slim\Slim();

/**
 * Step 3: Define the Slim application routes
 *
 * Here we define several Slim application routes that respond
 * to appropriate HTTP request methods. In this example, the second
 * argument for `Slim::get`, `Slim::post`, `Slim::put`, `Slim::patch`, and `Slim::delete`
 * is an anonymous function.
 */

// GET route
$app->get(
    '/',
    function () {
        $template = 'test';
        echo $template;
    }
);

// GET route
$app->get(
    '/comments/populate/:questionId', function($questionId) {
        populateWithDummyEntries($questionId);
    }
);

//$app->get('/objects/search/:object_id','getObjectData');


$app->get('/comments/fetch/:questionId(/:number)(/:until)', function($questionId,$number=100,$until=100){

        getComments($questionId, $number, $until);

    });

$app->get('/comments/totals/:numQuestions', function($numQuestions) {

        getTotals($numQuestions);

    });

$app->post('/comments/add', function () use ($app) {
    
    $json = $app->request->getBody();
    $data = json_decode($json, true); // parse the JSON into an assoc. array
    addComment($data);
});

$app->post('/comments/toggle', function () use ($app) {
    
    $json = $app->request->getBody();
    $data = json_decode($json, true); // parse the JSON into an assoc. array
    toggleComment($data);
});

$app->post('/comments/search', function () use ($app) {

    $json = $app->request->getBody();
    $data = json_decode($json, true); // parse the JSON into an assoc. array
    searchForTerm($data);
});

// POST route
$app->post(
    '/post',
    function () {
        echo 'This is a POST route';
    }
);

// PUT route
$app->put(
    '/put',
    function () {
        echo 'This is a PUT route';
    }
);

// PATCH route
$app->patch('/patch', function () {
    echo 'This is a PATCH route';
});

// DELETE route
$app->delete(
    '/delete',
    function () {
        echo 'This is a DELETE route';
    }
);

/**
 * Step 4: Run the Slim application
 *
 * This method should be called last. This executes the Slim application
 * and returns the HTTP response to the HTTP client.
 */
$app->run();

function getCreds(){

    if($GLOBALS['env'] == "dev"){

        return array(   "host" => "localhost",
                    "user"  => "root",
                    "password"  => "", 
                    "database"  => "feedback" 
                );

    }

    if($GLOBALS['env'] == "prod"){

        return array(   "host" => "localhost",
                    "user"  => "someuser",
                    "password"  => "somepassword", 
                    "database"  => "feedback" 
                );
    }
};


function getComments($questionId,$number,$until) {

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $questionID = $db->real_escape_string($questionId);
    $limit = $db->real_escape_string($number);
    $date = $db->real_escape_string($until);

    if($date === '100'){
        $stmt = $db->prepare("SELECT * FROM user where question_id = ? ORDER BY date DESC LIMIT ?");
    }
    else{
        //$stmt = $db->prepare("SELECT * FROM user where question_id = ? ORDER BY date DESC LIMIT ?");
        $stmt = $db->prepare("SELECT * FROM user where question_id = ? AND date < ? ORDER BY date DESC LIMIT ?");
    }

    if ( false===$stmt ) {
        die('prepare() failed: ' . htmlspecialchars($db->error));
    } 

    if($date === '100'){
        $rc = $stmt->bind_param('ss', $questionID,$limit);
    }
    else{
        //$rc = $stmt->bind_param('ss', $questionID,$limit);
        $rc = $stmt->bind_param('sss', $questionID,$date,$limit);
    } 
    
    if ( false===$rc ) {  
        die('bind_param() failed: ' . htmlspecialchars($stmt->error));
    }

    $rc = $stmt->execute();

    if ( false===$rc ) {
       die('execute() failed: ' . htmlspecialchars($stmt->error));
    }

    $stmt->store_result();
    $stmt->bind_result($id, $firstname, $lastname, $email, $comment, $question_id, $visibility, $date);

    if($stmt->num_rows > 0){

        $output = array();
        $paging = array();
        $wrapper = array();
        $count = 0;
        $untilDate = '';

        while($stmt->fetch()){

            $count++;
            $tempArray = array();
            $tempArray['id'] = htmlspecialchars($id);
            $tempArray['firstname'] = htmlspecialchars($firstname);
            $tempArray['comment'] = htmlspecialchars($comment);
            $tempArray['questionId'] = htmlspecialchars($question_id);
            $tempArray['visibility'] = htmlspecialchars($visibility);
            $tempArray['date'] = $date;
            array_push($output,$tempArray);

            if($count == $stmt->num_rows) $untilDate = $date;
        }
        
        $paging['previous'] = 'someurl';
        $paging['next'] = $untilDate;         

        $wrapper['comments'] = $output;
        $wrapper['paging'] = $paging;

        $stmt->close();
        $db->close();
        echo json_encode($wrapper);
    }
    else{
        $stmt->free_result();
        $stmt->close();
        echo '0';
    }
};


function addComment($data){

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $firstname = $db->real_escape_string($data['firstname']);
    $comment = $db->real_escape_string($data['comment']);
    $questionId = $db->real_escape_string($data['questionId']); 

    $stmt = $db->prepare("INSERT INTO user (firstname,lastname,email,comment,question_id,visibility) VALUES( ?, '', '', ?, ?, 1)");
    
    if ( false===$stmt ) {
        die('prepare() failed: ' . htmlspecialchars($db->error));
    } 

    $rc = $stmt->bind_param('sss', $firstname, $comment, $questionId);
    
    if ( false===$rc ) {  
        die('bind_param() failed: ' . htmlspecialchars($stmt->error));
    }

    $rc = $stmt->execute();

    if ( false===$rc ) {
        die('execute() failed: ' . htmlspecialchars($stmt->error));
    }

    $stmt->close();
    $db->close();

    echo '1';
}


function toggleComment($data){

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $id = $db->real_escape_string($data['id']);
    $visibility = $db->real_escape_string($data['visibility']);
    $newVisibility = $visibility == '1'? 0 : 1;

    $stmt = $db->prepare("UPDATE user SET visibility=? WHERE id=?");
    
    if ( false===$stmt ) {
        die('prepare() failed: ' . htmlspecialchars($db->error));
    } 

    $rc = $stmt->bind_param('ss', $newVisibility, $id);
    
    if ( false===$rc ) {  
        die('bind_param() failed: ' . htmlspecialchars($stmt->error));
    }

    $rc = $stmt->execute();

    if ( false===$rc ) {
        die('execute() failed: ' . htmlspecialchars($stmt->error));
    }

    $stmt->close();
    $db->close();

    echo '1';
}

function searchForTerm($data){

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $col = $db->real_escape_string($data['type']);
    $term = $db->real_escape_string($data['term']);
    $questionId = $db->real_escape_string($data['questionId']);
    $date = $db->real_escape_string($data['lastDate']);
    $limit = $db->real_escape_string($data['limit']); 

    //echo $date;
    
    if($date === ''){ //null

        //echo 'conA1';

        if($col == 'firstname'){
            $stmt = $db->prepare("SELECT id, firstname, lastname, email, comment, question_id, visibility, date FROM user WHERE MATCH (firstname) AGAINST (?) AND question_id = ? ORDER BY date DESC LIMIT ?");
        }
        else{
            $stmt = $db->prepare("SELECT id, firstname, lastname, email, comment, question_id, visibility, date FROM user WHERE MATCH (comment) AGAINST (?) AND question_id = ? ORDER BY date DESC LIMIT ?");
        }

    }
    else{

        //echo 'conA2';

        if($col == 'firstname'){
            $stmt = $db->prepare("SELECT id, firstname, lastname, email, comment, question_id, visibility, date FROM user WHERE MATCH (firstname) AGAINST (?) AND question_id = ? AND date < ? ORDER BY date DESC LIMIT ?");
        }
        else{
            $stmt = $db->prepare("SELECT id, firstname, lastname, email, comment, question_id, visibility, date FROM user WHERE MATCH (comment) AGAINST (?) AND question_id = ? AND date < ? ORDER BY date DESC LIMIT ?");
        }
    }

    //echo $date.' '.$term.' '.$questionId.' '.$limit;

    if ( false===$stmt ) {
        die('prepare() failed: ' . htmlspecialchars($db->error));
    } 

    
    if($date === ''){ //null
        $rc = $stmt->bind_param('sss', $term, $questionId, $limit);
    }
    else{
        $rc = $stmt->bind_param('ssss', $term, $questionId, $date, $limit);
    }

    
    if ( false===$rc ) {  
        die('bind_param() failed: ' . htmlspecialchars($stmt->error));
    }

    $rc = $stmt->execute();

    if ( false===$rc ) {
        die('execute() failed: ' . htmlspecialchars($stmt->error));
    }

    $stmt->store_result();
    $stmt->bind_result($id, $firstname, $lastname, $email, $comment, $question_id, $visibility, $date);


    if($stmt->num_rows > 0){

        $output = array();
        $paging = array();
        $wrapper = array();
        $count = 0;
        $untilDate = '';

        while($stmt->fetch()){

            $count++;
            $tempArray = array();
            $tempArray['id'] = htmlspecialchars($id);
            $tempArray['firstname'] = htmlspecialchars($firstname);
            $tempArray['comment'] = htmlspecialchars($comment);
            $tempArray['questionId'] = htmlspecialchars($question_id);
            $tempArray['visibility'] = htmlspecialchars($visibility);
            $tempArray['date'] = $date;
            array_push($output,$tempArray);

            if($count == $stmt->num_rows) $untilDate = $date;
        }
        
        $paging['previous'] = 'someurl';
        $paging['next'] = $untilDate;         

        $wrapper['comments'] = $output;
        $wrapper['paging'] = $paging;

        $stmt->close();
        $db->close();
        echo json_encode($wrapper);
    }
    else{
        $stmt->free_result();
        $stmt->close();
        echo '0';
    }


}


function getTotals($numQuestions){

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $totals = array();
    
    for ($x = 1; $x <= $numQuestions; $x++) {

        $stmt = $db->prepare("SELECT * FROM user where question_id = $x");

        if ( false===$stmt ) {
            die('prepare() failed: ' . htmlspecialchars($db->error));
        } 

        $rc = $stmt->execute();

        if ( false===$rc ) {
            die('execute() failed: ' . htmlspecialchars($stmt->error));
        }

        $stmt->store_result();       
        array_push($totals, $stmt->num_rows);
        $stmt->close();
    } 

    $db->close();
    echo json_encode($totals);
}


function populateWithDummyEntries($questionId){

    $creds = getCreds();

    $db = new mysqli( $creds['host'],
                      $creds['user'],
                      $creds['password'],
                      $creds['database'] );

    if($db->connect_error > 0){
        die('Unable to connect to database [' . $db->connect_error . ']');
    }

    $lorem = " At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.";

    for ($x = 0; $x <= 200; $x++) {

        $firstname = "TestUser-".date(DATE_RFC822)."-no-".$x;
        
        if($x % 2 == 1){
            $comment = "TestComment-".date(DATE_RFC822)."-no-".$x;
        }
        else $comment = "TestComment-".date(DATE_RFC822)."-no-".$x.$lorem;
    
        $questionId = $db->real_escape_string($questionId); 

        $stmt = $db->prepare("INSERT INTO user (firstname,lastname,email,comment,question_id,visibility) VALUES( ?, 'bowen', 'jim@jam.com', ?, ?, 1)");
        
        if ( false===$stmt ) {
            die('prepare() failed: ' . htmlspecialchars($db->error));
        } 

        $rc = $stmt->bind_param('sss', $firstname, $comment, $questionId);
        
        if ( false===$rc ) {  
            die('bind_param() failed: ' . htmlspecialchars($stmt->error));
        }

        $rc = $stmt->execute();

        if ( false===$rc ) {
            die('execute() failed: ' . htmlspecialchars($stmt->error));
        }

        $stmt->close();

    }

    $db->close();

    echo '1';



}



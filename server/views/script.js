var app = angular.module('collaboration-tool', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise('/home'); //Als URL niet wordt gevonden, ga naar home pagina

	$stateProvider

		.state('home', {
            url: '/home',
            templateUrl: 'start.html',
            controller: 'NavController',
            authenticate: false
        })

        .state('member', {
            url: '/member',
            templateUrl: 'member.html',
            controller: 'MemberController',
            authenticate: true
        })

        .state('rooms', {
            url: '/rooms',
            templateUrl: 'rooms.html',
            controller: 'roomController',
            authenticate: true
        })

        .state('login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController',
            authenticate: false

        })
});

var teacherVar = false;
var studentVar = false;

// maakt popup aan ==>
app.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});


app.controller('NavController', function($scope) {
	$scope.message = 'Everyone come and see how good I look!';
});

app.controller('MemberController', function($scope) {
	$scope.message = 'Everyone come and see how good I look!';
});
//var authed = authorization;
/*app.factory('authFactory', function () {
    var factory = {};
    factory.checkAuth = function (emailp) {
      if (emailp == 'aaa') authed = true;
      return (authed);
    };

    factory.isAuthed = function () {
      return authed;
    }
    return factory;
  });
*/

app.service('Authorization', function($state) {

  this.authorized = false;
  this.memorizedState = null;

  var
  clear = function() {
    //this.authorized = false;
    this.memorizedState = null;
  },

  go = function(fallback) {
    //this.authorized = true;
    var targetState = this.memorizedState ? this.memorizedState : fallback;
    $state.go(targetState);
  };

  return {
    authorized: this.authorized,
    memorizedState: this.memorizedState,
    clear: clear,
    go: go
  };
});


app.run(function ($rootScope, $state, Authorization) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams){
    	if (toState.authenticate && !Authorization.authorized) {
    		//User isn't authenticated
    		$state.transitionTo("login");
    		event.preventDefault();
    	} 
	});
  });

app.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {}; 
        service.Login = function (username, password, userRole, callback) {
 
            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------
            $timeout(function(){
                var response = { success: username === 'test' && password === 'test' };
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 1000);
 
 
            Use this for real authentication
             ----------------------------------------------*/
            $http.post('http://localhost:3000/authenticate', { username: username, password: password, userRole: userRole })
                .success(function (response) {
                    callback(response);
                    console.log('send to server');
                })
                .error(function(err) {
                alert(err);
                });
        };
  
        service.SetCredentials = function (username, password, userRole) {
            var authdata = Base64.encode(username + ':' + password);
  
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    userRole: userRole,
                    authdata: authdata
                }
            };
  
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
  
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
  
        return service;
    }])


app.factory('Base64', function () {
    /* jshint ignore:start */
  
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
        },
  
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
  
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
  
                output = output + String.fromCharCode(chr1);
  
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
  
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
  
            } while (i < input.length);
  
            return output;
        }
    };
  
    /* jshint ignore:end */
});

var usernameVar;
app.controller('loginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', '$state', 'Authorization', '$http',
    function($scope, $rootScope, $location, AuthenticationService, $state, Authorization, $http) {
        // reset login status
        AuthenticationService.ClearCredentials();

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, $scope.userRole, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password, $scope.userRole);
                    Authorization.authorized = true;
                        usernameVar = $scope.username;
                    	if ($scope.userRole == "teacher") {
                            teacherVar = true;
                            studentVar = false;
	                    	console.log($scope.userRole + " success");    
                            Authorization.go('rooms');           		
                    	}
                    	else if ($scope.userRole == "student") {
                            teacherVar = false;
                            studentVar = true;
	                    	console.log($scope.userRole + " success");
                            Authorization.go('rooms');
                    	}
                    	else{
                    		console.log("Wrong role");
                    		$scope.error = response.message;
		                    $scope.dataLoading = false;
		                    Authorization.clear();
		                    Authorization.authorized = false;
                    	}
                    
                } else {
                    console.log('mislukt');
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                    Authorization.clear();
                    Authorization.authorized = false;
                    console.log(Authorization.authorized);
                }
            });
        };

        $rootScope.logout = function() {
		    Authorization.clear();
		    Authorization.authorized = false;
		    $state.go('home');
		};

        $scope.register = function() {

            console.log("submitted"); 
            var username = $('#usernameReg').val();
            var password = $('#passwordReg').val();
            //var functie = $('#tittelIN').val();
            //console.log(code); 

            registerForm = {}
            registerForm ["username"] = username;
            registerForm ["password"] = password;
            //registerForm ["tittel"] = tittel;

            $http.post('http://localhost:3000/register', registerForm)
            .success(function(data, status) {
            console.log(data);
            console.log(status);
            $('#usernameReg').val('');
            $('#passwordReg').val('');
        })
        }

    }]);

app.controller('roomController', function($scope, $http){
  ///hier wordt popup geswitched !!! ==> 
  	$scope.modalShown = false;
  	$scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
	}
    if (teacherVar == true) {
        console.log("hij  wet da ge nen teacehr zet");
        $scope.teacher=true;
        $scope.student=false;
        console.log($scope.teacher);
    }
    else if (studentVar == true) {
        $scope.teacher=false;
        $scope.student=true;
    }
    $scope.naamStudent = usernameVar; // zorgt voor de aanpgepaste naam bij antwoorden
	$scope.roomList = false;
	$scope.chosenRoom = false;
	$scope.joinRoom = false;
	$scope.joinOn = false;
	$scope.showQuestion = false;
	$scope.placeAnswer = false;
	$scope.showAnswer = false;

	// wat er gebeurd als er^op de knop wordt gedrukt ==>
	$scope.submit=function(){
		console.log("submitted"); 
		var klas = $('#klasIN').val();
		var leraar = $('#leraarIN').val();
		var tittel = $('#tittelIN').val();
		var code = $('#codeIN').val();
		console.log(code); 

		form = {}
        form ["klas"] = klas;
        form ["leraar"] = leraar;
        form ["tittel"] = tittel;
        form ["code"] = code;

		$http.post('http://localhost:3000/form', form)
		.success(function(data, status) {
			console.log(data);
			console.log(status);
			$('#klasIN').val('');
			$('#leraarIN').val('');
			$('#tittelIN').val('');
			$('#codeIN').val('');
		})
		.error(function(err) {
			alert(err);

		});	
   	
  };

  var roomArr;
	$scope.getRooms=function(){
		console.log("geeft rooms");
		$http.get("http://localhost:3000/getRooms")
		.success(function(rooms){
			
			$scope.rooms= rooms;			
			roomArr = rooms;
			console.log(roomArr);
		})
		.error(function(err) {

		});
	}

	$scope.geefAlleRooms=function(){
		$scope.getRooms();
		$scope.chosenRoom = false;
		$scope.joinRoom = false;
		$scope.joinOn = false;
		$scope.showQuestion = false;
		$scope.placeAnswer = false;
		$scope.showAnswer = false;
		$scope.roomList = true;

		$scope.question = ""; //Vraag scope resetten als je uit de room gaat
		$scope.answer1 = "";
	}
	$scope.kiesRoom=function(klas, leraar, tittel, code){
		console.log("da ha" + klas);
		$scope.roomList = false;
		$scope.joinRoom = false;
		$scope.joinOn = false;
		$scope.showQuestion = false;
		$scope.placeAnswer = false;
		$scope.showAnswer = false;
		$scope.chosenRoom = true;
		$('#infoRoomK').text("gekozen klas = " + klas);
		$('#infoRoomL').text("leraar : " + leraar);
		$('#infoRoomT').text("tittel : " + tittel);
		$('#infoRoomC').text("code : " + code);

		$scope.gekozenKlas = klas;
		console.log(klas);
	}

	$scope.roomStart=function(){
		$scope.joinOn = true;
	}
	$scope.roomJoin=function(){
		$scope.joinRoom = true;
	}
    /*
    stelling = {}
    stelling ["klas"] ="";
    stelling ["vraag"] = "";
    stelling ["antwoord"] = [];   */
	$scope.addQuestion=function(){ 
		
		var vraag = $('#vraagIN').val(); //van id 'vraagIN' wordt variabele vraag aangevuld
		var klasG = $scope.gekozenKlas;

		$scope.showQuestion = true;
		$scope.placeAnswer = true;
		console.log(vraag);
		console.log(klasG);
		console.log($scope.gekozenKlas);

		$scope.question = $scope.question1;

        addQ = {}
		addQ ["klas"] = klasG;
        addQ ["vraag"] = vraag;

		//Stel de vraag en voeg hem toe aan de database in de juiste room
		$http.post('http://localhost:3000/addQn', addQ)
		.success(function(data, status) {
			console.log(data);
			console.log(status);

		})
		.error(function(err) {
			//alert(err);

		});	
        

		$scope.question1 = ""; //Wanneer vraag gesteld is, tekstblok resetten
	}

	$scope.addAnswer=function(){
		
        $scope.showAnswer = true;

		$scope.answer = $scope.answer1;
        addA = {}
        addA ["antwoord"] = $scope.answer;
		$scope.answer1 = "";
        $http.post('http://localhost:3000/addAr', addA)
        .success(function(data, status) {
            console.log(data);
            console.log(status);

        })
        .error(function(err) {
            //alert(err);

        }); 
	}
    $scope.stopQuestion=function(){
        //console.log(stelling);
        $http.post('http://localhost:3000/questionAdd')
        .success(function(data, status) {
            /*console.log(data);
            console.log(status);
            stelling ["klas"] ="";
            stelling ["vraag"] = "";
            stelling ["antwoord"] = [];*/
        })
        .error(function(err) {
            //alert(err);

        });
        
    }
});

app.controller('FaqController', function($scope){
	$scope.message = 'Ask any questions';

});
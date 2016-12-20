var app = angular.module('collaboration-tool', ['ui.router', 'ngCookies']);

app.filter('unique', function() { //Deze filter wordt gebruikt voor dezelfde items maar 1 keer te tonen
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
});

app.config(function($stateProvider, $urlRouterProvider){ //Dit zorgt ervoor dat het een one-page-app is

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

var teacherVar = false; //deze variabele wordt true gezet wanneer userrole teacher is
var studentVar = false; //deze variabele wordt true gezet wanneer userrole student is

// maakt popup aan ==>
app.directive('modalDialog', function() { //Deze directive is voor het pop-up scherm voor een nieuwe room aan te maken
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

app.controller('MemberController', function($scope, $http, $window) {
	$scope.message = 'Everyone come and see how good I look!';

    //nog clearen op de juiste momenten !! -->   (houdt bij op welke klas is gedrukt)
    var gekozenKlasGlob = "";

    $scope.klassenLs = true;
    $scope.vragenLs = false;
    $scope.antwoordenLs = false;
    $scope.geefKlasBtn = true;
    $scope.terugBtn = false;
    $scope.geefKlassen=function(){
        console.log("geeft klassen");
        //$window.location.reload();  zorgt voor refresh !!! maar eerst fixe dat login ingelogd blijft bij page refresh !!!!
        $http.get("http://localhost:3000/getClass")
        .success(function(classes){
       
        $scope.classes = classes;            
        console.log($scope.classes);
        })
        .error(function(err) {

        });
    }

    $scope.kiesKlas=function(gekozenKlas){
        $scope.klassenLs = false;
        $scope.vragenLs = true;
        $scope.geefKlasBtn = false;
        $scope.terugBtn = true;
        klasAr = {}
        klasAr ["klas"] = gekozenKlas;
        gekozenKlasGlob = gekozenKlas;
        //console.log("geeft vragen voor" + "" +klasAr);
        $http.post("http://localhost:3000/getQn", klasAr)
        .success(function(vragen){            
            $scope.vragen= vragen;   
            console.log(vragen);
        })
        .error(function(err) {

        });
    }
    $scope.kiesVraag=function(gekozenVraag){
        //$scope.klassenLs = false;
        $scope.vragenLs = false;
        $scope.antwoordenLs = true;
        vraagAr = {}
        vraagAr ["vraag"] = gekozenVraag;
        vraagAr ["klas"] = gekozenKlasGlob;
        //console.log("geeft vragen voor" + "" +klasAr);
        $http.post("http://localhost:3000/getAr", vraagAr)
        .success(function(antwoorden){            
            $scope.antwoorden= antwoorden[0].antwoord;   
            console.log(antwoorden[0].antwoord);
        })
        .error(function(err) {

        });
    }

    $scope.terug=function(){
    	var gekozenKlasGlob = "";

	    $scope.klassenLs = true;
	    $scope.vragenLs = false;
	    $scope.antwoordenLs = false;
	    $scope.geefKlasBtn = true;
	    $scope.terugBtn = false;
    }
});

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


app.run(function ($rootScope, $state, Authorization) { //Dit wordt gebruikt voor de restrictie op sommige pagina's als men niet ingelogd is
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

             //Ingevulde gegevens van login worden doorgestuurd naar de server
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

        $scope.login = function () { //Wanneer de login gegevens juist zijn, zal de authorisatie variabele op true worden gezet en zal de userrole gecontroleerd worden
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, $scope.userRole, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password, $scope.userRole);
                    Authorization.authorized = true;

                    	//Controle op userrole, iedere userrole heeft zijn beperkingen op bepaalde pagina's
                    	if ($scope.userRole == "teacher") { 
                            teacherVar = true;
                            studentVar = false;
	                    	//console.log($scope.userRole + " success");    
                            Authorization.go('rooms');           		
                    	}
                    	else if ($scope.userRole == "student") {
                            teacherVar = false;
                            studentVar = true;
	                    	//console.log($scope.userRole + " success");
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

        $scope.register = function() { //Registreer een gebruiker in de database

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
    if (teacherVar == true) { //Wanneer bij de userrole blok teacher is ingevult, wordt 'teacher' scope op true gezet
        $scope.teacher = true;
        $scope.student = false;
    }
    else if (studentVar == true) { //Wanneer bij de userrole blok student is ingevult, wordt 'student' scope op true gezet
        $scope.teacher = false;
        $scope.student = true;
    }
	$scope.roomList = false; //ng-show variabele in rooms.html, wordt op true gezet wanneer op de knop 'geef rooms' gedrukt wordt
	$scope.chosenRoom = false; //ng-show variabele in rooms.html, wordt op true gezet wanneer er op 1 van de rooms wordt gedrukt
	$scope.joinOn = false; //Wanneer 'teacher' op de 'start' knop drukt, dan wordt deze op true gezet en wordt de 'join' knop getoond
	$scope.joinRoom = false; //ng-show variabele in rooms.html, wordt op true gezet wanneer op de knop 'join' gedrukt wordt
	$scope.showQuestion = false; //Wanneer een vraag wordt toegevoegd, wordt deze scope op true gezet en wordt de vraag in de html te zien
	$scope.placeAnswer = false; //Wanneer een vraag wordt toegevoegd, ziet de student een blok om een antwoord in te zetten en toe te voegen
	$scope.showAnswer = false; //Wanneer een antwoord wordt toegevoegd, is dit antwoord te zien onder de vraag 

	$scope.questionAdded = false;

	var status = false; //

    $scope.naamStudent = usernameVar; // zorgt voor de aanpgepaste naam bij antwoorden

	var init = function(){ //Wanneer rooms worden opgehaald, gaat deze functie via de server de status van alle onderstaande variabelen ophalen (true of false)

		$http.get('http://localhost:3000/isQuestionAsked')
			.success(function(questionAsked) {
				$scope.questionAdded = questionAsked;			
				console.log("Is er al een vraag gesteld in de room ? " + $scope.questionAdded);

			})

		$http.get('http://localhost:3000/sendQuestion')
			.success(function(gesteldeVraag1){
				if ($scope.questionAdded) {
					$scope.gesteldeVraag = gesteldeVraag1;
					console.log("De vraag was: " + $scope.gesteldeVraag);
				}
				else{
					//Voorlopig nog niks
				}
			})

		$http.get('http://localhost:3000/isAnswerAdded')
			.success(function(answerIsAdded){
				$scope.answerAdded = answerIsAdded;
				console.log("Is er een antwoord gegeven op een vraag ? " + $scope.answerAdded);
			})

		$http.get('http://localhost:3000/sendAnswer')
			.success(function(gesteldAntwoord1){
				if ($scope.answerAdded) {
					$scope.gesteldAntwoord = gesteldAntwoord1;
					console.log("Het antwoord was: " + $scope.gesteldAntwoord);
				}
				else{
					//Voorlopig nog niks
				}
			})
	}

	// wat er gebeurd als er op de knop wordt gedrukt ==>
	$scope.submit=function(){
		console.log("submitted"); 
		var klas = $('#klasIN').val();
		var leraar = $('#leraarIN').val();
		var tittel = $('#tittelIN').val();
		var code = $('#statusIN').val();

		form = {}
        form ["klas"] = klas;
        form ["leraar"] = leraar;
        form ["tittel"] = tittel;
        form ["status"] = status;

		$http.post('http://localhost:3000/form', form)
		.success(function(data, status) {
			console.log(data);
			console.log(status);
			$('#klasIN').val('');
			$('#leraarIN').val('');
			$('#tittelIN').val('');
			$('#statusIN').val('');
		})
		.error(function(err) {
			alert(err);

		});	
   	
  };

  var roomArr;
	$scope.getRooms=function(){ //Deze scope gaat via de server de database nakijken welke rooms er zijn
		console.log("geeft rooms");
		$http.get("http://localhost:3000/getRooms")
		.success(function(rooms){
			
			$scope.rooms= rooms;			
			roomArr = rooms;
			//console.log(roomArr);
		})
		.error(function(err) {

		});
	}

	$scope.geefAlleRooms=function(){ //In deze scope worden de opgeladen rooms getoond in de view
		$scope.getRooms();
		init(); //Deze functie wordt altijd aangeroepen bij het opnieuw laden van de rooms (controle op rooms die aanstaan)
		$scope.chosenRoom = false;
		$scope.joinRoom = false;
		$scope.showQuestion = false;
		$scope.placeAnswer = false;
		$scope.showAnswer = false;
		$scope.roomList = true;

		$scope.question = ""; //Vraag scope resetten als je uit de room gaat
		$scope.answer1 = "";
	}
	$scope.kiesRoom=function(klas, leraar, tittel, status, gekozenKlas){ //Als er een room gekozen wordt, wordt deze scope aangeroepen en toont de juiste gegevens van de room
		//console.log("da ha" + klas);
		$scope.roomList = false;
		$scope.joinRoom = false;
		$scope.showQuestion = false;
		$scope.placeAnswer = false;
		$scope.showAnswer = false;
		$scope.chosenRoom = true;
		
		$('#infoRoomK').text("gekozen klas : " + klas);
		$('#infoRoomL').text("leraar : " + leraar);
		$('#infoRoomT').text("titel : " + tittel);
		$('#infoRoomC').text("status : " + status);

		$scope.gekozenKlas = klas;

		statusAr = {}
        statusAr ["klasR"] = $scope.gekozenKlas;

		$http.post('http://localhost:3000/roomStatusFromDB', statusAr) //status van de gekozen room aanvragen
			.success(function(data, status){
				//console.log(data);
				//console.log(status);
				
			})
			.success(function(klasobjecten){            
	            $scope.klasstatus = klasobjecten[0].status;   
	            //console.log($scope.klasstatus);

	            if ($scope.klasstatus) { //Wanneer status 'true' is, wordt de knop 'join' getoond
	            	//wanneer klas aan staat
	            	$scope.joinOn = true;
	            }
	            else{
	            	$scope.joinOn = false;
	            }
	        })

			.error(function(err) {
	            alert(err);
	        });		

	}

	$scope.roomStart=function(){ //Wanneer op de 'start' knop in de view gedrukt wordt, wordt deze scope aangeroepen

		if ($scope.klasstatus) {
			//doe niks
			console.log("klas is al gestart");
		}
		else{ //Dit wordt aangeroepen als de room nog niet aanstond
			var klasG = $scope.gekozenKlas;
			var statusRoom = true;

			addK = {}
			addK ["klas"] = klasG;
			addK ["statusR"] = statusRoom;

			$http.post('http://localhost:3000/roomStatusToDB', addK) //status 'true' meegeven aan de server die dit aanpast in de database
			.success(function(data, status){
				console.log(data);
				console.log(status);
				$scope.joinOn = true;
			})
			.error(function(err) {
	            alert(err);
	        });

	        //$('#infoRoomC').text("status : " + $scope.klasstatus);

			}

	}

	$scope.roomJoin=function(){ //Deze scope wordt aangeroepen als de 'join' knop ingedrukt is
		$scope.joinRoom = true;

		if ($scope.questionAdded) { //Wanneer er een vraag door de teacher was toegevoegd wordt deze getoont in de html bij de student
			$scope.showQuestion = true;
			$scope.placeAnswer = true;
			$scope.question = $scope.gesteldeVraag;
		}
		else{
			$scope.showQuestion = false;
			$scope.placeAnswer = false;
		}


		if ($scope.answerAdded) { //Wanneer de student een antwoord toevoegt op de vraag, wordt deze zichtbaar voor de leraar
			$scope.showAnswer = true;
			$scope.answer = $scope.gesteldAntwoord;
		}
		else{
			$scope.showAnswer = false;
		}
	}

	$scope.addQuestion=function(){ //Hierbij wordt een vraag toegevoegd en direct naar de database via de server gestuurd
		
		var vraag = $('#vraagIN').val(); //van id 'vraagIN' wordt variabele vraag aangevuld
		var klasG = $scope.gekozenKlas;

		$scope.showQuestion = true;
		$scope.placeAnswer = true;

		//console.log(vraag);
		//console.log(klasG);

		$scope.question = $scope.question1;

        addQ = {}
		addQ ["klas"] = klasG;
        addQ ["vraag"] = vraag;

		//Stel de vraag en voeg hem toe aan de database in de juiste room
		$http.post('http://localhost:3000/addQn', addQ)
		.success(function(data, status) {
			//console.log(data);
			//console.log(status);	

		})
		.success(function(questionAdded){ //Post functie naar server om variabele voor questionAdded op true te zetten
			$scope.questionAdded = questionAdded;
		})

		.error(function(err) {
			//alert(err);

		});	
        

		$scope.question1 = ""; //Wanneer vraag gesteld is, tekstblok resetten
	}

	$scope.addAnswer=function(){ //Vraag wordt toegevoegd en naar database gestuurd, gelinkt aan de juiste vraagstelling
		
        $scope.showAnswer = true;

		$scope.answer = $scope.answer1;
        addA = {}
        addA ["antwoord"] = $scope.answer;
		$scope.answer1 = "";
        $http.post('http://localhost:3000/addAr', addA)
        .success(function(data, status) {
            //console.log(data);
            //console.log(status);

        })
        .success(function(answerAdded){ //
        	$scope.answerAdded = answerAdded;
        })

        .error(function(err) {
            //alert(err);

        }); 
	}

    $scope.stopQuestion=function(){ //Vraagstelling stoppen
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
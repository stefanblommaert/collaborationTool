var app = angular.module('collaboration-tool', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise('/home');

	$stateProvider

		.state('/home', {
            url: '/home',
            templateUrl: 'start.html',
            controller: 'NavController'
        })

        .state('/member', {
            url: '/member',
            templateUrl: 'member.html',
            controller: 'MemberController'
        })

        .state('/rooms', {
            url: '/rooms',
            templateUrl: 'rooms.html',
            controller: 'roomController'
        })

        .state('/faq', {
            url: '/faq',
            templateUrl: 'faq.html',
            controller: 'FaqController'
        })

        .state('/login', {
            url: '/login',
            templateUrl: 'login.html',
            controller: 'loginController'
        })
});


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

app.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};
 
        service.Login = function (username, password, callback) {
 
            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            $timeout(function(){
                var response = { success: username === 'test' && password === 'test' };
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 1000);
 
 
            /* Use this for real authentication
             ----------------------------------------------*/
            //$http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });
 
        };
  
        service.SetCredentials = function (username, password) {
            var authdata = Base64.encode(username + ':' + password);
  
            $rootScope.globals = {
                currentUser: {
                    username: username,
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

app.controller('loginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function($scope, $rootScope, $location, AuthenticationService) {
        // reset login status
        AuthenticationService.ClearCredentials();

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/');
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
    }]);

app.controller('roomController', function($scope, $http){
  ///hier wordt popup geswitched !!! ==> 
  	$scope.modalShown = false;
  	$scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
	}
	$scope.roomList = false;
	$scope.chosenRoom = false;
	$scope.joinRoom = false;
	$scope.joinOn = false;
	$scope.showQuestion = false;
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
		$scope.roomList = true;
	}
	$scope.kiesRoom=function(klas, leraar, tittel, code){
		console.log("da ha" + klas);
		$scope.roomList = false;
		$scope.joinRoom = false;
		$scope.joinOn = false;
		$scope.showQuestion = false;
		$scope.chosenRoom = true;
		$('#infoRoomK').text("gekozen klas = " + klas);
		$('#infoRoomL').text("leraar : " + leraar);
		$('#infoRoomT').text("tittel : " + tittel);
		$('#infoRoomC').text("code : " + code);
	}

	$scope.roomStart=function(){
		$scope.joinOn = true;
	}
	$scope.roomJoin=function(){
		$scope.joinRoom = true;
	}
	$scope.addQuestion=function(){
		$scope.showQuestion = true;
		console.log($scope.question);
	}
});

app.controller('FaqController', function($scope){
	$scope.message = 'Ask any questions';

});
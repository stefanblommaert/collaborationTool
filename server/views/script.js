var app = angular.module('collaboration-tool', ['ui.router']);

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
            templateUrl: 'login.html'
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
	}

	$scope.roomStart=function(){
		$scope.joinOn = true;
	}
	$scope.roomJoin=function(){
		$scope.joinRoom = true;
	}
	$scope.addQuestion=function(){
		$scope.showQuestion = true;
		$scope.placeAnswer = true;
		console.log($scope.question1);

		$scope.question = $scope.question1;
		$scope.question1 = ""; //Wanneer vraag gesteld is, tekstblok resetten
	}

	$scope.addAnswer=function(){
		$scope.showAnswer = true;

		$scope.answer = $scope.answer1;
		$scope.answer1 = "";
	}
});

app.controller('FaqController', function($scope){
	$scope.message = 'Ask any questions';

});
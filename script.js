var app = angular.module('collaboration-tool', ['ngRoute']);

app.config(function($routeProvider){
	
	$routeProvider
	.when('/',{
		templateUrl: 'start.html',
		controller: 'NavController'
	})
	.when('/member',{
		templateUrl: 'member.html',
		controller: 'MemberController'
	})
	.when('/faq',{
		templateUrl: 'faq.html',
		controller: 'FaqController'
	})
	.when('/login',{
		templateUrl: 'login.html'
	})

	.otherwise({ redirectTo: '/' });

});


app.controller('NavController', function($scope){
	$scope.message = 'Everyone come and see how good I look!';
	
});

app.controller('MemberController', function($scope){
	$scope.message = 'It\'s the member page';

});

app.controller('FaqController', function($scope){
	$scope.message = 'Ask any questions';

});
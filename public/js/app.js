var app = angular.module('tasQuestApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'views/login.html', controller: 'LoginCtrl' })
        .when('/dashboard', { templateUrl: 'views/dashboard.html', controller: 'DashboardCtrl' })
        .when('/profile', { templateUrl: 'views/profile.html', controller: 'ProfileCtrl' })
        .when('/leaderboard', { templateUrl: 'views/leaderboard.html', controller: 'LeaderboardCtrl' })
        .when('/admin', { templateUrl: 'views/admin.html', controller: 'AdminCtrl' })
        .otherwise({ redirectTo: '/login' });
});

// Shared Service: Empty arrays ready to be filled by your database later
app.factory('GameService', function() {
    return {
        allUsers: [], // Removed all mock users
        currentUser: null 
    };
});

// Login Controller: Now talks to the Node.js backend
app.controller('LoginCtrl', function($scope, $location, $rootScope, $http, GameService) {
    // Reset session variables when visiting the login page
    $rootScope.isLoggedIn = false;
    $rootScope.isAdmin = false;
    GameService.currentUser = null;

    $scope.login = function() {
        // Send credentials to the Express API
        $http.post('/api/login', {
            username: $scope.username,
            password: $scope.password
        }).then(function(response) {
            // SUCCESSFUL LOGIN
            const data = response.data;
            
            if (data.role === 'admin') {
                $rootScope.isLoggedIn = true;
                $rootScope.isAdmin = true;
                $location.path('/admin');
            } else if (data.role === 'user') {
                GameService.currentUser = data.user;
                $rootScope.isLoggedIn = true;
                $rootScope.isAdmin = false;
                $location.path('/dashboard');
            }
        }).catch(function(error) {
            // LOGIN FAILED (Catches the 401 status code from Express)
            var errorMsg = error.data && error.data.message ? error.data.message : "Server error!";
            alert("Login Failed: " + errorMsg);
        });
    };
});

// Admin Controller
app.controller('AdminCtrl', function($scope, GameService, $location, $rootScope, $timeout) { // Injected $timeout
    if (!$rootScope.isAdmin) { $location.path('/login'); return; }

    $scope.users = GameService.allUsers;
    $scope.newUser = {};

    $scope.addUser = function() {
        if ($scope.newUser.username && $scope.newUser.password) {
            $scope.users.push({
                id: Date.now(),
                username: $scope.newUser.username,
                password: $scope.newUser.password,
                xp: 0,
                level: 1,
                tasks: []
            });
            $scope.newUser = {}; 
            alert("New Adventurer Recruited!");
        }
    };

    $scope.removeUser = function(user) {
        // 1. Trigger the red color via ng-class
        user.isBanished = true; 
        
        // 2. Wait 500 milliseconds, then delete the user
        $timeout(function() {
            var index = $scope.users.indexOf(user);
            if (index > -1) {
                $scope.users.splice(index, 1);
            }
        }, 500); 
    };
});



// Dashboard Controller
app.controller('DashboardCtrl', function($scope, GameService, $location, $rootScope) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) { $location.path('/login'); return; }
    
    $scope.user = GameService.currentUser;
    $scope.newTask = {};

    $scope.addTask = function() {
        if ($scope.newTask.name && $scope.newTask.deadline) {
            $scope.user.tasks.push({
                id: Date.now(),
                name: $scope.newTask.name,
                deadline: new Date($scope.newTask.deadline),
                completed: false
            });
            $scope.newTask = {}; 
        }
    };

    $scope.completeTask = function(task) {
        // Prevent clicking multiple times
        if(task.completed) return; 

        task.completed = true;
        var now = new Date();
        
        if (now <= task.deadline) {
            $scope.user.xp += 50; 
            alert("Quest Completed on time! +50 XP");
        } else {
            $scope.user.xp -= 20; 
            alert("Quest Completed late! -20 XP penalty.");
        }
    };
});

// Profile Controller
app.controller('ProfileCtrl', function($scope, GameService, $location, $rootScope) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) { $location.path('/login'); return; }
    $scope.user = GameService.currentUser;
});

// Leaderboard Controller (Both users and admin can view this)
app.controller('LeaderboardCtrl', function($scope, GameService, $location, $rootScope) {
    if (!$rootScope.isLoggedIn) { $location.path('/login'); return; }
    $scope.players = GameService.allUsers;
});
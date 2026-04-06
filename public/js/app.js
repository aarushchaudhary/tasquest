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

app.factory('GameService', function() {
    return {
        allUsers: [],
        currentUser: null 
    };
});

app.run(function($rootScope, $location, GameService) {
    var savedUser = localStorage.getItem('tasquest_user');
    var savedRole = localStorage.getItem('tasquest_role');

    if (savedRole) {
        $rootScope.isLoggedIn = true;
        if (savedRole === 'admin') {
            $rootScope.isAdmin = true;
        } else if (savedRole === 'user' && savedUser) {
            $rootScope.isAdmin = false;
            GameService.currentUser = JSON.parse(savedUser);
        }
    }

    $rootScope.logout = function() {
        localStorage.removeItem('tasquest_user');
        localStorage.removeItem('tasquest_role');
        
        $rootScope.isLoggedIn = false;
        $rootScope.isAdmin = false;
        GameService.currentUser = null;
        
        $location.path('/login');
    };
});

app.controller('LoginCtrl', function($scope, $location, $rootScope, $http, GameService) {
    $scope.login = function() {
        $http.post('/api/login', {
            username: $scope.username,
            password: $scope.password
        }).then(function(response) {
            const data = response.data;
            
            if (data.role === 'admin') {
                $rootScope.isLoggedIn = true;
                $rootScope.isAdmin = true;
                
                localStorage.setItem('tasquest_role', 'admin');
                
                $location.path('/admin');
            } else if (data.role === 'user') {
                GameService.currentUser = data.user;
                $rootScope.isLoggedIn = true;
                $rootScope.isAdmin = false;
                
                localStorage.setItem('tasquest_role', 'user');
                localStorage.setItem('tasquest_user', JSON.stringify(data.user));
                
                $location.path('/dashboard');
            }
        }).catch(function(error) {
            var errorMsg = error.data && error.data.message ? error.data.message : "Server error!";
            alert("Login Failed: " + errorMsg);
        });
    };
});

app.controller('AdminCtrl', function($scope, GameService, $location, $rootScope, $timeout, $http) {
    if (!$rootScope.isAdmin) { $location.path('/login'); return; }

    $scope.users = GameService.allUsers;
    $scope.newUser = {};

    $http.get('/api/getUsers').then(function(response) {
        if (response.data.success) {
            GameService.allUsers = response.data.users;
            $scope.users = GameService.allUsers;
        }
    }).catch(function(error) {
        console.error('Error loading users:', error);
    });

    $scope.addUser = function() {
        if ($scope.newUser.username && $scope.newUser.password) {
            $http.post('/api/addUser', {
                username: $scope.newUser.username,
                password: $scope.newUser.password
            }).then(function(response) {
                if (response.data.success) {
                    $scope.users.push({
                        id: response.data.userId,
                        username: $scope.newUser.username,
                        xp: 0,
                        level: 1,
                        tasks: []
                    });
                    $scope.newUser = {}; 
                    alert("New Adventurer Recruited!");
                } else {
                    alert("Error: " + response.data.message);
                }
            }).catch(function(error) {
                var errorMsg = error.data && error.data.message ? error.data.message : "Server error!";
                alert("Failed to add user: " + errorMsg);
            });
        }
    };

    $scope.removeUser = function(user) {
        user.isBanished = true; 
        
        $http.delete('/api/removeUser/' + user.id).then(function(response) {
            if (response.data.success) {
                $timeout(function() {
                    var index = $scope.users.indexOf(user);
                    if (index > -1) {
                        $scope.users.splice(index, 1);
                    }
                }, 500);
            } else {
                alert("Error: " + response.data.message);
                user.isBanished = false;
            }
        }).catch(function(error) {
            alert("Failed to delete user");
            user.isBanished = false;
        });
    };
});

app.controller('DashboardCtrl', function($scope, GameService, $location, $rootScope, $http) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) { $location.path('/login'); return; }
    
    $scope.user = GameService.currentUser;
    $scope.newTask = {};

    $scope.addTask = function() {
        if ($scope.newTask.name && $scope.newTask.deadline) {
            var deadlineStr;
            if (typeof $scope.newTask.deadline === 'string') {
                deadlineStr = $scope.newTask.deadline.replace('T', ' ') + ':00';
            } else {
                var d = new Date($scope.newTask.deadline);
                var year = d.getFullYear();
                var month = String(d.getMonth() + 1).padStart(2, '0');
                var day = String(d.getDate()).padStart(2, '0');
                var hours = String(d.getHours()).padStart(2, '0');
                var minutes = String(d.getMinutes()).padStart(2, '0');
                var seconds = '00';
                deadlineStr = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            }
            
            $http.post('/api/addTask', {
                userId: $scope.user.id,
                name: $scope.newTask.name,
                deadline: deadlineStr
            }).then(function(response) {
                if (response.data.success) {
                    $scope.user.tasks.push({
                        id: response.data.taskId,
                        name: $scope.newTask.name,
                        deadline: new Date($scope.newTask.deadline),
                        completed: false
                    });
                    $scope.newTask = {};
                    
                    localStorage.setItem('tasquest_user', JSON.stringify($scope.user));
                    
                    alert("Quest Added!");
                } else {
                    alert("Error: " + response.data.message);
                }
            }).catch(function(error) {
                var errorMsg = error.data && error.data.message ? error.data.message : "Server error!";
                alert("Failed to add quest: " + errorMsg);
            });
        }
    };

    $scope.completeTask = function(task) {
        if(task.completed) return; 

        $http.put('/api/completeTask/' + task.id, {
            completed: true
        }).then(function(response) {
            if (response.data.success) {
                task.completed = true;
                var now = new Date();
                
                if (now <= new Date(task.deadline)) {
                    var xpGain = 50;
                    alert("Quest Completed on time! +50 XP");
                } else {
                    var xpGain = -20;
                    alert("Quest Completed late! -20 XP penalty.");
                }

                $http.put('/api/updateUserXP', {
                    userId: $scope.user.id,
                    xpChange: xpGain
                }).then(function(response) {
                    if (response.data.success) {
                        $scope.user.xp = response.data.user.xp;
                        $scope.user.level = response.data.user.level;
                        
                        localStorage.setItem('tasquest_user', JSON.stringify($scope.user));
                    }
                }).catch(function(error) {
                    console.error('Failed to update XP:', error);
                });
            } else {
                alert("Error: " + response.data.message);
            }
        }).catch(function(error) {
            alert("Failed to complete quest");
        });
    };
});

app.controller('ProfileCtrl', function($scope, GameService, $location, $rootScope) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) { $location.path('/login'); return; }
    $scope.user = GameService.currentUser;
});

app.controller('LeaderboardCtrl', function($scope, GameService, $location, $rootScope, $http) {
    if (!$rootScope.isLoggedIn) { $location.path('/login'); return; }
    
    $http.get('/api/getUsers').then(function(response) {
        if (response.data.success) {
            $scope.players = response.data.users;
            GameService.allUsers = response.data.users;
        }
    }).catch(function(error) {
        console.error('Error loading leaderboard:', error);
        $scope.players = GameService.allUsers;
    });
});
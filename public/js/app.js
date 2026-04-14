var app = angular.module("tasQuestApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "LoginCtrl",
    })
    .when("/dashboard", {
      templateUrl: "views/dashboard.html",
      controller: "DashboardCtrl",
    })
    .when("/profile", {
      templateUrl: "views/profile.html",
      controller: "ProfileCtrl",
    })
    .when("/leaderboard", {
      templateUrl: "views/leaderboard.html",
      controller: "LeaderboardCtrl",
    })
    .when("/admin", {
      templateUrl: "views/admin.html",
      controller: "AdminCtrl",
    })
    .otherwise({ redirectTo: "/login" });
});

app.factory("GameService", function () {
  return {
    allUsers: [],
    currentUser: null,
  };
});

app.factory("BadgeService", function () {
  const BADGE_TIERS = [
    { xp: 12000, name: "Ruby 1", image: "assets/ruby1.png" },
    { xp: 11500, name: "Ruby 2", image: "assets/ruby2.png" },
    { xp: 11000, name: "Ruby 3", image: "assets/ruby3.png" },
    { xp: 10500, name: "Sapphire 1", image: "assets/sapphire1.png" },
    { xp: 10000, name: "Sapphire 2", image: "assets/sapphire2.png" },
    { xp: 9500, name: "Sapphire 3", image: "assets/sapphire3.png" },
    { xp: 9000, name: "Emerald 1", image: "assets/emerald1.png" },
    { xp: 8500, name: "Emerald 2", image: "assets/emerald2.png" },
    { xp: 8000, name: "Emerald 3", image: "assets/emerald3.png" },
    { xp: 7500, name: "Diamond 1", image: "assets/diamond1.png" },
    { xp: 7000, name: "Diamond 2", image: "assets/diamond2.png" },
    { xp: 6500, name: "Diamond 3", image: "assets/diamond3.png" },
    { xp: 6000, name: "Platinum 1", image: "assets/platinum1.png" },
    { xp: 5500, name: "Platinum 2", image: "assets/platinum2.png" },
    { xp: 5000, name: "Platinum 3", image: "assets/platinum3.png" },
    { xp: 4500, name: "Gold 1", image: "assets/gold1.png" },
    { xp: 4000, name: "Gold 2", image: "assets/gold2.png" },
    { xp: 3500, name: "Gold 3", image: "assets/gold3.png" },
    { xp: 3000, name: "Silver 1", image: "assets/silver1.png" },
    { xp: 2500, name: "Silver 2", image: "assets/silver2.png" },
    { xp: 2000, name: "Silver 3", image: "assets/silver3.png" },
    { xp: 1500, name: "Bronze 1", image: "assets/bronze1.png" },
    { xp: 1000, name: "Bronze 2", image: "assets/bronze2.png" },
    { xp: 500, name: "Bronze 3", image: "assets/bronze3.png" },
  ];

  const UNRANKED = { xp: 0, name: "Unranked", image: null };

  return {
    getCurrentBadge: function (xp) {
      var badge = BADGE_TIERS.find((t) => xp >= t.xp);
      return badge ? badge : UNRANKED;
    },
    getAllUnlockedBadges: function (xp) {
      return BADGE_TIERS.filter((t) => xp >= t.xp);
    },
  };
});

app.run(function ($rootScope, $location, GameService) {
  var savedUser = localStorage.getItem("tasquest_user");
  var savedRole = localStorage.getItem("tasquest_role");

  if (savedRole) {
    $rootScope.isLoggedIn = true;
    if (savedRole === "admin") {
      $rootScope.isAdmin = true;
    } else if (savedRole === "user" && savedUser) {
      $rootScope.isAdmin = false;
      GameService.currentUser = JSON.parse(savedUser);
    }
  }

  $rootScope.logout = function () {
    localStorage.removeItem("tasquest_user");
    localStorage.removeItem("tasquest_role");

    $rootScope.isLoggedIn = false;
    $rootScope.isAdmin = false;
    GameService.currentUser = null;

    $location.path("/login");
  };
});

app.controller(
  "LoginCtrl",
  function ($scope, $location, $rootScope, $http, GameService) {
    $scope.login = function () {
      $http
        .post("/api/login", {
          username: $scope.username,
          password: $scope.password,
        })
        .then(function (response) {
          const data = response.data;

          if (data.role === "admin") {
            $rootScope.isLoggedIn = true;
            $rootScope.isAdmin = true;

            localStorage.setItem("tasquest_role", "admin");

            $location.path("/admin");
          } else if (data.role === "user") {
            GameService.currentUser = data.user;
            $rootScope.isLoggedIn = true;
            $rootScope.isAdmin = false;

            localStorage.setItem("tasquest_role", "user");
            localStorage.setItem("tasquest_user", JSON.stringify(data.user));

            $location.path("/dashboard");
          }
        })
        .catch(function (error) {
          var errorMsg =
            error.data && error.data.message
              ? error.data.message
              : "Server error!";
          alert("Login Failed: " + errorMsg);
        });
    };
  },
);

app.controller(
  "AdminCtrl",
  function ($scope, GameService, BadgeService, $location, $rootScope, $timeout, $http) {
    if (!$rootScope.isAdmin) {
      $location.path("/login");
      return;
    }

    $scope.users = GameService.allUsers;
    $scope.newUser = {};

    $http
      .get("/api/getUsers")
      .then(function (response) {
        if (response.data.success) {
          GameService.allUsers = response.data.users.map(function (user) {
            user.badge = BadgeService.getCurrentBadge(user.xp);
            return user;
          });
          $scope.users = GameService.allUsers;
        }
      })
      .catch(function (error) {
        console.error("Error loading users:", error);
      });

    $scope.addUser = function () {
      if ($scope.newUser.username && $scope.newUser.password) {
        $http
          .post("/api/addUser", {
            username: $scope.newUser.username,
            password: $scope.newUser.password,
          })
          .then(function (response) {
            if (response.data.success) {
              var newUserObj = {
                id: response.data.userId,
                username: $scope.newUser.username,
                xp: 0,
                level: 1,
                tasks: [],
              };
              newUserObj.badge = BadgeService.getCurrentBadge(newUserObj.xp);
              $scope.users.push(newUserObj);
              $scope.newUser = {};
              alert("New Adventurer Recruited!");
            } else {
              alert("Error: " + response.data.message);
            }
          })
          .catch(function (error) {
            var errorMsg =
              error.data && error.data.message
                ? error.data.message
                : "Server error!";
            alert("Failed to add user: " + errorMsg);
          });
      }
    };

    $scope.removeUser = function (user) {
      user.isBanished = true;

      $http
        .delete("/api/removeUser/" + user.id)
        .then(function (response) {
          if (response.data.success) {
            $timeout(function () {
              var index = $scope.users.indexOf(user);
              if (index > -1) {
                $scope.users.splice(index, 1);
              }
            }, 500);
          } else {
            alert("Error: " + response.data.message);
            user.isBanished = false;
          }
        })
        .catch(function (error) {
          alert("Failed to delete user");
          user.isBanished = false;
        });
    };
  },
);

app.controller(
  "DashboardCtrl",
  function ($scope, GameService, BadgeService, $location, $rootScope, $http) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) {
      $location.path("/login");
      return;
    }

    $scope.user = GameService.currentUser;
    $scope.currentBadge = BadgeService.getCurrentBadge($scope.user.xp);
    $scope.newTask = {};

    $scope.addTask = function () {
      if ($scope.newTask.name && $scope.newTask.deadline) {
        var deadlineStr;
        if (typeof $scope.newTask.deadline === "string") {
          deadlineStr = $scope.newTask.deadline.replace("T", " ") + ":00";
        } else {
          var d = new Date($scope.newTask.deadline);
          var year = d.getFullYear();
          var month = String(d.getMonth() + 1).padStart(2, "0");
          var day = String(d.getDate()).padStart(2, "0");
          var hours = String(d.getHours()).padStart(2, "0");
          var minutes = String(d.getMinutes()).padStart(2, "0");
          var seconds = "00";
          deadlineStr =
            year +
            "-" +
            month +
            "-" +
            day +
            " " +
            hours +
            ":" +
            minutes +
            ":" +
            seconds;
        }

        $http
          .post("/api/addTask", {
            userId: $scope.user.id,
            name: $scope.newTask.name,
            deadline: deadlineStr,
          })
          .then(function (response) {
            if (response.data.success) {
              $scope.user.tasks.push({
                id: response.data.taskId,
                name: $scope.newTask.name,
                deadline: new Date($scope.newTask.deadline),
                completed: false,
              });
              $scope.newTask = {};

              if (response.data.penaltyApplied) {
                $http
                  .get("/api/getUsers")
                  .then(function (usersResponse) {
                    if (usersResponse.data.success) {
                      var updatedUser = usersResponse.data.users.find(u => u.id === $scope.user.id);
                      if (updatedUser) {
                        $scope.user.xp = updatedUser.xp;
                        $scope.user.level = updatedUser.level;
                      }
                    }
                  });
              }

              localStorage.setItem(
                "tasquest_user",
                JSON.stringify($scope.user),
              );
              alert(response.data.message);
            } else {
              alert("Error: " + response.data.message);
            }
          })
          .catch(function (error) {
            var errorMsg =
              error.data && error.data.message
                ? error.data.message
                : "Server error!";
            alert("Failed to add quest: " + errorMsg);
          });
      }
    };

    $scope.getTasksSorted = function () {
      if (!$scope.user.tasks) return [];
      var tasks = $scope.user.tasks.slice();
      return tasks.sort(function (a, b) {
        if (a.completed === b.completed) {
          return 0;
        }
        return a.completed ? 1 : -1;
      });
    };

    $scope.completeTask = function (task) {
      if (task.completed) return;

      $http
        .put("/api/completeTask/" + task.id, {
          completed: true,
        })
        .then(function (response) {
          if (response.data.success) {
            task.completed = true;
            var now = new Date();

            var xpGain = 0;
            if (now <= new Date(task.deadline)) {
              xpGain = 50;
              alert("Quest Completed on time! +50 XP");
            } else {
              xpGain = 0;
              alert(
                "Quest Completed late! 0 XP gained (penalty already applied).",
              );
            }

            if (xpGain !== 0) {
              $http
                .put("/api/updateUserXP", {
                  userId: $scope.user.id,
                  xpChange: xpGain,
                })
                .then(function (updateResponse) {
                  if (updateResponse.data.success) {
                    $scope.user.xp = updateResponse.data.user.xp;
                    $scope.user.level = updateResponse.data.user.level;
                    localStorage.setItem(
                      "tasquest_user",
                      JSON.stringify($scope.user),
                    );
                  }
                })
                .catch(function (error) {
                  console.error("Failed to update XP:", error);
                });
            }
          } else {
            alert("Error: " + response.data.message);
          }
        })
        .catch(function (error) {
          alert("Failed to complete quest");
        });
    };
  },
);

app.controller(
  "ProfileCtrl",
  function ($scope, GameService, BadgeService, $location, $rootScope) {
    if (!$rootScope.isLoggedIn || $rootScope.isAdmin) {
      $location.path("/login");
      return;
    }
    $scope.user = GameService.currentUser;
    $scope.currentBadge = BadgeService.getCurrentBadge($scope.user.xp);
    $scope.unlockedBadges = BadgeService.getAllUnlockedBadges($scope.user.xp);
  },
);

app.controller(
  "LeaderboardCtrl",
  function ($scope, GameService, BadgeService, $location, $rootScope, $http) {
    if (!$rootScope.isLoggedIn) {
      $location.path("/login");
      return;
    }

    $http
      .get("/api/getUsers")
      .then(function (response) {
        if (response.data.success) {
          $scope.players = response.data.users.map(function (player) {
            player.badge = BadgeService.getCurrentBadge(player.xp);
            return player;
          });
          GameService.allUsers = $scope.players;
        }
      })
      .catch(function (error) {
        console.error("Error loading leaderboard:", error);
        $scope.players = GameService.allUsers;
      });
  },
);

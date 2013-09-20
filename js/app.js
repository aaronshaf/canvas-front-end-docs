angular.module('prettyApiFilters', []).filter('splitter', function() {
  return function(input) {
    if(typeof input === 'undefined') return input;
    input = input.split('[').join('<span> </span>[');
    input = input.split('|').join('<span> </span>|<span> </span>');
    return input;
  };
});

app = angular.module('prettyApi', ['prettyApiFilters']);
app.controller('AppController', function($scope) {
  $scope.loading = true;
  $scope.query = '';
  $scope.active_resource = '';

  $scope.switchTo = function(name) {
    $scope.active_resource = name;
  }

  var api = window.localStorage.getItem('api');
  if(typeof api !== 'undefined' && api) {
    $scope.api = JSON.parse(api);
  } else {
    $scope.api = {};  
  }
  
  $.getJSON('data/api.json?buster' + Math.random(),function(data) {
    $scope.api = data;
    $scope.loading = false;
    $scope.$apply('api');
    window.localStorage.setItem('api',JSON.stringify(data));
  });
});

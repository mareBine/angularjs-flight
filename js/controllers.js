/**
 * Created by mare on 4.10.2014.
 */

var testApp = angular.module('testApp', ['angular-loading-bar', 'ngAnimate']);

testApp.controller('bwdCtrl', function ($scope, $http) {

    $scope.selectedOption = 'AT';
    $scope.dataLoaded = false;

    /**
     * get all country codes
     */
    $http.post('api/countries').success(function (data) {
        console.log(data);
        $scope.countries = data;
    });

    /**
     * za dobit bwd podatke
     */
    $scope.$watch('selectedOption', function() {
        var requestData = {cc: $scope.selectedOption};
        console.log(requestData);
        $scope.dataLoaded = false;

        $http.post('api/allsamples', requestData).success(function (data) {
            //console.log(data);
            $scope.bwds = data.data;
            $scope.bwdColumns = data.columns;
            $scope.dataLoaded = true;

        });

    });

    $scope.setValue = function (cc) {
        console.log(cc);
        $scope.requestData = cc;
    }

});
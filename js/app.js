/**
 * Created by mare on 4.10.2014.
 */

var app = angular.module('main', ['ngTable', 'ngResource']);

/**
 * direktiva za loading fadeout
 */
app.directive('loadingContainer', function () {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var loadingLayer = angular.element('<div class="loading"></div>');
            element.append(loadingLayer);
            element.addClass('loading-container');
            scope.$watch(attrs.loadingContainer, function (value) {
                loadingLayer.toggleClass('ng-hide', !value);
            });
        }
    };
});

/**
 * controller
 */
app.controller('AppCtrl', function ($scope, $timeout, $resource, ngTableParams, $log, $http, $q) {

    var Api = $resource('api/allsamples');

    // dobi ven vse države
    /*
     $http.post('api/countries').success(function (data) {
     //console.log(data);
     $scope.countries = data;
     });
     */


    /**
     * za napolnit filter za države
     *
     * @param column
     * @returns {Deferred}
     *
     * TODO: da jih pobere iz baze?
     */
    $scope.names = function (column) {

        var def = $q.defer();
        var names = [
            {"id": "AT", "title": "AT"},
            {"id": "BE", "title": "BE"},
            {"id": "CH", "title": "CH"},
            {"id": "CY", "title": "CY"},
            {"id": "CZ", "title": "CZ"},
            {"id": "DE", "title": "DE"},
            {"id": "DK", "title": "DK"},
            {"id": "EE", "title": "EE"},
            {"id": "ES", "title": "ES"},
            {"id": "FI", "title": "FI"},
            {"id": "FR", "title": "FR"},
            {"id": "GR", "title": "GR"},
            {"id": "HR", "title": "HR"},
            {"id": "HU", "title": "HU"},
            {"id": "IT", "title": "IT"},
            {"id": "LT", "title": "LT"},
            {"id": "LU", "title": "LU"},
            {"id": "LV", "title": "LV"},
            {"id": "MT", "title": "MT"},
            {"id": "NL", "title": "NL"},
            {"id": "PT", "title": "PT"},
            {"id": "SE", "title": "SE"},
            {"id": "SI", "title": "SI"},
            {"id": "SK", "title": "SK"}
        ];

        //$log.log("names: ", names);

        def.resolve(names);
        return def;
    };

    /*
     * osnovni parametri za init tabele + f. za dobit podatke ob spremembi
     */
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            BWID: 'asc'     // initial sorting
        },
        filter: {
            cc: 'SI'        // initial filter sem dal na AT
        }
    }, {
        total: 0,           // length of data
        getData: function ($defer, params) {

            // ajax request to api: get = GET, save = POST
            Api.save(params.url(), function (data) {
                //$timeout(function () {
                // update table params
                //$log.log(data);
                params.total(data.total);
                // set new data
                $defer.resolve(data.data);

                //$log.log(data);
                //}, 500);
            });
        }
    });
});
/**
 * Created by mare on 4.10.2014.
 */

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

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
app.controller('AppCtrl', function ($scope, $timeout, $resource, ngTableParams, $log, $filter) {
    var Api = $resource('api/allsamples/DE');

    // osnovni parametri za init
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
            BWID: 'asc'     // initial sorting
        }
    }, {
        total: 0,           // length of data
        getData: function ($defer, params) {

            // ajax request to api: get = GET, save = POST
            Api.save(params.url(), function (data) {
                //$timeout(function () {
                // update table params
                $log.log(data);
                params.total(data.total);
                // set new data
                $defer.resolve(data.data);

                //$log.log(data);
                //}, 500);
            });
        }
    });
});
import angular from 'angular';
import uirouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';

import 'bootstrap-loader';

import routing from './app.config.js';

(function () {
  angular.module('app', [
    ngAnimate,
    uirouter,
  ])
  .config(routing);
})();

/**
 * For documentation please refer to the project wiki:
 * https://github.com/bvaughn/angular-form-for/wiki/API-Reference#selectfield
 */
angular.module('formFor').directive('selectField',
  function($log, $timeout) {
    return {
      require: '^formFor',
      restrict: 'E',
      replace: true,
      templateUrl: 'form-for/templates/select-field.html',
      scope: {
        attribute: '@',
        disable: '@',
        help: '@?',
        label: '@?',
        options: '=',
        placeholder: '@?'
      },
      link: function($scope, $element, $attributes, formForController) {
        if (!$scope.attribute || !$scope.options) {
          $log.error('Missing required field(s) "attribute" or "options"');

          return;
        }

        $scope.allowBlank = $attributes.hasOwnProperty('allowBlank');
        $scope.model = formForController.registerFormField($scope, $scope.attribute);

        // TODO Track scroll position and viewport height and expand upward if needed

        $scope.$watch('model.bindable', function(value) {
          var option = _.find($scope.options,
            function(option) {
              return value === option.value;
            });

          $scope.selectedOption = option;
          $scope.selectedOptionLabel = option && option.label;
        });

        var oneClick = function(target, handler) {
          $timeout(function() { // Delay to avoid processing the same click event that trigger the toggle-open
            target.one('click', handler);
          }, 1);
        }

        $scope.selectOption = function(option) {
          $scope.model.bindable = option && option.value;
          $scope.isOpen = false;

          $(window).off('click', clickWatcher);

          oneClick($element, clickToOpen);
        };

        var clickWatcher = function(event) {
          $scope.isOpen = false;
          $scope.$apply();

          oneClick($element, clickToOpen);
        };

        var scroller = $element.find('.select-field-dropdown-list-container');
        var list = $element.find('ul');

        var clickToOpen = function() {
          if ($scope.disable || $scope.disabledByForm) {
            return;
          }

          $scope.isOpen = !$scope.isOpen;

          if ($scope.isOpen) {
            oneClick($(window), clickWatcher);

            var value = $scope.model.bindable;

            $timeout(function() {
              var listItem =
                _.find(list.find('li'),
                  function(listItem) {
                    var option = $(listItem).scope().option;

                    return option && option.value === value;
                  });

              if (listItem) {
                scroller.scrollTop(
                  $(listItem).offset().top - $(listItem).parent().offset().top);
              }
            }.bind(this), 1);
          }
        };

        oneClick($element, clickToOpen);

        $scope.$on('$destroy', function() {
          $(window).off('click', clickWatcher);
        });
      }
    };
  });

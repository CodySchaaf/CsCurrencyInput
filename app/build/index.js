var cs;
(function (cs) {
    cs.csCurrencyInput = angular.module("csCurrencyInput", []);
})(cs || (cs = {}));

var cs;
(function (cs) {
    cs.csCurrencyInput.directive('csCurrencyInput', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                allowNegatives: '=',
                csPlaceholder: '@',
                noPlaceholder: '=?'
            },
            link: function (scope, element, attributes, ngModelController) {
                return new Link(scope, element, attributes, ngModelController);
            }
        };
    });
    var Link = (function () {
        function Link(scope, element, attributes, ngModelController) {
            this.scope = scope;
            if (!scope.noPlaceholder) {
                attributes.$set('placeholder', scope.csPlaceholder || Link.defaultPlaceholder);
            }
            this.attachKeyDownHandler(element);
            this.attachValidation(ngModelController);
            this.attachModelPipelines(ngModelController, element[0]);
        }
        Link.prototype.pattern = function () {
            return this.scope.allowNegatives ? cs.Str.negativeNumberPattern : cs.Str.positiveNumberPattern;
        };
        Link.reassembleInput = function (input, normalizedString) {
            var decimal = cs.Str.getDecimalPart(input);
            var dollarSignNegativeSign = input.match(/^(?:-\$|\$-|-|\$)?/)[0];
            return dollarSignNegativeSign + normalizedString + decimal;
        };
        Link.handleCommaDeletion = function (element, characterPosition, deletionDirection) {
            var selectionStart = element.selectionStart;
            var characterToDelete = element.value.charAt(selectionStart + characterPosition);
            if (characterToDelete === ',' && selectionStart === element.selectionEnd) {
                var point = selectionStart + deletionDirection;
                element.setSelectionRange(point, point);
                event.preventDefault();
            }
        };
        Link.prototype.attachKeyDownHandler = function ($element) {
            var element = $element[0];
            $element.on("keydown", function (event) {
                if (cs.Str.isDelete(event)) {
                    Link.handleCommaDeletion(element, -1, -1);
                }
                else if (cs.Str.isBackspace(event)) {
                    Link.handleCommaDeletion(element, 0, 1);
                }
                else if (cs.Str.isComma(event)) {
                    event.preventDefault();
                }
            });
        };
        Link.prototype.attachModelPipelines = function (ngModelController, element) {
            var _this = this;
            ngModelController.$parsers.push(function (inputValue) {
                if (!inputValue)
                    return null;
                if (!_this.pattern().test(inputValue))
                    return null;
                var selectionStart = element.selectionStart;
                var numberOfExtraCharacters = (inputValue.match(/[$\-]/g) || []).length;
                var components = inputValue.split(".");
                var integerPart = components[0];
                var normalizedString = cs.Str.addCommasToString(integerPart);
                if (selectionStart - numberOfExtraCharacters > 0) {
                    selectionStart += cs.Str.countCommas(normalizedString) - cs.Str.countCommas(inputValue);
                }
                if (cs.Str.sanitizeNumberAsString(normalizedString) !== cs.Str.sanitizeNumberAsString(integerPart)) {
                    var formattedNumber = Link.reassembleInput(inputValue, normalizedString);
                    ngModelController.$setViewValue(formattedNumber); //$setViewValue will call parsers again, so ensure sanitized strings match to prevent infinite loop
                    ngModelController.$render();
                    element.setSelectionRange(selectionStart, selectionStart);
                }
                return cs.Str.stringToFloat(inputValue);
            });
            ngModelController.$formatters.unshift(function (inputValue) {
                if (!inputValue)
                    return null;
                var stringValue = String(inputValue);
                if (!_this.pattern().test(stringValue))
                    return null;
                var formattedString = cs.Str.addCommasToString(cs.Str.getIntegerPart(stringValue));
                return Link.reassembleInput(stringValue, formattedString);
            });
        };
        Link.prototype.attachValidation = function (ngModelController) {
            var _this = this;
            ngModelController.$validators['pattern'] = function (modelValue, viewValue) {
                console.log("modelValue", modelValue);
                console.log("viewValue", viewValue);
                var value = modelValue == null ? viewValue : String(modelValue);
                return value == null || _this.pattern().test(value);
            };
        };
        Link.defaultPlaceholder = "$";
        return Link;
    })();
})(cs || (cs = {}));

var cs;
(function (cs) {
    var Str = (function () {
        function Str() {
        }
        Str.convertToLocaleString = function (num) {
            var negative = num < 0 ? "-" : ""; //Safari
            var newNum = Math.abs(num);
            if (((1000).toLocaleString("en") !== "1,000")) {
                //Safari + IE
                var tmpString = (Math.round(newNum * 1000) / 1000).toString(); //Simulate toLocaleString's 3 decimal round
                var decimalsStr = (tmpString.match(/\.\d+/) || [""])[0];
                return negative + tmpString.replace(/\.\d*/, "").replace(/(?=(?!^)(?:\d{3})+(?!\d))/g, ",") + decimalsStr;
            }
            else {
                //Browsers that behave themselves
                return num.toLocaleString("en");
            }
        };
        Str.addCommasToString = function (str) {
            var sanitizedString = Str.sanitizeNumberAsString(str);
            var float = Str.stringToFloat(sanitizedString);
            return Str.convertToLocaleString(float);
        };
        Str.sanitizeNumberAsString = function (str) {
            return str.replace(/[^\d,]/g, "");
        };
        Str.stringToFloat = function (str) {
            return parseFloat(str.replace(/[^\-\d.]/g, ""));
        };
        Str.countCommas = function (str) {
            return (str.match(/,/g) || []).length;
        };
        Str.getIntegerPart = function (value) {
            return value.split(".")[0];
        };
        Str.getDecimalPart = function (value) {
            return (value.match(/\.\d*/) || [""])[0];
        };
        Str.isComma = function (event) {
            return event.which === Str.commaKeyCode;
        };
        Str.isDelete = function (event) {
            return event.which === Str.deleteKeyCode;
        };
        Str.isBackspace = function (event) {
            return event.which === Str.backspaceKeyCode;
        };
        Str.positiveNumberPattern = /^\$?[0-9,]+(?:.[0-9]+)?$/;
        Str.negativeNumberPattern = /^(?:-\$|\$-|-|\$)?[0-9,]+(?:.[0-9]+)?$/;
        Str.commaKeyCode = 188;
        Str.deleteKeyCode = 8;
        Str.backspaceKeyCode = 46;
        return Str;
    })();
    cs.Str = Str;
})(cs || (cs = {}));

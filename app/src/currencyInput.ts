module cs {
  csCurrencyInput.directive('csCurrencyInput', (): ng.IDirective => {
    return {
      restrict: 'A',
      require:  'ngModel',
      scope:    {
        allowNegatives: '=',
        csPlaceholder:  '@',
        noPlaceholder:  '=?',
      },
      link:     (scope: IScope, element: ng.IAugmentedJQuery, attributes: ng.IAttributes, ngModelController: ng.INgModelController): Link => {
        return new Link(scope, element, attributes, ngModelController);
      },
    };
  });

  interface IScope extends ng.IScope {
    allowNegatives: boolean;
    csPlaceholder:  string;
    noPlaceholder:  boolean;
  }

  class Link {
    private static defaultPlaceholder: string = "$";

    constructor(private scope: IScope, element: ng.IAugmentedJQuery, attributes: ng.IAttributes, ngModelController: ng.INgModelController) {
      if (!scope.noPlaceholder) {
        attributes.$set('placeholder', scope.csPlaceholder || Link.defaultPlaceholder);
      }
      this.attachKeyDownHandler(element);
      this.attachValidation(ngModelController);
      this.attachModelPipelines(ngModelController, <HTMLInputElement>element[0]);
    }

    private pattern(): RegExp {
      return this.scope.allowNegatives ? Str.negativeNumberPattern : Str.positiveNumberPattern;
    }

    private static reassembleInput(input: string, normalizedString: string): string {
      var decimal:                string = Str.getDecimalPart(input);
      var dollarSignNegativeSign: string = input.match(/^(?:-\$|\$-|-|\$)?/)[0];

      return dollarSignNegativeSign + normalizedString + decimal;
    }

    private static handleCommaDeletion(element: HTMLInputElement, characterPosition: number, deletionDirection: number): void {
      var selectionStart:    number = element.selectionStart;
      var characterToDelete: string = element.value.charAt(selectionStart + characterPosition);

      if (characterToDelete === ',' && selectionStart === element.selectionEnd) {
        var point: number = selectionStart + deletionDirection;
        element.setSelectionRange(point, point);
        event.preventDefault();
      }
    }

    private attachKeyDownHandler($element: ng.IAugmentedJQuery): void {
      var element: HTMLInputElement = <HTMLInputElement>$element[0];
      $element.on("keydown", (event: JQueryEventObject): void => {
        if (Str.isDelete(event)) {
          Link.handleCommaDeletion(element, -1, -1);
        } else if (Str.isBackspace(event)) {
          Link.handleCommaDeletion(element, 0, 1);
        } else if (Str.isComma(event)) {
          event.preventDefault();
        }
      });
    }

    private attachModelPipelines(ngModelController: ng.INgModelController, element: HTMLInputElement): void {
      ngModelController.$parsers.push((inputValue: string): number => {
        if (!inputValue) return null;
        if (!this.pattern().test(inputValue)) return null;

        var selectionStart:          number = element.selectionStart;
        var numberOfExtraCharacters: number = (inputValue.match(/[$\-]/g) || []).length;

        var components:  string[] = inputValue.split(".");
        var integerPart: string   = components[0];

        var normalizedString: string = Str.addCommasToString(integerPart);
        if (selectionStart - numberOfExtraCharacters > 0) {
          selectionStart += Str.countCommas(normalizedString) - Str.countCommas(inputValue);
        }

        if (Str.sanitizeNumberAsString(normalizedString) !== Str.sanitizeNumberAsString(integerPart)) {
          var formattedNumber: string = Link.reassembleInput(inputValue, normalizedString);
          ngModelController.$setViewValue(formattedNumber); //$setViewValue will call parsers again, so ensure sanitized strings match to prevent infinite loop
          ngModelController.$render();
          element.setSelectionRange(selectionStart, selectionStart);
        }
        return Str.stringToFloat(inputValue);
      });

      ngModelController.$formatters.unshift((inputValue: string): string => {
        if (!inputValue) return null;
        var stringValue = String(inputValue);
        if (!this.pattern().test(stringValue)) return null;
        var formattedString: string = Str.addCommasToString(Str.getIntegerPart(stringValue));
        return Link.reassembleInput(stringValue, formattedString);
      });
    }

    private attachValidation(ngModelController: ng.INgModelController): void {
      ngModelController.$validators['pattern'] = (modelValue: number, viewValue: string): boolean => {
        console.log("modelValue", modelValue);
        console.log("viewValue", viewValue);
        var value = modelValue == null ? viewValue : String(modelValue);
        return value == null || this.pattern().test(value)
      };
    }
  }
}

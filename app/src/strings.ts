module cs {
  export class Str {
    public static positiveNumberPattern: RegExp = /^\$?[0-9,]+(?:.[0-9]+)?$/;
    public static negativeNumberPattern: RegExp = /^(?:-\$|\$-|-|\$)?[0-9,]+(?:.[0-9]+)?$/;

    private static commaKeyCode:     number = 188;
    private static deleteKeyCode:    number = 8;
    private static backspaceKeyCode: number = 46;

    public static convertToLocaleString(num: number): string {
      var negative: string = num < 0 ? "-" : ""; //Safari
      var newNum:   number = Math.abs(num);
      if (((1000).toLocaleString("en") !== "1,000")) {
        //Safari + IE
        var tmpString:   string = (Math.round(newNum * 1000) / 1000).toString(); //Simulate toLocaleString's 3 decimal round
        var decimalsStr: string = (tmpString.match(/\.\d+/) || [""])[0];
        return negative + tmpString.replace(/\.\d*/, "").replace(/(?=(?!^)(?:\d{3})+(?!\d))/g, ",") + decimalsStr;
      } else {
        //Browsers that behave themselves
        return num.toLocaleString("en");
      }
    }

    public static addCommasToString(str: string): string {
      var sanitizedString: string = Str.sanitizeNumberAsString(str);
      var float:           number = Str.stringToFloat(sanitizedString);
      return Str.convertToLocaleString(float);
    }

    public static sanitizeNumberAsString(str: string): string {
      return str.replace(/[^\d,]/g, "");
    }

    public static stringToFloat(str: string): number {
      return parseFloat(str.replace(/[^\-\d.]/g, ""));
    }

    public static countCommas(str: string): number {
      return (str.match(/,/g) || []).length;
    }

    public static getIntegerPart(value: string): string {
      return value.split(".")[0];
    }

    public static getDecimalPart(value: string): string {
      return (value.match(/\.\d*/) || [""])[0];
    }

    public static isComma(event: JQueryEventObject): boolean {
      return event.which === Str.commaKeyCode;
    }

    public static isDelete(event: JQueryEventObject): boolean {
      return event.which === Str.deleteKeyCode;
    }

    public static isBackspace(event: JQueryEventObject): boolean {
      return event.which === Str.backspaceKeyCode;
    }
  }
}

# CsCurrencyInput

Angular module with currency input directive (add commas as you type 


##Usage
 
Check out a working example on [Codepen](http://codepen.io/codyschaaf/pen/GprYyR) the [Gist](https://gist.github.com/CodySchaaf/6cd2de43defac010ea07)

```html

<input type="text" cs-currency-input ng-model="MainCtrl.amount" allow-negatives="true" class="input-s form-control money" placeholder="$"/>

```

The directive's name is `cs-currency-input`, pass in the optional `allow-negatives="true"` to allow negative currencies.
Change the placeholder to by passing in `cs-placeholder="*"`, or remove it with `no-placeholder="true"`.



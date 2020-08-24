class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.value = settings.amountWidget.defaultValue; // this is here in case value in HTML is not given

    thisWidget.setValue(thisWidget.input.value);

    thisWidget.initActions(); // now works, do not forget to call instances

    // console.log('AmountWidget:', thisWidget);
    // console.log('constructor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
  
    const newValue = parseInt(value);
  
    /* [DONE] Add validation */
    if (newValue != thisWidget.value 
        && newValue >= settings.amountWidget.defaultMin 
        && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value); // same argument as in constructor!
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1); // can't modify thisWidget.value so no --
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1); // can't modify thisWidget.value so no ++
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true // in cases of custom events we have to enable bubbles property manually - after being executed on an element, will be passed to its parent and parent's parent, and so on - up to <body>, document and window itself
    });

    thisWidget.element.dispatchEvent(event);
  }
}
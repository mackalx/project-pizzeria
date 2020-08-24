import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this; // this is an object that represents instance

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();

    thisProduct.getElements();

    thisProduct.initAccordion();

    thisProduct.initOrderForm();

    thisProduct.initAmountWidget();

    thisProduct.processOrder();

    // console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
      
    /* [DONE] START: click event listener to found with selector clickable trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(event){
      /* [DONE] prevent default action for event */
      event.preventDefault(); // what does it really do? CHECK
      /* [DONE] toggle active class on element of thisProduct */ // CHECK
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* [DONE] find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* [DONE] START LOOP: for each active product */
      for (let activeProduct of activeProducts){
        /* [DONE] START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element){ // remember to use === : ('' == 0) is true because string converts to integer this way, ('' === 0) is false
          /* [DONE] remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          /* [DONE] END: if the active product isn't the element of thisProduct */
        }
        /* [DONE] END LOOP: for each active product */
      }
      /* [DONE] END: click event listener to trigger */
    }); // REMEMBER THIS!!!
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault(); // block sending form with page reload
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault(); // block change of page address after clicking the link (this button is in this case just a link)
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    /* [DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    /* [DONE] set variable price to equal thisProduct.data.price */
    thisProduct.params = {};
    let price = thisProduct.data.price;
    /* [DONE] START LOOP: for each paramId in thisProduct.data.params */
    for (let paramId in thisProduct.data.params) {
      /* [DONE] save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      /* [DONE] START LOOP: for each optionId in param.options */
      for (let optionId in param.options){
        /* [DONE] save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* [DONE] START IF: if option is selected and option is not default */
        if (optionSelected && !option.default){
          /* [DONE] add price of option to variable price */
          price += option.price;
          /* [DONE] END IF: if option is selected and option is not default */
          /* [DONE] START ELSE IF: if option is not selected and option is default */
        } else if (!optionSelected && option.default){
          /* [DONE] deduct price of option from price */
          price -= option.price;
          /* [DONE] END ELSE IF: if option is not selected and option is default */
        }
        /* [DONE] get images by selecting on imagewrapper dynamic selector made of param and option ids */
        const productImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        /* [DONE] START IF: if option is selected */
        if (optionSelected){
          if (!thisProduct.params[paramId]){ // checking if this parameter has already been added to thisProduct.params - if not, then under its key we add its label and an empty options object
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label; // adding the selected option to the options object (see l. 216) using its key and setting its label as its value
          /* [DONE] START LOOP: for each image in all images */
          for (let productImage of productImages){
            /* [DONE] add class active to image */
            productImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else { // !!!TRY TO CHANGE IT TO IF NEGATION
          /* [DONE] START LOOP: for each image in all images */
          for (let productImage of productImages){
            /* [DONE] remove class active from image */
            productImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        /* [DONE] END LOOP: for each optionId in param.options */
      }
      /* [DONE] END LOOP: for each paramId in thisProduct.data.params */
    }
    /* [DONE] multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* [DONE] set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    // console.log('thisProduct.params is:', thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){ // it passes the entire instance as an argument to the app.cart.add method (we saved an instance of the Cart class in app.cart) 
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
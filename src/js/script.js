/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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

      app.cart.add(thisProduct);
    }
  }

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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = []; // array that will contain every product added to cart
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();
      // console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; // object that will contain every DOM element found in the cart component (instead f.e. thisCart.amountElem we'll use thisCart.dom.amount)
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function (event){
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); // handler of the listener that toggless class stored in classNames.cart.wrapperActive on thisCart.dom.wrapper element
      });
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct); // create HTML code using the appropriate template and store it in generatedHTML const
      const generatedDOM = utils.createDOMFromHTML(generatedHTML); // then convert this code into DOM elements and store it in generatedDOM const
      const cartContainer = thisCart.dom.productList; // add these DOM elements to thisCart.dom.productList
      cartContainer.appendChild(generatedDOM);

      // console.log('adding product', menuProduct);

      thisCart.products.push (new CartProduct(menuProduct, generatedDOM)); // this way we will simultaneously create a new instance of the new CartProduct class and add it to the thisCart.products array
      // console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update(){
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let thisCartProduct of thisCart.products){
        thisCart.subtotalPrice += thisCartProduct.price;
        thisCart.totalNumber += thisCartProduct.amount;
      }
      if (thisCart.subtotalPrice > 0){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);
      console.log('totalPrice', thisCart.totalPrice);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params)); // clone the object to use a copy of its current values

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      // console.log('new CartProduct', thisCartProduct);
      // console.log('productData', menuProduct);
    }

    getElements(element){
      const thisCartProduct = this;
  
      thisCartProduct.dom = {};
  
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){ // copied from Product.initAmountWidget and edited
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
  }


  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function(){ // method initiating cart instance - we give it the cart's wrapper
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem); // Cart class instance in thisApp.cart (we can call it outside app with app.cart)
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}

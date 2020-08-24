import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function(){
    const thisApp = this;

    // console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); // the only place where we used product key was here - now instead of a key, we use id
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
      
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url) // using the fetch function we send a query to the provided endpoint address
      .then(function(rawResponse){
        return rawResponse.json(); // convert the received response from JSON to an array
      })
      .then(function(parsedResponse){
        // console.log('parsedResponse:', parsedResponse); // after receiving the converted parsedResponse response, we display it in the console
        /* [DONE] save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* [DONE] execute initMenu method */
        thisApp.initMenu();
      });

    // console.log('thisApp.data:', JSON.stringify(thisApp.data));
  },

  initCart: function(){ // method initiating cart instance - we give it the cart's wrapper
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem); // Cart class instance in thisApp.cart (we can call it outside app with app.cart)

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();


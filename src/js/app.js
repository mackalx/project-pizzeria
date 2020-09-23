import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id === idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(
        classNames.pages.active,
        page.id === pageId
      );
    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }
  },

  initMenu: function(){
    const thisApp = this;

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

  initBooking: function(){
    const thisApp = this;

    thisApp.booking = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.booking);
  },

  initSlider() {
    const thisApp = this;

    thisApp.sliderContent = [];

    thisApp.sliderContent[0] = {
      title: 'Amazing service!', text: 'Excepteur sint occaecat cupidatat non proident.', author: '~ Margaret Osborne',
    };
    thisApp.sliderContent[1] = {
      title: 'Great service!', text: 'Excepteur sint occaecat cupidatat non proident', author: '~ Your mum',
    };
    thisApp.sliderContent[2] = {
      title: 'Fine food!', text: 'Excepteur sint occaecat cupidatat non proident', author: '~ Gordon Ramsay',
    };

    let n = 0;
    
    thisApp.sliderDots = document.querySelectorAll('.slider-dots i');
    
    function changeSlide() {
      const title = document.querySelector('.slider-title');
      const text = document.querySelector('.slider-text');
      const name = document.querySelector('.slider-author');

      for (let sliderDot of thisApp.sliderDots) {
        if (sliderDot.id === 'slider-dot-'+ (n + 1)) {
          sliderDot.classList.add('active');
        } else {
          sliderDot.classList.remove('active');
        }
        title.innerHTML = thisApp.sliderContent[n].title;
        text.innerHTML = thisApp.sliderContent[n].text;
        name.innerHTML = thisApp.sliderContent[n].author;
      }

      if (n < thisApp.sliderContent.length - 1) {
        n++;
      } else {
        n = 0;
      }
    }
    changeSlide();

    setInterval(() => {
      changeSlide();
    }, 3000);
  },

  init: function(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initSlider();
  },
};

app.init();
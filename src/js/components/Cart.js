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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee']; // creating an array that contains four strings - each is a key in select.cart, we'll use this array to quickly create four properties of thisCart.dom object with the same keys, each of them will contain a collection of items found with the appropriate selector

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); // handler of the listener that toggless class stored in classNames.cart.wrapperActive on thisCart.dom.wrapper element
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;
      
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      products: [],

      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
    };

    for(let thisCartProduct of thisCart.products) {
      payload.products.push(thisCartProduct.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse:', parsedResponse);
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

    // console.log('totalNumber', thisCart.totalNumber);
    // console.log('subtotalPrice', thisCart.subtotalPrice);
    // console.log('totalPrice', thisCart.totalPrice);

    for (let key of thisCart.renderTotalsKeys){
      for (let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct){
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);

    thisCart.products.splice(index);
    event.detail.cartProduct.dom.wrapper.remove();

    thisCart.update();
  }
}

export default Cart;
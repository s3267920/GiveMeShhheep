(function() {
  let db = firebase;
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  let cartStore = document.getElementById('cart_store');
  let loading = document.querySelector('.loading_modal');
  let main = document.querySelector('main');
  window.addEventListener('load', () => {
    db.auth().onAuthStateChanged(user => {
      if (!user) {
        return (location.href = '../html/login.html');
      }
      if (user) {
        db.firestore()
          .collection('customersUser')
          .doc(user.uid)
          .get()
          .then(doc => {
            if (doc.data().cartList) {
              cartProduct = doc.data().cartList || [];
              cartStore.textContent = cartProduct.length;
            } else {
              db.firestore()
                .collection('customersUser')
                .doc(user.uid)
                .update({ cartList: cartProduct });
            }
            getProductData(cartProduct);
          });
      } else {
        cartStore.textContent = cartProduct.length;
        getProductData(cartProduct);
      }
      loading.style.display = 'none';
      main.style.visibility = 'visible';
    });
  });

  function getProductData(cartListProduct) {
    let productData = [];
    db.firestore()
      .collection('user')
      .doc('lEhSHeJpNKf6h58s7t2q5URBgDm2')
      .collection('product')
      .orderBy('productIndex', 'asc')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = {
            id: doc.id,
            productIndex: doc.data().productIndex,
            imgList: doc.data().imgList,
            productName: doc.data().productName,
            price: {
              original: doc.data().price.original,
              discount: doc.data().price.discount
            },
            specification: doc.data().specification,
            status: doc.data().status
          };
          if (data.status) {
            productData.push(data);
          }
        });
        let cartListData = [];
        cartListProduct.forEach(el => {
          for (let i = 0; i < productData.length; i++) {
            if (el.dataId === productData[i].id) {
              cartListData.push({
                id: productData[i].id,
                productIndex: productData[i].productIndex,
                imgList: productData[i].imgList,
                productName: productData[i].productName,
                price: {
                  original: productData[i].price.original,
                  discount: productData[i].price.discount
                },
                specification: productData[i].specification,
                status: productData[i].status,
                quantity: el.quantity
              });
            }
          }
        });
        cartListHandler(cartListData, cartListProduct);
        main.style.visibility = 'visible';
        loading.style.display = 'none';
        let checkoutBtn = document.querySelector('.checkout_btn');
        checkoutBtn.addEventListener('click', e => {
          if (cartListData.length) {
            location.href = '../html/checkout.html';
          }
        });
      });
  }
  let cartListContent = document.querySelector('#cart_list_content');

  //購物車列表
  function cartListHandler(cartListData, cartListQuantity) {
    let content = '';
    for (let i = 0, data = cartListData; i < cartListData.length; i++) {
      let newLi = document.createElement('li');
      newLi.classList.add('cart_list');
      newLi.setAttribute('data-index', i);
      content = `
      <div class="cart_list_product">
        <div
          class="cart_list_img"
          style="background-image:url(${data[i].imgList[0].src})"
        ></div>
        <div class="cart_list_product_item">   
          <p><a href="javascript:;"> ${data[i].productName}</a></p>
          <span>NT$ ${data[i].price.discount}</span>
        </div>
      </div>
      <div class="cart_list_item">
        <ul class="quantity">
          <li><input type="button" name="lower" value="-" class="lower" /></li>
          <li class="quantity_num">${cartListData[i].quantity}</li>
          <li><input type="button" value="+" class="add" /></li>
        </ul>
        <div class="cart_list_price">
          <div class="price">NT$ ${data[i].price.discount * cartListData[i].quantity}</div>
          <div class="delete"><i class="far fa-trash-alt"></i></div>
        </div>
      </div>`;
      newLi.innerHTML = content;
      cartListContent.appendChild(newLi);
    }
    orderListHandler(cartListData, cartListQuantity);
    console.log(cartListData);
    cartListContent.addEventListener('click', cartListClickHandler);
    if (cartListQuantity.length) {
      document.querySelector('.checkout').classList.add('checkout_btn_allow');
    }
    function cartListClickHandler(e) {
      const user = db.auth().currentUser;
      let cartListLi = e.target.parentNode.parentNode.parentNode.parentNode;
      let index = cartListLi.dataset.index;
      let quantityNum = e.target.parentNode.parentNode.children[1];
      let totalPrice = e.target.parentNode.parentNode.parentNode.querySelector('.price');
      let productPrice = Number(cartListLi.querySelector('.cart_list_product_item span').textContent.split('NT$ ')[1]);
      let productName = cartListLi.querySelector('.cart_list_product_item p').textContent;
      //進入商品頁
      if (e.target.nodeName === 'A') {
        let index = e.target.parentNode.parentNode.parentNode.parentNode.dataset.index;
        window.location.href = `../html/productItem.html?id=${cartListData[index].id}`;
      }
      if (e && e.target.className === 'add') {
        quantityNum.textContent = Number(quantityNum.textContent) + 1;
        cartListQuantity.forEach(cartProduct => {
          if (cartProduct.dataId === cartListData[index].id) {
            cartProduct.quantity++;
            cartListData[index].quantity++;
          } else return;
        });
        db.firestore()
          .collection('customersUser')
          .doc(user.uid)
          .update({ cartList: cartListQuantity });
        totalPrice.textContent = `NT$ ${productPrice * Number(quantityNum.textContent)}`;
        orderListHandler(cartListData);
      }
      if (e && e.target.className === 'lower') {
        if (Number(quantityNum.textContent) > 1) {
          quantityNum.textContent = Number(quantityNum.textContent) - 1;
          cartListQuantity.forEach(cartProduct => {
            if (cartProduct.dataId === cartListData[index].id) {
              cartProduct.quantity--;
              cartListData[index].quantity--;
            } else return;
          });
        }
        db.firestore()
          .collection('customersUser')
          .doc(user.uid)
          .update({ cartList: cartListQuantity });
        totalPrice.textContent = `NT$ ${productPrice * Number(quantityNum.textContent)}`;
        orderListHandler(cartListData);
      }
      if (e && (e.target.nodeName === 'I' || e.target.className === 'delete')) {
        if (confirm(`確定刪除${productName}嗎？`)) {
          cartListLi.remove();
          cartListQuantity.splice(index, 1);
          cartListData.splice(index, 1);
          let test = cartListContent.getElementsByTagName('li');
          if (!cartListQuantity.length) {
            document.querySelector('.checkout').classList.remove('checkout_btn_allow');
          }
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .update({ cartList: cartListQuantity });
          orderListHandler(cartListData);
        } else {
          return;
        }
      }
    }
  }
  function orderListHandler(cartListData) {
    let subtotal = document.querySelector('.subtotal');
    let shippingRate = document.querySelector('.shipping_rate');
    let total = document.querySelector('.total');
    let shippingRateMoney = 300;
    let totalProductPrice = 0;
    cartListData.forEach(data => {
      totalProductPrice += data.price.discount * data.quantity;
    });
    function commaHandle(num) {
      //參考https://dotblogs.com.tw/alenwu_coding_blog/2017/08/11/js_number_to_currency_comma
      let parts = num.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    let totalPrice = commaHandle(String(totalProductPrice + shippingRateMoney));
    subtotal.textContent = `NT$ ${commaHandle(String(totalProductPrice))}`;
    shippingRate.textContent = `NT$ ${shippingRateMoney}`;
    total.textContent = `NT$ ${totalPrice}`;
  }
})();

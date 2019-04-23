(function() {
  let db = firebase;
  let checkoutForm = document.getElementById('checkout_form');
  let main = document.querySelector('main');
  // let loading = document.querySelector('.loading_modal');
  let nextBtn = document.querySelector('.next_btn');
  let orderData = {
    cartListData: [],
    price: {
      shippingRate: 0,
      totalPrice: 0
    },
    shipping: {
      name: {
        firstName: '',
        lastName: ''
      },
      phone: '',
      address: {
        zipCode: '',
        county: '',
        district: '',
        other: ''
      }
    },
    receipt: {
      forMail: {
        address: {
          zipCode: '',
          county: '',
          district: '',
          other: ''
        }
      },
      CUI: {
        email: '',
        number: ''
      }
    }
  };
  window.addEventListener('load', () => {
    if (document.querySelector('.full_address'))
      new TwCitySelector({
        el: '.full_address',
        elCounty: '#county',
        elDistrict: '#district',
        hasZipcode: true,
        standardWords: true,
        hiddenZipcode: true
      });
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
        orderData.cartListData = cartListData;
        // orderListHandler(cartListData);
        // main.style.visibility = 'visible';
        // loading.style.display = 'none';
      });
  }

  // window.addEventListener('beforeunload', e => {
  //   e.returnValue = '確定離開當前頁面嗎？';
  // });
  //訂單摘要
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

    //購物清單
    let shoppingListContent = document.querySelector('#shopping_list_content');
    cartListData.forEach(data => {
      let newLi = document.createElement('li');
      newLi.classList.add('order_list');
      newLi.innerHTML = `<div
        class="order_list_img"
        style="background-image:url(${data.imgList[0].src})"
      ></div>
      <div class="order_list_product_item">
        <p>${data.productName}（<span class="order_list_product_quantity">${data.quantity}</span>）</p>
        <span class="order_list_total_price">NT$ ${Number(data.price.discount) * data.quantity}</span>
      </div>`;
      shoppingListContent.appendChild(newLi);
    });
  }
  //各步驟AJAX
  function AJAXClickHandler(e) {
    let xhr = new XMLHttpRequest();
    if (e && e.target.id === 'next_btn') {
      if (e.target.parentNode.className === 'shipping') {
        let shippingData = orderData.shipping;
        if (
          shippingData.name.firstName === '' ||
          shippingData.name.lastName === '' ||
          shippingData.phone === '' ||
          shippingData.address.county === '' ||
          shippingData.address.district === '' ||
          shippingData.address.other === ''
        ) {
          shippingDataCondition(e, shippingData);
        } else {
          e.target.parentNode.querySelector('#name_error').textContent = '';
          xhr.open('GET', './checkoutStepTwo.html', true);
          xhr.send();
        }
      } else if (e.target.parentNode.parentNode.className === 'payment') {
        xhr.open('GET', './checkoutStepThree.html', true);
        xhr.send();
        if (document.querySelector('.full_address'))
          new TwCitySelector({
            el: '.full_address',
            elCounty: '#county',
            elDistrict: '#district',
            hasZipcode: true,
            standardWords: true,
            hiddenZipcode: true
          });
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          checkoutForm.innerHTML = xhr.responseText;
        }
      };
    } else if (e && e.target.id === 'back_btn') {
      if (e.target.parentNode.parentNode.className === 'payment') {
        xhr.open('GET', './checkoutStepOne.html', true);
        xhr.send();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            checkoutForm.innerHTML = xhr.responseText;
            let addressSelect = new TwCitySelector({
              el: '.full_address',
              elCounty: '#county',
              elDistrict: '#district',
              hasZipcode: true,
              standardWords: true,
              hiddenZipcode: true
            });
          }
        };
      } else if (e.target.parentNode.parentNode.className === 'receipt') {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            checkoutForm.innerHTML = xhr.responseText;
          }
        };
        xhr.open('GET', './checkoutStepTwo.html', true);
        xhr.send();
      }
    }
    function shippingDataCondition(e, shippingData) {
      if (shippingData.name.firstName === '') {
        e.target.parentNode.querySelector('#firstName').classList.add('errorActive');
        e.target.parentNode.querySelector('#name_error').textContent = '請輸入姓名';
      }
      if (shippingData.name.lastName === '') {
        e.target.parentNode.querySelector('#lastName').classList.add('errorActive');
        e.target.parentNode.querySelector('#name_error').textContent = '請輸入姓名';
      }
      if (shippingData.phone === '') {
        e.target.parentNode.querySelector('#phone').classList.add('errorActive');
        e.target.parentNode.querySelector('#phone_error').textContent = '請輸入電話';
      }
      if (
        shippingData.address.county === '' ||
        shippingData.address.district === '' ||
        shippingData.address.other === ''
      ) {
        e.target.parentNode.querySelector('#address_error').textContent = '請輸入完整地址';
      }
      if (shippingData.address.county === '') {
        e.target.parentNode.querySelector('#county').classList.add('errorActive');
      }
      if (shippingData.address.district === '') {
        e.target.parentNode.querySelector('#district').classList.add('errorActive');
      }
      if (shippingData.address.other === '') {
        e.target.parentNode.querySelector('#address').classList.add('errorActive');
      }
    }
  }
  checkoutForm.addEventListener('click', AJAXClickHandler);

  //運送
  let shippingContent = document.querySelector('.shipping');
  function shippingChangeHandler(e) {
    let shippingData = orderData.shipping;
    if (e && e.target.parentNode.className === 'name') {
      let dataName = shippingData.name;
      if (e.target.id === 'firstName') dataName.firstName = e.target.value;
      else if (e.target.id === 'lastName') dataName.lastName = e.target.value;
      if (dataName.firstName !== '' && dataName.lastName !== '')
        e.target.parentNode.querySelector('#name_error').textContent = '';
      if (dataName.firstName !== '') e.target.classList.remove('errorActive');
      if (dataName.firstName !== '') e.target.classList.remove('errorActive');
    } else if (e && e.target.id === 'phone') {
      shippingData.phone = e.target.value;
      if (shippingData.phone !== '') {
        e.target.classList.remove('errorActive');
        e.target.parentNode.querySelector('#phone_error').textContent = '';
      }
    } else if (e && e.target.parentNode.className === 'full_address') {
      switch (e.target.id) {
        case 'county':
          shippingData.address.county = e.target.value;
          break;
        case 'district':
          shippingData.address.district = e.target.value;
          shippingData.address.zipCode = e.target.parentNode.children[4].value;
          break;
        case 'address':
          shippingData.address.other = e.target.value;
          break;
      }
      if (
        shippingData.address.county !== '' &&
        shippingData.address.district !== '' &&
        shippingData.address.other !== ''
      ) {
        e.target.parentNode.querySelector('#address_error').textContent = '';
      }
      if (shippingData.address.county !== '') {
        e.target.classList.remove('errorActive');
      }
      if (shippingData.address.district !== '') {
        e.target.classList.remove('errorActive');
      }
      if (shippingData.address.other !== '') {
        e.target.classList.remove('errorActive');
      }
    }
    console.log(shippingData);
  }
  if (shippingContent) {
    shippingContent.addEventListener('change', shippingChangeHandler);
  }
})();

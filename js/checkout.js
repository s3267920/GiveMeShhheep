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
    payment: {
      creditCartNum: {
        one: '',
        two: '',
        three: '',
        four: '',
        all: ''
      },
      creditName: {
        firstName: '',
        lastName: ''
      },
      expiration: {
        month: '',
        year: ''
      },
      safeNum: ''
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
  // window.addEventListener('load', () => {
  //   db.auth().onAuthStateChanged(user => {
  //     if (!user) {
  //       return (location.href = '../html/login.html');
  //     }
  //     if (user) {
  //       db.firestore()
  //         .collection('customersUser')
  //         .doc(user.uid)
  //         .get()
  //         .then(doc => {
  //           if (doc.data().cartList) {
  //             cartProduct = doc.data().cartList || [];
  //           } else {
  //             db.firestore()
  //               .collection('customersUser')
  //               .doc(user.uid)
  //               .update({ cartList: cartProduct });
  //           }
  //           getProductData(cartProduct);
  //         });
  //     } else {
  //       cartStore.textContent = cartProduct.length;
  //       getProductData(cartProduct);
  //     }
  //   });
  // });
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
          shippingErrorCondition(e, shippingData);
        } else {
          alert('結帳部分無串連金流，也不會存信用卡卡號');
          xhr.open('GET', './checkoutStepTwo.html', true);
          xhr.send();
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
              checkoutForm.innerHTML = xhr.responseText;
            }
          };
        }
      } else if (e.target.parentNode.parentNode.className === 'payment') {
        let paymentData = orderData.payment;
        if (
          paymentData.creditCartNum.all.length < 16 ||
          paymentData.creditName.firstName === '' ||
          paymentData.creditName.lastName === '' ||
          paymentData.expiration.month === '' ||
          paymentData.expiration.year === '' ||
          paymentData.safeNum === ''
        ) {
          paymentErrorCondition(e, paymentData);
        } else {
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
      }
    } else if (e && e.target.id === 'back_btn') {
      if (e.target.parentNode.parentNode.className === 'payment') {
        xhr.open('GET', './checkoutStepOne.html', true);
        xhr.send();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            checkoutForm.innerHTML = xhr.responseText;
            let shippingContent = document.querySelector('.shipping');
            shippingContent.addEventListener('change', shippingChangeHandler);
            document.querySelector('#phone').addEventListener('keydown', numberHandler);
            new TwCitySelector({
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
    function shippingErrorCondition(e, shippingData) {
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
    function paymentErrorCondition(e, paymentData) {
      //信用卡卡號驗證
      if (paymentData.creditCartNum.all.length < 16) {
        e.target.parentNode.parentNode.querySelector('.credit_num').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '請輸入完整的信用卡卡號';
      } else if (paymentData.creditCartNum.all.length === 16) {
        if (!creditCardVerify(paymentData.creditCartNum.all)) {
          e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '信用卡錯誤';
        }
      }
      //姓名
      if (paymentData.creditName.firstName === '') {
        e.target.parentNode.parentNode.querySelector('#firstName').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#name_error').textContent = '請輸入姓名';
      }
      if (paymentData.creditName.lastName === '') {
        e.target.parentNode.parentNode.querySelector('#lastName').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#name_error').textContent = '請輸入姓名';
      }
      //有效期限
      if (paymentData.expiration.month === '') {
        e.target.parentNode.parentNode.querySelector('#expiration_month').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#expiration_error').textContent = '請選擇有效期限';
      }
      if (paymentData.expiration.year === '') {
        e.target.parentNode.parentNode.querySelector('#expiration_year').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#expiration_error').textContent = '請選擇有效期限';
      }
      //安全碼
      if (paymentData.safeNum === '') {
        e.target.parentNode.parentNode.querySelector('#safe_num').classList.add('errorActive');
        e.target.parentNode.parentNode.querySelector('#safe_num_error').textContent = '請輸入安全碼';
      }
    }
  }

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
          shippingData.address.zipCode = e.target.parentNode.parentNode.querySelector('.zipcode').value;
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
  }

  //付款
  let paymentContent = document.querySelector('.payment');
  function paymentChangeHandler(e) {
    let paymentData = orderData.payment;
    if (e && e.target.parentNode.className === 'credit_num') {
      let creditCart = paymentData.creditCartNum;
      if (e.target.id === 'credit_num_one') {
        creditCart.one = e.target.value;
        let JCBVerifyVerify = number => {
          let numberSplice = number.substr(0, 3);
          let JCBConditionOne = /^1800/;
          let JCBConditionTwo = /^2131/;
          let JCBConditionThree = /^3\d\d/;
          if (JCBConditionOne.test(number) || JCBConditionTwo.test(number) || JCBConditionThree.test(numberSplice))
            return true;
          else return false;
        };
        if (!/^4/.test(e.target.value) && !/^5[1~5]/.test(e.target.value) && !JCBVerifyVerify(e.target.value)) {
          e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '不支援此卡';
        } else {
          e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '';
        }
      }
      if (e && e.target.parentNode.className === 'credit_num') {
        console.log(creditCart.all);
        if (creditCart.all.length >= 16 && !creditCardVerify(creditCart.all)) {
          e.target.parentNode.parentNode.querySelector('.credit_num').classList.add('errorActive');
          e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '信用卡錯誤';
          console.log('no:' + creditCart.all);
        }
      }
    } else if (e && e.target.parentNode.className === 'personal_name') {
      if (e.target.id === 'firstName') paymentData.creditName.firstName = e.target.value;
      if (e.target.id === 'lastName') paymentData.creditName.lastName = e.target.value;
    } else if (e && e.target.parentNode.className === 'expiration') {
      if (e.target.id === 'expiration_month') {
        paymentData.expiration.month = e.target.value;
      } else if (e.target.id === 'expiration_year') {
        paymentData.expiration.year = e.target.value;
      }
    } else if (e && e.target.id === 'safe_num') {
      paymentData.safeNum = e.target.value;
    }
  }
  function expirationRender() {
    let expirationYear = document.querySelector('#expiration_year');
    let startYear = new Date().getFullYear();
    let endYear = startYear + 10;
    for (let i = startYear; i <= endYear; i++) {
      let newOption = document.createElement('option');
      newOption.setAttribute('value', i);
      newOption.textContent = i + '年';
      expirationYear.appendChild(newOption);
    }

    let expirationMonth = document.querySelector('#expiration_month');
    for (let i = 1; i <= 12; i++) {
      let newOption = document.createElement('option');
      newOption.setAttribute('value', i);
      newOption.textContent = i + '月';
      expirationMonth.appendChild(newOption);
    }
  }
  //限制只能數字輸入
  function numberHandler(e) {
    if (!isNumber(e.keyCode)) {
      e.returnValue = false;
    }
    function isNumber(keyCode) {
      if (
        (48 <= keyCode && keyCode <= 57) ||
        (keyCode === 8 || keyCode === 46 || keyCode === 37 || keyCode === 39 || keyCode === 9)
      )
        return true;
      return false;
    }
  }

  //信用卡輸入事件
  function creditCardNumInputHandler(e) {
    let creditCartNum = orderData.payment.creditCartNum;
    switch (e.target.id) {
      case 'credit_num_one':
        creditCartNum.one = e.target.value;
        break;
      case 'credit_num_two':
        creditCartNum.two = e.target.value;
        break;
      case 'credit_num_three':
        creditCartNum.three = e.target.value;
        break;
      case 'credit_num_four':
        creditCartNum.four = e.target.value;
        break;
    }
    creditCartNum.all = creditCartNum.one + creditCartNum.two + creditCartNum.three + creditCartNum.four;
    if (creditCardVerify(creditCartNum.all)) {
      e.target.parentNode.parentNode.querySelector('#credit_num_error').textContent = '';
      e.target.parentNode.parentNode.querySelector('.credit_num').classList.remove('errorActive');
    }
  }
  //信用卡類型
  function creditCardTypeHandler(e) {
    {
      let JCBVerifyVerify = number => {
        let numberSplice = number.substr(0, 3);
        let JCBConditionOne = /^1800/;
        let JCBConditionTwo = /^2131/;
        let JCBConditionThree = /^3\d\d/;
        if (JCBConditionOne.test(number) || JCBConditionTwo.test(number) || JCBConditionThree.test(numberSplice))
          return true;
        else return false;
      };
      if (e && e.target.id === 'credit_num_one') {
        if (/^4/.test(e.target.value)) {
          e.target.parentNode.querySelector('.credit_card_icon_default').style.display = 'none';
          e.target.parentNode.querySelector('.visa').style.display = 'flex';
        } else if (/^5[1~5]/.test(e.target.value)) {
          e.target.parentNode.querySelector('.credit_card_icon_default').style.display = 'none';
          e.target.parentNode.querySelector('.mastercard').style.display = 'flex';
        } else if (JCBVerifyVerify(e.target.value)) {
          e.target.parentNode.querySelector('.credit_card_icon_default').style.display = 'none';
          e.target.parentNode.querySelector('.jcb').style.display = 'flex';
        } else {
          e.target.parentNode.querySelector('.credit_card_icon_default').style.display = 'flex';
          e.target.parentNode.querySelector('.mastercard').style.display = 'none';
          e.target.parentNode.querySelector('.visa').style.display = 'none';
          e.target.parentNode.querySelector('.jcb').style.display = 'none';
        }
      }
    }
  }
  //信用卡是否合法驗證
  function creditCardVerify(creditCartNum) {
    let visaVerify = number => {
      let visaCondition = /^4/;
      return visaCondition.test(number);
    };
    let masterCardVerify = number => {
      let numberSplice = number.substr(0, 2);
      let masterCardCondition = /^5[1~5]/;
      return masterCardCondition.test(numberSplice);
    };
    let JCBVerifyVerify = number => {
      let numberSplice = number.substr(0, 3);
      let JCBConditionOne = /^1800/;
      let JCBConditionTwo = /^2131/;
      let JCBConditionThree = /^3\d\d/;
      if (JCBConditionOne.test(number) || JCBConditionTwo.test(number) || JCBConditionThree.test(numberSplice))
        return true;
      else return false;
    };
    if (visaVerify(creditCartNum) || masterCardVerify(creditCartNum) || JCBVerifyVerify(creditCartNum)) {
      let numberToArray = creditCartNum.split('');
      let odd = [];
      let even = [];
      //奇數位置部分
      for (let i = 0; i < numberToArray.length; i = i + 2) odd.push(Number(numberToArray[i]) * 2);

      //偶數位置部分
      for (let j = 1; j < numberToArray.length; j = j + 2) even.push(numberToArray[j]);

      let oddSplit = odd.join('').split('');
      let allNumber = even.concat(oddSplit);
      let total = allNumber.reduce((oldNum, num) => {
        return Number(oldNum) + Number(num);
      });
      if (total % 10 !== 0) {
        return false;
      } else {
        return true;
      }
    } else return false;
  }

  //發票
  let receiptContent = document.querySelector('.receipt');

  if (shippingContent) {
    shippingContent.addEventListener('change', shippingChangeHandler);
    document.querySelector('#phone').addEventListener('keydown', numberHandler);
    if (document.querySelector('.full_address'))
      new TwCitySelector({
        el: '.full_address',
        elCounty: '#county',
        elDistrict: '#district',
        hasZipcode: true,
        standardWords: true,
        hiddenZipcode: true
      });
  } else if (paymentContent) {
    document.querySelector('.credit_num').addEventListener('keydown', numberHandler);
    document.querySelector('.credit_num').addEventListener('input', creditCardTypeHandler);
    document.querySelector('.credit_num').addEventListener('input', creditCardNumInputHandler);
    document.querySelector('#safe_num').addEventListener('keydown', numberHandler);
    paymentContent.addEventListener('change', paymentChangeHandler);
    expirationRender();
  } else if (receiptContent) {
  }
  checkoutForm.addEventListener('click', AJAXClickHandler);
})();

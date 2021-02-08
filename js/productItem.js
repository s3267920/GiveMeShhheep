(function () {
  const db = firebase;
  let main = document.querySelector('main');
  let loading = document.querySelector('.loading_modal');
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  window.addEventListener('load', () => {
    db.auth().onAuthStateChanged((user) => {
      if (user) {
        db.firestore()
          .collection('customersUser')
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.data().cartList) {
              cartProduct = doc.data().cartList || [];
            } else {
              db.firestore().collection('customersUser').doc(user.uid).update({ cartList: cartProduct });
            }
          });
      } else {
        cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
      }
      getProductItem();
    });
  });
  function getProductItem() {
    db.firestore()
      .collection('user')
      .doc('lEhSHeJpNKf6h58s7t2q5URBgDm2')
      .collection('product')
      .doc(getUrlParams())
      .get()
      .then((data) => {
        const productData = {
          id: data.id,
          imgList: data.data().imgList,
          series: data.data().series,
          productName: data.data().productName,
          discription: data.data().discription,
          tag: data.data().tag,
          price: {
            original: data.data().price.original,
            discount: data.data().price.discount
          },
          specification: data.data().specification,
          status: data.data().status
        };
        document.title = data.data().productName;
        productDataHandler(productData);
        loading.style.display = 'none';
        main.style.visibility = 'visible';
      });
  }
  function getUrlParams() {
    let currentUrl = window.location.href;
    if (/\?/g.test(currentUrl)) {
      return currentUrl.split('?id=')[1];
    }
  }
  function productDataHandler(data) {
    let productImg = document.querySelector('.product_img');
    let productImgBox = document.querySelector('.product_img_box');
    let productImgIcon = document.querySelectorAll('.product_img_icon');
    let productName = document.querySelector('.product_name');
    let productPriceSpan = document.querySelector('.product_price span');
    let productInventorySpan = document.querySelector('.product_inventory span');
    let productDiscription = document.querySelectorAll('.product_discription p')[1];
    if (data.imgList.length === 1) {
      productImgIcon[0].style.display = 'none';
      productImgIcon[1].style.display = 'none';
    } else {
      productImgBox.addEventListener('click', productImgToggleHandler);
    }
    productImg.style.backgroundImage = `url(${data.imgList[0].src})`;
    productName.textContent = data.productName;
    productPriceSpan.textContent = data.price.discount;
    productInventorySpan.textContent = data.specification[0].styleInfo[0].inventory;
    productDiscription.textContent = data.discription;
    function productImgToggleHandler(e) {
      let imgIndex = Number(productImg.dataset.imgindex);
      if (e.target.id === 'leftBtn' || e.target.className.includes('left_icon')) {
        if (imgIndex - 1 < 0) {
          productImg.style.backgroundImage = `url(${data.imgList[data.imgList.length - 1].src})`;
          productImg.setAttribute('data-imgindex', data.imgList.length - 1);
        } else {
          productImg.style.backgroundImage = `url(${data.imgList[imgIndex - 1].src})`;
          productImg.setAttribute('data-imgindex', imgIndex - 1);
        }
      }
      if (e.target.id === 'rightBtn' || e.target.className.includes('right_icon')) {
        if (imgIndex + 1 === data.imgList.length) {
          productImg.style.backgroundImage = `url(${data.imgList[0].src})`;
          productImg.setAttribute('data-imgindex', 0);
        } else {
          productImg.style.backgroundImage = `url(${data.imgList[imgIndex + 1].src})`;
          productImg.setAttribute('data-imgindex', imgIndex + 1);
        }
      }
    }
    //add btn
    let productContent = document.querySelector('.product_content');
    productContent.addEventListener('click', productContentClickHandler);
    let quantity = 1;
    function productContentClickHandler(e) {
      let quantityNum = document.querySelector('.quantity_num');
      const user = db.auth().currentUser;
      if (e.target.id === 'lower') {
        if (quantity === 1) {
          return;
        } else {
          quantity = quantity - 1;
        }
        quantityNum.textContent = quantity;
      }
      if (e.target.id === 'add') {
        quantity = quantity + 1;
        quantityNum.textContent = quantity;
      }
      if (e.target.className === 'add_btn') {
        if (user) {
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .get()
            .then((doc) => {
              if (doc.data().cartList) {
                cartProduct = doc.data().cartList || [];
              } else {
                db.firestore().collection('customersUser').doc(user.uid).update({ cartList: cartProduct });
              }
              addProductHandler(cartProduct);
            });
        } else {
          cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
          addProductHandler(cartProduct);
        }
        function localStorageCartProductData(data) {
          let cartProductListToString = JSON.stringify(data);
          localStorage.setItem('cartList', cartProductListToString);
        }
        function addProductHandler(cartProduct) {
          //如果點選同一樣的話只累加數量
          let isRepeat = () => {
            return cartProduct.some((compareData) => {
              return compareData.dataId === data.id;
            });
          };
          if (!cartProduct.length || isRepeat() === false) {
            cartProduct.push({
              dataId: data.id,
              quantity: quantity
            });
          } else {
            cartProduct.forEach((cartProduct) => {
              if (cartProduct.dataId === data.id) cartProduct.quantity = cartProduct.quantity + quantity;
              else return;
            });
          }
          if (user) {
            db.firestore().collection('customersUser').doc(user.uid).update({ cartList: cartProduct });
          }
          let cartStore = document.getElementById('cart_store');
          let fixedCartStore = document.getElementById('fixed_cart_store');
          cartStore.textContent = cartProduct.length;
          fixedCartStore.textContent = cartProduct.length;
          localStorageCartProductData(cartProduct);
        }
      }
    }
  }
})();

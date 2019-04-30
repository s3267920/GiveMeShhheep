(function() {
  //firebase init
  let config = {
    apiKey: 'AIzaSyCSb1bfu4cMXGkW15bxOa17RQTsiB9DbT4',
    authDomain: 'givemeshhheep.firebaseapp.com',
    databaseURL: 'https://givemeshhheep.firebaseio.com',
    projectId: 'givemeshhheep'
  };
  firebase.initializeApp(config);
  let db = firebase;
  let cartStore = document.getElementById('cart_store');
  let fixedCartStore = document.getElementById('fixed_cart_store');
  let hamburgerNav = document.querySelector('.nav_hamburger');
  let navBar = document.querySelector('#nav_bar');
  let signOut = document.querySelector('.sign_out');
  let userIcon = document.querySelector('.user');
  let header = document.querySelector('header');
  let main = document.querySelector('main');
  let loading = document.querySelector('.loading_modal');
  if (loading) {
    loading.style.display = 'flex';
  }
  main.style.visibility = 'hidden';
  window.addEventListener('load', () => {
    let headerHeight = header.offsetHeight / 2;
    window.addEventListener('scroll', () => {
      let windowScrollTop = window.pageYOffset;
      if (windowScrollTop > headerHeight) {
        header.classList.add('fixed_status');
        document.body.style.setProperty('padding-top', `${headerHeight * 2}px`);
      } else {
        header.classList.remove('fixed_status');
        document.body.style.setProperty('padding-top', `0px`);
      }
      // let orderListTitle = document.querySelector('.order_list_title');
      // let orderListTitleTop = orderListTitle.getBoundingClientRect().top;
      // if (orderListTitle && orderListTitleTop !== 0) {
      //   //參考https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
      //   //https://segmentfault.com/a/1190000007687940

      //   if (windowScrollTop > headerHeight) {
      //     header.classList.add('fixed_status');
      //     document.body.style.setProperty('padding-top', `${headerHeight * 2}px`);
      //   } else {
      //     header.classList.remove('fixed_status');
      //     document.body.style.setProperty('padding-top', `0px`);
      //   }
      //   if (windowScrollTop > headerHeight * 2) {
      //     orderListTitle.classList.add('order_list_fixed_status');
      //     document.body.style.setProperty('padding-top', `${headerHeight * 2 + orderListTitleTop}px`);
      //   } else {
      //     orderListTitle.classList.remove('order_list_fixed_status');
      //   }
      // }
    });
    db.auth().onAuthStateChanged(user => {
      let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
      if (user) {
        userIcon.classList.add('loginStatus');
        signOut.style.display = 'flex';
        db.firestore()
          .collection('customersUser')
          .doc(user.uid)
          .get()
          .then(doc => {
            if (doc.data().cartList) {
              cartProduct = doc.data().cartList || [];
              if (fixedCartStore) {
                fixedCartStore.textContent = cartProduct.length;
              }
              cartStore.textContent = cartProduct.length;
            } else {
              db.firestore()
                .collection('customersUser')
                .doc(user.uid)
                .update({ cartList: cartProduct });
            }
          });
      } else {
        if (signOut) {
          signOut.style.display = 'none';
        }
        if (fixedCartStore) {
          fixedCartStore.textContent = cartProduct.length;
        }
        cartStore.textContent = cartProduct.length;
      }
      let cart = document.querySelector('.cart');
      let fixedCart = document.querySelector('.fixed_cart');
      let personal = document.querySelector('.personal');
      if (fixedCart) {
        fixedCart.addEventListener('click', e => {
          if (user) {
            location.href = '../html/cart.html';
          } else {
            location.href = '../html/login.html';
          }
        });
      }
      personal.addEventListener('click', e => {
        if (e && (e.target.parentNode.id === 'user' || e.target.parentNode.className === 'personal')) {
          if (user) {
            location.href = '/html/order.html';
          } else {
            location.href = '/html/login.html';
          }
        }
        if (e && (e.target.parentNode.id === 'cart' || e.target.id === 'cart_icon')) {
          if (user) {
            location.href = '/html/cart.html';
          } else {
            location.href = '/html/login.html';
          }
        }
      });
    });
    hamburgerNav.addEventListener('click', e => {
      if (e.target && e.target.className === 'icon_bar') {
        navBar.style.display === 'flex' ? (navBar.style.display = 'none') : (navBar.style.display = 'flex');
      }
    });
  });
  if (signOut) {
    function signOutHandler() {
      firebase
        .auth()
        .signOut()
        .then(function() {
          location.href = '../index.html';
        })
        .catch(function(error) {
          console.error(error);
        });
    }
    signOut.addEventListener('click', signOutHandler);
  }
})();

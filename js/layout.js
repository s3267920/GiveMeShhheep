(function() {
  let hamburgerNav = document.querySelector('.nav_hamburger');
  let navBar = document.querySelector('#nav_bar');
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  let cartStore = document.getElementById('cart_store');
  let fixedCartStore = document.getElementById('fixed_cart_store');
  cartStore.textContent = cartProduct.length;
  fixedCartStore.textContent = cartProduct.length;
  //監聽
  function watch() {
    hamburgerNav.addEventListener('click', e => {
      if (e.target && e.target.className === 'icon_bar') {
        navBar.style.display === 'flex' ? (navBar.style.display = 'none') : (navBar.style.display = 'flex');
      }
    });
  }
  watch();
})();

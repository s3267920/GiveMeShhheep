(function() {
  let checkoutForm = document.getElementById('checkout_form');
  let nextBtn = document.querySelector('.next_btn');
  nextBtn.addEventListener('click', e => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        checkoutForm.innerHTML = xhr.responseText;
      }
    };
    xhr.open('GET', './checkoutStepTwo.html', true);
    xhr.send();
  });
})();

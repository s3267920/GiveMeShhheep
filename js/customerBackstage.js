(function() {
  let db = firebase;
  let allOrdersSlide = document.querySelector('.item_toggle');
  let main = document.querySelector('main');
  let allOrderItem = document.querySelector('.all_order_item');
  window.addEventListener('load', e => {
    allOrdersSlide.addEventListener('click', OrderSlideBtnHandler);
    allOrderItem.addEventListener('click', allOrderItemClickHandler);
    db.auth().onAuthStateChanged(user => {
      if (user) {
        let currentUrl = window.location.href;
        console.log();
        if (/order.html/.test(currentUrl)) {
          let orderData = [];
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .collection('order')
            .get()
            .then(data => {
              data.forEach(doc => {
                let newData = {
                  id: doc.id,
                  cartListData: doc.data().cartListData,
                  orderDate: doc.data().orderDate,
                  price: doc.data().price,
                  status: doc.data().status
                };
                orderData.push(newData);
              });
              let filterData = orderData.filter(data => {
                if (getOrderUrlParams() === 'all') {
                  return data;
                } else {
                  return (
                    getOrderUrlParams()
                      .split('_')
                      .join(' ') === data.status
                  );
                }
              });
              orderListRender(filterData);
            });
        }
        if (/userInformation.html/.test(currentUrl)) {
        }
      } else {
        location.href = '../html/login.html';
      }
    });
  });
  function OrderSlideBtnHandler(e) {
    if (e.target.id === 'left_btn' || e.target.id === 'left_icon') {
      main.querySelector('nav').classList.add('all_order_item_slide');
      main.querySelector('#left_btn').style.display = 'none';
      main.querySelector('#right_btn').style.display = 'block';
    }
    if (e.target.id === 'right_btn' || e.target.id === 'right_icon') {
      main.querySelector('nav').classList.remove('all_order_item_slide');
      main.querySelector('#left_btn').style.display = 'block';
      main.querySelector('#right_btn').style.display = 'none';
    }
  }
  function allOrderItemClickHandler(e) {
    if (e.target.id === 'order_done') {
      addOrderUrlParams('done');
    }
    if (e.target.id === 'order_in_progress') {
      addOrderUrlParams('in_progress');
    }
  }
  //參考https://blog.csdn.net/zuo_hy/article/details/44345531
  function addOrderUrlParams(status) {
    if (status === 'in_progress') {
      location.href = '../html/order.html?status=in_progress';
    }
    if (status === 'done') {
      location.href = '../html/order.html?status=done';
    }
  }
  function getOrderUrlParams() {
    let currentUrl = window.location.href;
    if (/\?/g.test(currentUrl)) {
      return currentUrl.split('?status=')[1];
    } else {
      return 'all';
    }
  }
  function orderListRender(orderData) {
    let orderListContent = document.querySelector('.order_list_content');
    let content = '';
    for (let i = 0; i < orderData.length; i++) {
      let newLi = document.createElement('li');
      let newDate = new Date(orderData[i].orderDate.seconds * 1000);
      let date = `${newDate.getFullYear()} 年 ${newDate.getMonth() + 1} 月 ${newDate.getDate()}日`;
      content = `
      <div class="order_list_item_head">
        <div class="order_date">${date}</div>
        <div class="order_id">訂單編號：<span>${orderData[i].id}</span></div>
      </div>
      <div class="order_list_item_body">
        <ul class="order_list_item">
        </ul>
        <div class="order_list_item_Info">
          <div class="order_status">${orderData[i].status === 'done' ? '已完成' : '進行中'}</div>
          <div class="order_total_price">
          <p class="order_shipping_rate">運費：NT$ <span>${orderData[i].price.shippingRate}</span></p>
          <p>總金額：NT$ <span>${orderData[i].price.totalPrice + orderData[i].price.shippingRate}</span></p></div>
        </div>
      </div>
    `;
      newLi.innerHTML = content;
      orderListContent.appendChild(newLi);
      let orderListItem = document.getElementsByClassName('order_list_item');
      orderData[i].cartListData.forEach(data => {
        let newLi = document.createElement('li');
        newLi.innerHTML = ` <div
            class="order_list_img"
            style="background-image:url(${data.imgList[0].src})"
          /></div>
          <div class="order_list_product_info">
            <p class="order_list_product_name">${data.productName}</p>
            <p class="order_list_product_quantity">${data.quantity}</p>
            <span class="order_list_product_price">NT$ ${Number(data.price.discount) * data.quantity}</span>
          </div>`;
        orderListItem[i].appendChild(newLi);
      });
    }
  }
})();

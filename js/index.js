(function() {
  //firebase init
  let config = {
    apiKey: 'AIzaSyCSb1bfu4cMXGkW15bxOa17RQTsiB9DbT4',
    authDomain: 'givemeshhheep.firebaseapp.com',
    databaseURL: 'https://givemeshhheep.firebaseio.com',
    projectId: 'givemeshhheep'
  };
  firebase.initializeApp(config);
  let db = firebase.firestore();

  //banner
  function bannerHandler() {
    let bannerToggleItem = document.querySelector('.banner_img_toggle_box');
    let bannerImgToggleIcon = document.querySelector('.banner_img_toggle_icon');
    let banner = document.querySelector('.banner');
    let bannerImg = [
      'https://images.unsplash.com/photo-1510083065545-d2d4e6193747?w=1050',
      'https://images.unsplash.com/photo-1513890333407-6f85205e8ef2?w=1050',
      'https://images.unsplash.com/photo-1520714233112-577aaa92c516?w=1050',
      'https://images.unsplash.com/photo-1512973884349-7ec5e61bd7de?w=1050'
    ];
    bannerImg.forEach((el, index) => {
      let newSpan = document.createElement('span');
      newSpan.setAttribute('data-index', index);
      newSpan.textContent = index + 1;
      bannerToggleItem.appendChild(newSpan);
      let newImg = document.createElement('img');
      newImg.setAttribute('src', bannerImg[index]);
      newImg.classList.add('banner_img');
      banner.appendChild(newImg);
    });
    let bannerImgList = document.querySelectorAll('.banner_img');
    let currentImg = 0,
      nextImg = currentImg + 1,
      preImg = currentImg - 1;
    end = bannerImg.length - 1;
    //

    let bannerScope = () => {
      if (currentImg === end) currentImg = 0;
      else currentImg = currentImg + 1;
      if (nextImg === end) nextImg = 0;
      else nextImg = currentImg + 1;
      bannerImgList.forEach((el, index) => {
        el.classList.remove('bannerImgPauseFadeIn');
        if (index === currentImg) {
          el.classList.add('bannerImgFadeIn');
        } else if (index === nextImg) {
          el.classList.add('next_img');
          el.classList.remove('bannerImgFadeIn');
        } else {
          el.classList.remove('bannerImgFadeIn');
          el.classList.remove('next_img');
        }
      });
    };
    let bannerScopeStart;
    window.addEventListener('load', e => {
      //初始先做一遍
      setTimeout(() => {
        bannerImgList[0].classList.add('bannerImgFadeIn');
        bannerImgList[1].classList.add('next_img');
      }, 0);
      bannerScopeStart = setInterval(bannerScope, 9000);
    });
    bannerToggleItem.addEventListener('click', e => {
      clearInterval(bannerScopeStart);
      let spanIndex = Number(e.target.dataset.index);
      if (e.target && e.target.nodeName === 'SPAN') {
        currentImg = spanIndex;
      }
      bannerImgList.forEach((el, index) => {
        if (index === currentImg) {
          el.classList.add('bannerImgPauseFadeIn');
        } else if (index === nextImg) {
          el.classList.add('next_img');
          el.classList.remove('bannerImgFadeIn');
          el.classList.remove('bannerImgPauseFadeIn');
        } else {
          el.classList.remove('bannerImgPauseFadeIn');
          el.classList.remove('bannerImgFadeIn');
          el.classList.remove('next_img');
        }
      });
    });
    bannerImgToggleIcon.addEventListener('click', e => {
      clearInterval(bannerScopeStart);
      if ((e.target && e.target.className === 'left_icon') || e.target.parentNode.className === 'left_icon') {
        currentImg <= 0 ? (currentImg = end) : (currentImg = currentImg - 1);
        preImg === 0 ? (preImg = end) : (preImg = currentImg - 1);
      } else if ((e.target && e.target.className === 'right_icon') || e.target.parentNode.className === 'right_icon') {
        currentImg >= end ? (currentImg = 0) : (currentImg = currentImg + 1);
        nextImg === end ? (nextImg = 0) : (nextImg = currentImg + 1);
      }
      bannerImgList.forEach((el, index) => {
        if (index === currentImg) {
          el.classList.add('bannerImgPauseFadeIn');
        } else if (index === preImg) {
          el.classList.add('next_img');
          el.classList.remove('bannerImgPauseFadeIn');
          el.classList.remove('bannerImgFadeIn');
        } else if (index === nextImg) {
          el.classList.add('next_img');
          el.classList.remove('bannerImgPauseFadeIn');
          el.classList.remove('bannerImgFadeIn');
        } else {
          el.classList.remove('bannerImgPauseFadeIn');
          el.classList.remove('bannerImgFadeIn');
          el.classList.remove('next_img');
        }
      });
    });
  }
  bannerHandler();
  let newsContentTable = document.querySelector('.news_content_table');
  let newsContentTbody = newsContentTable.children[0];
  //banner card
  function bannerCardHandler() {
    let bannerCardList = document.getElementById('banner_card_list');
    bannerCardList.addEventListener('click', e => {
      let latestNewsContent = document.querySelector('#latest_news_content');
      let newProductContent = document.querySelector('#new_product_content');
      let ourStoryContent = document.querySelector('#our_story_content');
      let latestNewsCard = document.querySelector('#latest_news_card');
      let newProductCard = document.querySelector('#new_product_card');
      let ourStoryCard = document.querySelector('#our_story_card');
      if (
        (e.target && e.target.id === 'latest_news_card') ||
        (e.target.nodeName === 'SPAN' && e.target.textContent === 'latest news')
      ) {
        newProductContent.style.display = 'none';
        ourStoryContent.style.display = 'none';
        latestNewsContent.style.display = 'flex';
        latestNewsCard.classList.add('on_card');
        newProductCard.classList.remove('on_card');
        ourStoryCard.classList.remove('on_card');
      } else if (
        (e.target && e.target.id === 'new_product_card') ||
        (e.target.nodeName === 'SPAN' && e.target.textContent === 'new product')
      ) {
        newProductContent.style.display = 'flex';
        ourStoryContent.style.display = 'none';
        latestNewsContent.style.display = 'none';
        latestNewsCard.classList.remove('on_card');
        newProductCard.classList.add('on_card');
        ourStoryCard.classList.remove('on_card');
      } else if (
        (e.target && e.target.id === 'our_story_card') ||
        (e.target.nodeName === 'SPAN' && e.target.textContent === 'our story')
      ) {
        newProductContent.style.display = 'none';
        ourStoryContent.style.display = 'block';
        latestNewsContent.style.display = 'none';
        latestNewsCard.classList.remove('on_card');
        newProductCard.classList.remove('on_card');
        ourStoryCard.classList.add('on_card');
      }
    });
  }
  bannerCardHandler();
  //最新消息
  function getNewsData() {
    let newsData = [];
    db.collection('news')
      .orderBy('index', 'asc')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const data = {
            id: doc.id,
            style: doc.data().style,
            title: doc.data().title,
            content: doc.data().content,
            date: doc.data().date,
            index: doc.data().index
          };
          newsData.push(data);
        });
        addNewsContent(newsData);
        newsModal(newsData);
      });
  }
  function addNewsContent(data) {
    let trContent = '';
    let liContent = '';
    //table
    for (let i = data.length - 1; i >= 0; i--) {
      let newTr = document.createElement('tr');
      let time = new Date(data[i].date.seconds * 1000);
      let currentDate = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
      trContent = `<td class="news_type ${styleColor(data[i].style)}">${data[i].style}</td>
    <td class="news_title_head"><a href="javascript:;" data-index='${data[i].index}'>${data[i].title}</a></td>
    <td class="news">
      ${data[i].content}
    </td>
    <td class="news_date">${currentDate}</td>`;
      newTr.innerHTML += trContent;
      newsContentTbody.appendChild(newTr);
    }
    let trList = document.getElementsByTagName('tr');
    for (let i = 1; i < trList.length; i++) {
      if (i % 2 === 0) {
        trList[i].classList.add('green_td');
      }
    }
    //div
    let newsContentUl = document.querySelector('.news_content');
    for (let i = 0; i < data.length; i++) {
      let time = new Date(data[i].date.seconds * 1000);
      let currentDate = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
      let newLi = document.createElement('li');
      liContent = `<div class="news_type ${styleColor(data[i].style)}">
      ${data[i].style}
  </div>
  <div class="news_title" data-index='${data[i].index}'>${data[i].title}</div>
  <div class="news">
    <p>${data[i].content.length > 100 ? data[i].content.slice(0, 100) + '...' : data[i].content}</p>
    <a href="javascript:;"  data-index='${data[i].index}' style="display:${
        data[i].content.length > 100 ? 'flex' : 'none'
      }">more</a>
  </div>
  <div class="news_date">${currentDate}</div>`;
      newLi.innerHTML += liContent;
      newsContentUl.appendChild(newLi);
    }
    newsContentUl.addEventListener('click', e => {
      let index = e.target.dataset.index;
      if (e.target && e.target.textContent === 'more') {
        e.target.parentNode.children[0].textContent = data[index].content;
        e.target.textContent = 'less';
      } else if (e.target && e.target.textContent === 'less') {
        e.target.parentNode.children[0].textContent = data[index].content.slice(0, 100) + '...';
        e.target.textContent = 'more';
      }
    });
  }
  function styleColor(style) {
    switch (style) {
      case '公告':
        return 'announcement';
        break;
      case '新品上市':
        return 'newListing';
        break;
      case '活動':
        return 'activity';
        break;
    }
  }
  function newsModal(data) {
    let newsModal = document.querySelector('.news_modal');
    let newsModalStyle = document.querySelector('.news_modal_style');
    let newsModalTitle = document.querySelector('.news_modal_title');
    let newsModalText = document.querySelector('.news_text');
    let newsModalDate = document.querySelector('.news_date >span');
    let close = document.querySelector('.close');
    newsContentTable.addEventListener('click', e => {
      let index = e.target.dataset.index;
      if (e.target && e.target.parentNode.className === 'news_title_head') {
        let time = new Date(data[index].date.seconds * 1000);
        let currentDate = `${time.getFullYear()}-${time.getMonth() +
          1}-${time.getDate()} ${time.getHours()}:${(time.getMinutes() < 9 ? '0' : '') + time.getMinutes()}`;
        newsModal.style.display = 'flex';
        newsModalStyle.textContent = data[index].style;
        newsModalTitle.textContent = data[index].title;
        let convertContent =
          '<p>' +
          data[index].content
            .slice(0)
            .split('</br>')
            .join('</p></br><p>') +
          '</p>';
        newsModalText.innerHTML = convertContent;

        newsModalDate.textContent = currentDate;
      }
    });
    close.addEventListener('click', e => {
      newsModal.style.display = 'none';
    });
  }
  getNewsData();
  //新品上市

  function getNewProducts() {
    let productData = [];
    db.collection('user')
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
            series: doc.data().series,
            productName: doc.data().productName,
            discription: doc.data().discription,
            tag: doc.data().tag,
            price: {
              original: doc.data().price.original,
              discount: doc.data().price.discount
            },
            specification: doc.data().specification,
            status: doc.data().status,
            productIndex: doc.data().productIndex
          };
          if (data.tag === '新品上市') {
            productData.push(data);
          }
        });
        newProductHandler(productData);
      });
  }
  let favoriteList = JSON.parse(localStorage.getItem('newProductsData')) || [];
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  function newProductHandler(data) {
    let newProductContent = document.querySelector('.new_product_content');
    let content = '';
    for (let i = 0; i < data.length; i++) {
      let newLi = document.createElement('li');
      let isFavorite = () => {
        return favoriteList.indexOf(data[i].id) !== -1;
      };
      content = `
      <div class="product_box">
        <div
          class="product_box_img"
          style="background-image:url(${data[i].imgList[0].src});"
        ></div>
          <div class="type_tag">
          ${data[i].tag}
          </div>
          <div class="favorite_icon">
            <a href="javascript:;" class="favorite_icon_off" style="display:${
              isFavorite() ? 'none' : 'flex'
            }"><i class="far fa-heart"></i></a>
            <a href="javascript:;" class="favorite_icon_on" style="display:${
              isFavorite() ? 'flex' : 'none'
            }"><i class="fas fa-heart"></i></a>
          </div>
        </div>
        <div class="product_box_item">
          <div class="product_box_name">
          ${data[i].productName}
          </div>
          <div class="product_box_dollar">
            NT$  ${data[i].price.original}
          </div>
        </div>
        <input class="add_btn" type="button" value="加入購物車" />`;
      newLi.innerHTML += content;
      newLi.setAttribute('data-index', i);
      newLi.classList.add('fadeInDown');
      newProductContent.appendChild(newLi);
    }

    newProductContent.addEventListener('click', e => {
      function localStorageFavoriteData(data) {
        let favoriteListToString = JSON.stringify(data);
        localStorage.setItem('newProductsData', favoriteListToString);
      }
      if (e.target.parentNode.parentNode.className === 'favorite_icon') {
        let favoriteIcon = e.target.parentNode.parentNode;
        let dataIndex = favoriteIcon.parentNode.parentNode.dataset.index;
        if (e.target.parentNode.className === 'favorite_icon_on') {
          e.target.parentNode.style.display = 'none';
          favoriteIcon.children[0].style.display = 'flex';
          favoriteList.splice(favoriteList.indexOf(data[dataIndex].id), 1);
        } else {
          e.target.parentNode.style.display = 'none';
          favoriteIcon.children[1].style.display = 'flex';
          favoriteList.push(data[dataIndex].id);
        }
        localStorageFavoriteData(favoriteList);
      }
      function localStorageCartProductData(data) {
        let cartProductListToString = JSON.stringify(data);
        localStorage.setItem('cartList', cartProductListToString);
      }
      if (e.target.className === 'add_btn') {
        //如果點選同一樣的話只累加數量
        let index = e.target.parentNode.dataset.index;
        let isRepeat = () => {
          return cartProduct.some(compareData => {
            return compareData.dataId === data[index].id;
          });
        };
        if (!cartProduct.length || isRepeat() === false) {
          cartProduct.push({ dataId: data[index].id, quantity: 1 });
        } else {
          cartProduct.forEach(cartProduct => {
            if (cartProduct.dataId === data[index].id) cartProduct.quantity++;
            else return;
          });
        }
        let cartStore = document.getElementById('cart_store');
        let fixedCartStore = document.getElementById('fixed_cart_store');
        cartStore.textContent = cartProduct.length;
        fixedCartStore.textContent = cartProduct.length;
        localStorageCartProductData(cartProduct);
      }
    });
  }
  getNewProducts();
})();

(function() {
  let db = firebase;
  let main = document.querySelector('main');
  let loading = document.querySelector('.loading_modal');
  let favoriteList = JSON.parse(localStorage.getItem('newProductsData')) || [];
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  let newsContentTable = document.querySelector('.news_content_table');
  let newsContentTbody = newsContentTable.children[0];
  window.addEventListener('load', () => {
    db.auth().onAuthStateChanged(user => {
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
            if (doc.data().favoriteList) {
              favoriteList = doc.data().favoriteList || [];
            } else {
              db.firestore()
                .collection('customersUser')
                .doc(user.uid)
                .update({ favoriteList: favoriteList });
            }
          });
      } else {
        favoriteList = JSON.parse(localStorage.getItem('newProductsData')) || [];
        cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
      }
      getNewProducts();
      getNewsData();
    });
  });
  bannerCardHandler();
  bannerHandler();
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

  //最新消息
  function getNewsData() {
    let newsData = [];
    db.firestore()
      .collection('news')
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
        newsModal(newsData);
        paginationHandle(newsData);
        loading.style.display = 'none';
        main.style.visibility = 'visible';
      });
  }
  let page = 1;
  function paginationHandle(data) {
    // onPage
    let pagination = document.querySelector('.pagination');
    let goBack = document.querySelector('.go_back');
    let goAhead = document.querySelector('.go_ahead');
    let pageUrl = page;
    let limit = 7, //每頁顯示資料數
      currentPage = pageUrl, //
      limitPage = 5, //標籤顯示數量
      totalPage = Math.ceil(data.length / limit); //總頁數
    let startPage = startPageCondition(); //分頁起始
    endPage = endPageCondition(); //分頁結束
    let showPage = totalPage > limitPage ? 5 : totalPage;
    if (pageUrl === 1 || pageUrl === 0) {
      currentPage = 1;
    } else if (pageUrl >= totalPage) {
      currentPage = totalPage;
    } else {
      currentPage = pageUrl;
    }
    function startPageCondition() {
      let start = 1;
      if (totalPage < limitPage || currentPage < limitPage) {
        start = 1;
      } else {
        if (totalPage % limitPage !== 0) {
          if (totalPage - currentPage < limitPage - 1) start = totalPage - limitPage + 1;
          else if (
            currentPage === totalPage - (currentPage % limitPage) ||
            currentPage === totalPage ||
            totalPage < pageUrl
          )
            start = totalPage - limitPage + 1;
          else start = currentPage - (currentPage % limitPage === 0 ? 5 : currentPage % limitPage) + 1;
        } else {
          start = totalPage - limitPage + 1;
        }
      }
      return start;
    }
    function endPageCondition() {
      let end = 1;
      if (totalPage < limitPage) {
        end = totalPage;
      } else {
        if (totalPage % limitPage === 0 || totalPage <= pageUrl) {
          end = startPage + limitPage - 1;
        } else {
          if (totalPage > limitPage) end = startPage + limitPage - 1;
          else pageUrl >= totalPage ? (end = totalPage) : (end = currentPage - (pageUrl % limitPage) + 1);
        }
      }
      return end;
    }
    //產品渲染
    let newFilterData = [];
    for (
      let i = (currentPage - 1) * limit;
      i < (currentPage * limit > data.length ? data.length : currentPage * limit);
      i++
    ) {
      newFilterData.push(data[i]);
    }
    addNewsContent(newFilterData);
    //分頁
    let pages = pagination.getElementsByTagName('li');
    function addPage() {
      for (let i = startPage, j = 1; i <= endPage; i++) {
        let newLi = document.createElement('li');
        newLi.innerHTML = `<a href="javaScript:;">${i}</a>`;
        if (pages.length !== showPage + 2) {
          pagination.insertBefore(newLi, goAhead);
        } else {
          pagination.removeChild(pages[j]);
          pagination.insertBefore(newLi, goAhead);
        }
      }
    }
    addPage();
    pageStatus();
    pagination.addEventListener('click', e => {
      if ((e.target && e.target.className === 'go_back') || (e.target && e.target.id === 'go_back')) {
        //頁數可以被整除
        if (totalPage % limitPage === 0) {
          startPage - limitPage < 0 ? (startPage = 1) : (startPage = startPage - limitPage);
          endPage - limitPage < limitPage ? (endPage = limitPage) : (endPage = endPage - limitPage);
        } else if (totalPage % limitPage !== 0) {
          //頁數不能被整除
          if (startPage - limitPage < 0) startPage = 1;
          else if (startPage === totalPage - limitPage + 1)
            startPage = totalPage - (totalPage % limitPage) - limitPage + 1;
          else startPage = startPage - limitPage;

          if (endPage - limitPage < 1) endPage = limitPage;
          else if (endPage === totalPage) endPage = totalPage - (totalPage % limitPage);
          else endPage = endPage - limitPage;
        }
      } else if ((e.target && e.target.className === 'go_ahead') || (e.target && e.target.id === 'go_ahead')) {
        if (totalPage % limitPage === 0) {
          if (startPage + limitPage > totalPage) return;
          else startPage = startPage + limitPage;
          if (endPage + limitPage >= totalPage) endPage = totalPage;
          else endPage = endPage + limitPage;
        } else if (totalPage % limitPage !== 0) {
          if (startPage + limitPage >= totalPage || startPage + limitPage * 2 > totalPage) {
            startPage = totalPage - limitPage + 1;
          } else startPage = startPage + limitPage;

          if (endPage + limitPage >= totalPage) endPage = totalPage;
          else endPage = endPage + limitPage;
        }
      }
      addPage();
      pageStatus();
      if ((e.target.className !== 'go_back' || e.target.className !== 'go_ahead') && e.target.nodeName !== 'UL') {
        page = Number(e.target.textContent);
      }
    });
    //分頁狀態
    function pageStatus() {
      for (let i = 0; i < pages.length; i++) {
        Number(pages[i].children[0].textContent) === currentPage
          ? pages[i].classList.add('onPage')
          : pages[i].classList.remove('onPage');
      }
      if (totalPage === 1) {
        goBack.style.setProperty('visibility', 'hidden');
        goAhead.style.setProperty('visibility', 'hidden');
        pages[1].style.borderRadius = '5px';
      } else if (totalPage <= showPage) {
        goBack.style.setProperty('display', 'none');
        goAhead.style.setProperty('display', 'none');
        pages[1].style.borderRadius = '5px 0 0 5px';
        pages[showPage].style.borderRadius = ' 0 5px  5px 0';
      } else if (startPage === 1) {
        goBack.style.setProperty('visibility', 'hidden');
        goAhead.style.setProperty('visibility', 'visible');
        pages[1].style.borderRadius = '5px 0 0 5px';
      } else if (currentPage === totalPage || endPage === totalPage) {
        goAhead.style.setProperty('visibility', 'hidden');
        goBack.style.setProperty('visibility', 'visible');
        pages[showPage].style.borderRadius = '0 5px 5px 0';
      } else {
        goAhead.style.setProperty('visibility', 'visible');
        goBack.style.setProperty('visibility', 'visible');
      }
    }
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
    data.forEach(newData => {
      let time = new Date(newData.date.seconds * 1000);
      let currentDate = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
      let newLi = document.createElement('li');
      liContent = `<div class="news_type ${styleColor(newData.style)}">
      ${newData.style}
  </div>
  <div class="news_title" data-index='${newData.index}'>${newData.title}</div>
  <div class="news">
    <p>${newData.content.length > 100 ? newData.content.slice(0, 100) + '...' : newData.content}</p>
    <a href="javascript:;"  data-index='${newData.index}' style="display:${
        newData.content.length > 100 ? 'flex' : 'none'
      }">more</a>
  </div>
  <div class="news_date">${currentDate}</div>`;
      newLi.innerHTML += liContent;
      newsContentUl.appendChild(newLi);
    });
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

  //新品上市

  function getNewProducts() {
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
          if (data.status && data.tag === '新品上市') {
            productData.push(data);
          }
        });
        newProductHandler(productData);
      });
  }

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
          <a href="javascript:;"> ${data[i].productName}</a>    
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
      const user = db.auth().currentUser;
      function localStorageFavoriteData(data) {
        let favoriteListToString = JSON.stringify(data);
        localStorage.setItem('newProductsData', favoriteListToString);
      }
      if (e.target.parentNode.parentNode.className === 'favorite_icon') {
        if (user) {
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .get()
            .then(doc => {
              if (doc.data().favoriteList) {
                favoriteList = doc.data().favoriteList || [];
              } else {
                db.firestore()
                  .collection('customersUser')
                  .doc(user.uid)
                  .update({ favoriteList: favoriteList });
              }
              addFavoriteHandler(favoriteList);
            });
        } else {
          favoriteList = JSON.parse(localStorage.getItem('newProductsData')) || [];
          addFavoriteHandler(favoriteList);
        }
        function addFavoriteHandler(favoriteList) {
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
          if (user) {
            db.firestore()
              .collection('customersUser')
              .doc(user.uid)
              .update({ favoriteList: favoriteList });
          }
          localStorageFavoriteData(favoriteList);
        }
      }
      function localStorageCartProductData(data) {
        let cartProductListToString = JSON.stringify(data);
        localStorage.setItem('cartList', cartProductListToString);
      }
      if (e.target.className === 'add_btn') {
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
              addProductHandler(cartProduct);
            });
        } else {
          cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
          addProductHandler(cartProduct);
        }
        function addProductHandler(cartProduct) {
          //如果點選同一樣的話只累加數量
          let index = e.target.parentNode.dataset.index;
          let isRepeat = () => {
            return cartProduct.some(compareData => {
              return compareData.dataId === data[index].id;
            });
          };
          if (!cartProduct.length || isRepeat() === false) {
            cartProduct.push({
              dataId: data[index].id,
              quantity: 1
            });
          } else {
            cartProduct.forEach(cartProduct => {
              if (cartProduct.dataId === data[index].id) cartProduct.quantity++;
              else return;
            });
          }
          if (user) {
            db.firestore()
              .collection('customersUser')
              .doc(user.uid)
              .update({ cartList: cartProduct });
          }
          let cartStore = document.getElementById('cart_store');
          let fixedCartStore = document.getElementById('fixed_cart_store');
          cartStore.textContent = cartProduct.length;
          fixedCartStore.textContent = cartProduct.length;
          localStorageCartProductData(cartProduct);
        }
      }
      //進入商品頁
      if (e.target.nodeName === 'A') {
        let index = e.target.parentNode.parentNode.parentNode.dataset.index;
        window.location.href = `../html/productItem.html?id=${data[index].id}`;
      }
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
})();

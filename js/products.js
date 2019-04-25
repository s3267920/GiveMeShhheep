(function() {
  let db = firebase;
  let page = location.search.split('page=')[1] ? Number(location.search.split('page=')[1].split('&')[0]) : 1;
  let type = location.search.split('type=')[1] ? location.search.split('type=')[1].split('&')[0] : 'all';
  let series = location.search.split('series=')[1] ? location.search.split('series=')[1].split('&')[0] : '';
  let favoriteList = JSON.parse(localStorage.getItem('newProductsData')) || [];
  let cartProduct = JSON.parse(localStorage.getItem('cartList')) || [];
  //使用 form 來做 httpParams
  //參考 https://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
  //參考 https://pjchender.blogspot.com/2016/06/javascript-for-in-function.html
  function postDataHandle(path, data, method) {
    method = method || 'get';
    let newForm = document.createElement('form');
    newForm.setAttribute('method', method);
    newForm.setAttribute('action', path);
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let newInput = document.createElement('input');
        newInput.setAttribute('type', 'hidden');
        newInput.setAttribute('name', key);
        newInput.setAttribute('value', data[key]);
        newForm.appendChild(newInput);
      }
    }
    document.body.appendChild(newForm);
    newForm.submit();
  }

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
      getProductData();
    });
  });

  //get product data
  function getProductData() {
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
          if (data.status) {
            productData.push(data);
          }
        });
        function filterData(condition, val) {
          return productData.filter(data => {
            return data[condition] === val;
          });
        }
        if (!location.search || (type === 'all' && series === '')) {
          paginationHandle(productData);
        } else if (series !== '') {
          let currentSeries = '';
          switch (series) {
            case 'KS': //knit a scarf
              currentSeries = '織進你心裡';
              break;
            case 'SP': //sheep
              currentSeries = '羊羊系列';
              break;
            case 'BD': //bedding
              currentSeries = '寢具';
              break;
            default:
              currentSeries = '其他';
              break;
          }
          paginationHandle(filterData('series', currentSeries));
        } else {
          let tag = '';
          switch (type) {
            case 'product_of_the_day':
              tag = '本日精選';
              break;
            case 'popular':
              tag = '人氣推薦';
              break;
            case 'new_product':
              tag = '新品上市';
              break;
            default:
              tag = 'all';
              break;
          }
          paginationHandle(filterData('tag', tag));
        }

        productTypeHandler(productData);
      });
  }
  //資料類別
  function productTypeHandler(data) {
    //所有產品之系列
    let allProductItemList = document.querySelector('.all_product_item_list');
    function allProductItemListHandler(data) {
      productsListHandleAndRender(data, 'series', allProductItemList);
      allProductItemList.addEventListener('click', e => {
        let abbreviationSeries;
        switch (e.target.textContent.split('（')[0]) {
          case '織進你心裡':
            abbreviationSeries = 'KS';
            break;
          case '羊羊系列':
            abbreviationSeries = 'SP';
            break;
          case '寢具':
            abbreviationSeries = 'BD';
            break;
          default:
            abbreviationSeries = '';
            break;
        }
        postDataHandle('products.html', { page: page, series: abbreviationSeries });
      });
    }
    allProductItemListHandler(data);

    //類別
    let productsContentNav = document.querySelector('.products_content_nav');
    let productsContentUl = document.querySelector('#products_content_ul');
    //data 資料 , type 種類 , parent 要插入的元素
    function productsListHandleAndRender(data, type, parent) {
      let allData = [];
      data.forEach(data => {
        allData.push(data[type]);
      });
      let filterType = allData.filter((data, index, arr) => {
        return arr.indexOf(data) === index;
      });
      let typeData = allData.reduce((allData, data) => {
        if (!allData[data]) allData[data] = 1;
        else allData[data] += 1;
        return allData;
      }, {});
      filterType.forEach(data => {
        let newLi = document.createElement('li');
        newLi.innerHTML = `<a href="javascript:;">${data}（<span>${typeData[data]}</span>）</a>`;
        parent.appendChild(newLi);
      });
    }
    function productTypeNavHandler(data) {
      let allQuantity = document.querySelector('.all_product_item').querySelector('span');
      allQuantity.textContent = data.length;
      productsListHandleAndRender(data, 'tag', productsContentUl);
      productsContentNav.addEventListener('click', e => {
        if (e.target && e.target.id === 'more_item') {
          allProductItemList.style.display === 'none'
            ? (allProductItemList.style.display = 'flex')
            : (allProductItemList.style.display = 'none');
        } else if (
          e.target &&
          e.target.nodeName === 'A' &&
          (e.target.parentNode.parentNode.id === 'products_content_ul' ||
            e.target.parentNode.parentNode.parentNode.id === 'products_content_ul')
        ) {
          switch (e.target.textContent.split('（')[0]) {
            case '所有產品':
              type = 'all';
              break;
            case '本日精選':
              type = 'product_of_the_day';
              break;
            case '人氣推薦':
              type = 'popular';
              break;
            case '新品上市':
              type = 'new_product';
              break;
            default:
              type = '';
              break;
          }
          postDataHandle('products.html', { page: page, type: type });
          console.log(series);
        }
      });
    }
    productTypeNavHandler(data);
  }
  //分頁
  function paginationHandle(data) {
    // onPage
    let pagination = document.querySelector('.pagination');
    let goBack = document.querySelector('.go_back');
    let goAhead = document.querySelector('.go_ahead');
    let pageUrl = page;
    let limit = 9, //每頁顯示資料數
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
    ProductListHandler(newFilterData);

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
        console.log(page);
        if (series !== '') {
          postDataHandle('products.html', { page: page, series: series });
        } else {
          postDataHandle('products.html', { page: page, type: type });
        }
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

  function ProductListHandler(data) {
    let productListContent = document.querySelector('.product_list_content');
    let content = '';
    data.forEach((newData, index) => {
      let newLi = document.createElement('li');
      let isFavorite = () => {
        return favoriteList.indexOf(newData.id) !== -1;
      };
      content = `
      <div class="product_box">
        <div
          class="product_box_img"
          style="background-image:url(${newData.imgList[0].src});"
        ></div>
          <div class="type_tag">
          ${newData.tag}
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
          ${newData.productName}
          </div>
          <div class="product_box_dollar">
            NT$  ${newData.price.discount}
          </div>
        </div>
        <input class="add_btn" type="button" value="加入購物車" />`;
      newLi.innerHTML += content;
      newLi.setAttribute('data-index', index);
      newLi.classList.add('fadeInDown');
      productListContent.appendChild(newLi);
    });
    productListContent.addEventListener('click', e => {
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
              console.log(favoriteList);
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
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .update({ favoriteList: favoriteList });
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
          db.firestore()
            .collection('customersUser')
            .doc(user.uid)
            .update({ cartList: cartProduct });
          let cartStore = document.getElementById('cart_store');
          let fixedCartStore = document.getElementById('fixed_cart_store');
          cartStore.textContent = cartProduct.length;
          fixedCartStore.textContent = cartProduct.length;
          localStorageCartProductData(cartProduct);
        }
      }
    });
  }
})();

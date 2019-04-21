(function() {
  let db = firebase;
  let main = document.querySelector('main');
  let h2Title = document.querySelector('main h2');
  let submitBtn = document.querySelector('.submit_btn');
  let submitBtnSpan = submitBtn.querySelector('span');
  let error = {
    email: '',
    password: ''
  };
  let newUser = {
    name: '',
    email: '',
    password: '',
    birthday: {
      year: '',
      month: '',
      day: ''
    }
  };

  window.addEventListener('load', e => {
    db.auth().onAuthStateChanged(user => {
      if (user && newUser.email === '') {
        location.href = '../index.html';
      }
    });
  });
  // window.addEventListener('beforeunload', e => {
  //   e.returnValue = '確定離開當前頁面嗎？';
  // });
  function validEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  function validPassword(password) {
    const condition = /^[a-z]+[\d+|\w]/;
    return condition.test(password);
  }
  function inputFocusHandler(e) {
    if (e && e.target.nodeName === 'INPUT' && h2Title.parentNode.className === 'login_header') {
      e.target.parentNode.classList.add('isFocus');
    }
  }
  function inputBlurHandler(e) {
    let userEmailErrorMsg = document.querySelector('#user_email_error_msg');
    let userPasswordErrorMsg = document.querySelector('#user_password_error_msg');
    let userNameErrorMsg = document.querySelector('#user_name_error_msg');
    let userBirthdayErrorMsg = document.querySelector('#user_birthday_error_msg');
    if (e && e.target.nodeName === 'INPUT') {
      if (e.target.id === 'user_email') {
        newUser.email = e.target.value.trim();
        if (!newUser.email.length) {
          error.email = '請輸入電子郵件';
          e.target.parentNode.classList.remove('isFocus');
          e.target.classList.add('errorActive');
        } else {
          validEmail(newUser.email)
            ? ((error.email = ''), e.target.classList.remove('errorActive'))
            : ((error.email = '請輸入正確的電子郵件格式'), e.target.classList.add('errorActive'));
        }
        userEmailErrorMsg.textContent = error.email.trim();
      } else if (e.target.id === 'user_password') {
        newUser.password = e.target.value.trim();

        if (!newUser.password.length) {
          e.target.classList.add('errorActive');
          error.password = '請輸入密碼';
          e.target.parentNode.classList.remove('isFocus');
        } else if (newUser.password.length < 8 && !validPassword(newUser.password)) {
          error.password = '請輸入至少８碼，開頭為英文字母的密碼';
          e.target.classList.add('errorActive');
        } else if (newUser.password.length >= 8 && validPassword(newUser.password)) {
          error.password = '';
          e.target.classList.remove('errorActive');
        }
        userPasswordErrorMsg.textContent = error.password.trim();
      } else if (e.target.id === 'user_name') {
        newUser.name = e.target.value.trim();
        !newUser.name.length
          ? (e.target.parentNode.classList.remove('isFocus'),
            (userNameErrorMsg.textContent = '請輸入姓名或名稱'),
            e.target.classList.add('errorActive'))
          : ((userNameErrorMsg.textContent = ''), e.target.classList.remove('errorActive'));
      }
    } else if (e && e.target.nodeName === 'SELECT') {
      let birthday = newUser.birthday;
      switch (e.target.id) {
        case 'birthday_year':
          birthday.year === '' ? e.target.classList.add('errorActive') : e.target.classList.remove('errorActive');
          break;
        case 'birthday_month':
          birthday.month === '' ? e.target.classList.add('errorActive') : e.target.classList.remove('errorActive');
          break;
        case 'birthday_day':
          birthday.day === '' ? e.target.classList.add('errorActive') : e.target.classList.remove('errorActive');
          break;
      }
    }
  }
  function selectChangeHandler(e) {
    let birthday = newUser.birthday;
    if (e && e.target.nodeName === 'SELECT') {
      switch (e.target.id) {
        case 'birthday_year':
          birthday.year = e.target.value;
          e.target.classList.remove('errorActive');
          dayFilter();
          break;
        case 'birthday_month':
          birthday.month = e.target.value;
          e.target.classList.remove('errorActive');
          dayFilter();
          break;
        case 'birthday_day':
          birthday.day = e.target.value;
          e.target.classList.remove('errorActive');
          break;
        default:
          break;
      }

      function dayFilter() {
        let year = newUser.birthday.year;
        let month = Number(newUser.birthday.month);
        switch (month) {
          case 1:
          case 3:
          case 5:
          case 7:
          case 8:
          case 10:
          case 12:
            dayRender(31);
            break;
          case 4:
          case 6:
          case 9:
          case 11:
            dayRender(30);
            break;
          case 2:
            if ((year % 4 === 0 && year % 100 != 0) || (year % 400 === 0 && year % 3200 !== 0)) dayRender(29);
            else dayRender(28);
            break;
        }
        function dayRender(endDay) {
          let birthdayDay = document.querySelector('#birthday_day');
          birthdayDay.textContent = '';
          birthdayDay.innerHTML = ` <option value="" selected  disabled>日</option>`;
          for (let i = 1; i <= endDay; i++) {
            let newOption = document.createElement('option');
            newOption.textContent = i + '日';
            newOption.value = i;
            birthdayDay.appendChild(newOption);
          }
        }
      }
    }
  }
  function birthdaySelectOptionHandler() {
    let birthdayYear = document.querySelector('#birthday_year');
    let birthdayMonth = document.querySelector('#birthday_month');
    function yearFilter() {
      const endYear = 1905;
      const firstYear = new Date().getFullYear();
      for (let i = firstYear; i >= endYear; i--) {
        let newOption = document.createElement('option');
        newOption.textContent = i + '年';
        newOption.value = i;
        birthdayYear.appendChild(newOption);
      }
    }
    function monthFilter() {
      for (let i = 1; i <= 12; i++) {
        let newOption = document.createElement('option');
        newOption.textContent = i + '月';
        newOption.value = i;
        birthdayMonth.appendChild(newOption);
      }
    }
    if (birthdayMonth) {
      yearFilter();
      monthFilter();
    }
  }
  function submitHandler(e) {
    function checkForm() {
      let userEmailErrorMsg = document.querySelector('#user_email_error_msg');
      let userPasswordErrorMsg = document.querySelector('#user_password_error_msg');
      let userNameErrorMsg = document.querySelector('#user_name_error_msg');
      let userBirthdayErrorMsg = document.querySelector('#user_birthday_error_msg');
      if (userNameErrorMsg && newUser.name === '') {
        userNameErrorMsg.textContent = '請輸入姓名或名稱';
        userNameErrorMsg.parentNode.children[0].classList.add('errorActive');
      }
      if (userEmailErrorMsg && newUser.email === '') {
        userEmailErrorMsg.textContent = '請輸入電子郵件';
        userEmailErrorMsg.parentNode.children[0].classList.add('errorActive');
      }
      if (userPasswordErrorMsg && newUser.password === '') {
        userPasswordErrorMsg.parentNode.children[0].classList.add('errorActive');
        userPasswordErrorMsg.textContent = '請輸入密碼';
      }
      if (
        userBirthdayErrorMsg &&
        (newUser.birthday.year === '' || newUser.birthday.month === '' || newUser.birthday.day === '')
      ) {
        if (newUser.birthday.year === '') {
          userBirthdayErrorMsg.parentNode.children[1].classList.add('errorActive');
        }
        if (newUser.birthday.month === '') {
          userBirthdayErrorMsg.parentNode.children[2].classList.add('errorActive');
        }
        if (newUser.birthday.day === '') {
          userBirthdayErrorMsg.parentNode.children[3].classList.add('errorActive');
        }
        userBirthdayErrorMsg.textContent = '請選擇完整的生日';
      }
    }
    if (e.target.parentNode.className === 'login') {
      submitToLogin(e);
      function submitToLogin(e) {
        e.target.setAttribute('active', 'active');
        submitBtnSpan.style.display = 'inline-flex';
        submitBtnSpan.classList.add('checking');
        if (
          error.email !== '' ||
          error.password !== '' ||
          newUser.email === '' ||
          newUser.password === '' ||
          newUser.password.length < 8
        ) {
          e.target.removeAttribute('active');
          submitBtnSpan.style.display = 'none';
          checkForm();
          submitBtnSpan.classList.remove('checking');
        } else {
          db.auth()
            .signInWithEmailAndPassword(newUser.email, newUser.password)
            .then(() => {
              alert('登入成功');
              history.go(-1);
            })
            .catch(error => {
              const errorCode = error.code;
              const errorMessage = error.message;
              if (errorCode === 'auth/wrong-password') {
                alert('密碼錯誤');
              } else {
                error.password = errorMessage;
              }
              console.error(error);
            });
        }
      }
    } else if (e.target.parentNode.className === 'sign_up') {
      signUpCheckAndSubmitHandler(e);
      function signUpCheckAndSubmitHandler(e) {
        if (e && e.target.nodeName === 'BUTTON') {
          e.target.setAttribute('active', 'active');
          submitBtnSpan.style.display = 'inline-flex';
          submitBtnSpan.classList.add('checking');
          if (
            newUser.name === '' ||
            newUser.email === '' ||
            newUser.password === '' ||
            newUser.password.length < 8 ||
            newUser.birthday.year === '' ||
            newUser.birthday.month === '' ||
            newUser.birthday.day === '' ||
            error.email.length ||
            error.password.length
          ) {
            e.target.removeAttribute('active');
            submitBtnSpan.style.display = 'none';
            checkForm();
            submitBtnSpan.classList.remove('checking');
          } else {
            const user = newUser;
            db.auth()
              .createUserWithEmailAndPassword(user.email, user.password)
              .then(users => {
                const id = users.user.uid;
                console.log(id);
                db.firestore()
                  .collection('customersUser')
                  .doc(id)
                  .set({
                    userID: id,
                    email: user.email,
                    userName: user.name,
                    password: user.password,
                    userBirthday: `${user.birthday.year}-${user.birthday.month}-${user.birthday.day}`,
                    identity: 'customer'
                  })
                  .then(() => {
                    alert('註冊成功');
                    history.go(-2);
                  })
                  .catch(error => {
                    console.error('Error writing document: ', error);
                  });
              })
              .catch(error => {
                const errorCode = error.code;
                switch (errorCode) {
                  case 'auth/weak-password':
                    error.password = '密碼強度太弱';
                    break;
                  case 'auth/email-already-in-use':
                    error.email = '這個電子郵件已經使用過';
                    break;
                  case 'auth/invalid-email':
                    error.email = '電子郵件無效';
                    break;
                  default:
                    break;
                }
              });
          }
        }
      }
    }
  }

  birthdaySelectOptionHandler();
  main.addEventListener('focus', inputFocusHandler, true);
  main.addEventListener('change', selectChangeHandler);
  main.addEventListener('blur', inputBlurHandler, true);
  submitBtn.addEventListener('click', submitHandler);
})();

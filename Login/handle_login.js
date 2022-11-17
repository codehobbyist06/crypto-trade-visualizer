const PASSWORD = '123456';

let submit_button = document.getElementById('submit-button');

let handle_login = (event) => {
  let input_password = document.getElementById('login-pass');

  if (input_password.value === PASSWORD) {
    // alert('Login Successful');
    window.location.href = './Client/index.html';
  } else {
    alert('Incorrect Password!');
  }
};

submit_button.addEventListener('click', handle_login);

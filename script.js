import { token } from './data.js';

const data_table = document.querySelector('#data-table');
const user_table = document.querySelector('#user-table');
const add_user_button = document.querySelector('#add-user-button');
const remove_user_button = document.querySelector('#remove-user-button');
const username_input = document.querySelector('#username-input');
const app = document.querySelector('#app');

let valid_user_names = ['ROYALxGIFTS'];
let all_offers = [];
let interested_offers = [];
let other_user_data = [];
let is_valid_name = {};

const api_url = 'https://api.paxful.com/';
const cors_proxy_url = 'https://trade-visualizer-backend.herokuapp.com';
const cors_dev_url = 'http://127.0.0.1:5000';

// Fetch all the user data mentioned in the valid usernames list
if (
  JSON.parse(localStorage.getItem('usernames')) &&
  JSON.parse(localStorage.getItem('usernames')).length != 0
) {
  valid_user_names = JSON.parse(localStorage.getItem('usernames'));
}

let createDataElement = (value) => {
  let new_cell = document.createElement('TD');
  new_cell.innerHTML = value;
  return new_cell;
};

let display_offer = (offer) => {
  let new_row = document.createElement('TR');
  new_row.appendChild(createDataElement(offer['username']));
  new_row.appendChild(createDataElement(offer['last_seen']));
  new_row.appendChild(createDataElement(offer['ad_name']));
  new_row.appendChild(createDataElement(offer['amount']));
  new_row.appendChild(createDataElement(offer['total_trades']));
  data_table.appendChild(new_row);
};

let display_user = (user_name) => {
  let new_row = document.createElement('TR');
  new_row.appendChild(createDataElement(user_name));
  user_table.appendChild(new_row);
};

for (let name of valid_user_names) {
  is_valid_name[name] = 1;
  display_user(name);
}

//For auth requests
// let request_offer_data = async (offset) => {
//   const api_endpoint = 'paxful/v1/offer/all';

//   if (offset === undefined) offset = 0;

//   return await fetch(api_url + api_endpoint, {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json; version=1',
//       'Content-Type': 'application/x-www-form-urlencoded',
//       Authorization: `Bearer ${token}`,
//     },
//     body: `offer_type=sell&limit=300&offset=${offset}`,
//   }).then((response) => {
//     let value = response.json();
//     return value;
//   });
// };

// let get_page_count = async () => {
//   return await request_offer_data().then((data) => {
//     let count = data['data']['totalCount'] / 300;
//     all_offers = [...all_offers, ...data['data']['offers']];
//     return {
//       count: count,
//       data: data,
//     };
//   });
// };

// let get_interested_offers = () => {
//   get_page_count().then((data) => {
//     let requests = [];
//     for (let i = 1; i < data['count']; i++) {
//       requests.push(
//         request_offer_data(300 * i).then((data) => {
//           all_offers = [...all_offers, ...data['data']['offers']];
//           // console.log(all_offers);
//         })
//       );
//     }

//     Promise.all(requests).then(() => {
//       for (let offer of all_offers) {
//         // console.log(offer['offer_owner_username']);
//         if (is_valid_name[offer['offer_owner_username']] != 1) continue;
//         let new_offer_data = {
//           userName: offer['offer_owner_username'],
//           lastSeen: other_user_data[offer['offer_owner_username']]['last_seen'],
//           paymentMethodName: offer['payment_method_name'],
//           amount: 100,
//           NumberOfTrades:
//             other_user_data[offer['offer_owner_username']]['total_trades'],
//         };

//         // console.log(new_offer_data);
//         interested_offers.push(new_offer_data);

//         display_offer(new_offer_data);
//       }
//     });
//   });
// };

let get_user_data = async (user_name) => {
  const api_endpoint = 'paxful/v1/user/info';

  return await fetch(api_url + api_endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json; version=1',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: `username=${user_name}`,
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);

      other_user_data[user_name] = {
        total_trades: data['data']['total_trades'],
        last_seen: data['data']['last_seen'],
      };
      return other_user_data;
    });
};

let add_new_offers = (username) => {
  for (let offer of all_offers) {
    if (offer['username'] === username) {
      // console.log(offer['username']);
      if (is_valid_name[offer['username']] != 1) continue;
      let new_offer_data = {
        userName: offer['username'],
        lastSeen: offer['lastSeenString'],
        paymentMethodName: offer['paymentMethodName'],
        amount: offer['fiatAmountRangeMax'],
        NumberOfTrades: 1,
      };

      // console.log(new_offer_data);
      interested_offers.push(new_offer_data);

      display_offer(new_offer_data);
    }
  }
};

let format_amount = (amount, currency_code) => {
  return new Intl.NumberFormat({
    style: 'currency',
    currency: currency_code,
  }).format(amount);
};

let get_offers_data_no_auth = (username) => {
  fetch(cors_proxy_url + '?username=' + username)
    .then((response) => response.json())
    .then((data) => {
      if (data['status'] == 'error') {
        app.innerHTML = '<h2>Unable to fetch offers</h2>';
        return;
      }
      all_offers = data;
      // console.log(all_offers);
      for (let offer of all_offers) {
        offer['amount'] =
          offer['currency_code'] +
          ' ' +
          format_amount(offer['amount'], offer['currency_code']);
        interested_offers.push(offer);
        display_offer(offer);
      }
    });
};

let add_user = (e) => {
  if (username_input.value == '' || is_valid_name[username_input.value] === 0) {
    alert('Please enter valid username');
    username_input.value = '';
    return;
  } else if (is_valid_name[username_input.value] == 1) {
    alert('User already exists!');
    username_input.value = '';
    return;
  }
  is_valid_name[username_input.value] = 1;
  valid_user_names.push(username_input.value);
  display_user(username_input.value);
  get_offers_data_no_auth(username_input.value);

  localStorage.setItem('usernames', JSON.stringify(valid_user_names));

  username_input.value = '';

  // console.log(interested_offers, valid_user_names);
};

let remove_user = () => {
  if (
    is_valid_name[username_input.value] === 0 ||
    is_valid_name[username_input.value] === undefined
  ) {
    alert('The user does not exist');
    username_input.value = '';
    return;
  }

  let user_name = username_input.value;
  let names_length = valid_user_names.length;
  let indexes_to_be_removed = [];

  is_valid_name[username_input.value] = 0;

  for (let offer in interested_offers) {
    if (interested_offers[offer]['username'] === user_name) {
      // console.log(offer);
      indexes_to_be_removed.push(parseInt(offer));
    }
  }

  for (let name = 0; name < names_length; name++) {
    if (valid_user_names[name] === user_name) {
      valid_user_names.splice(name, 1);
      user_table.deleteRow(name + 1);
      break;
    }
  }
  let value = 0;
  for (let index of indexes_to_be_removed) {
    data_table.deleteRow(index + 1 - value);
    interested_offers.splice(index - value, 1);
    value += 1;
  }

  localStorage.setItem('usernames', JSON.stringify(valid_user_names));

  username_input.value = '';

  // console.log(interested_offers, valid_user_names);
};

for (let name of valid_user_names) {
  get_offers_data_no_auth(name);
}

//Attach event handlers
add_user_button.addEventListener('click', add_user);
remove_user_button.addEventListener('click', remove_user);

//Save the usernames to localStorage
localStorage.setItem('usernames', JSON.stringify(valid_user_names));

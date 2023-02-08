window.addEventListener('offline', () => notify('Ops! Device is offline'));
window.addEventListener('online', () => notify('Device is back online'));

loadRecentChats();

const input = document.querySelector('#phone');

const iti = window.intlTelInput(input, {
  autoPlaceholder: 'off',
  hiddenInput: 'full_number',
  initialCountry: 'auto',
  geoIpLookup: async function (success, failure) {
    try {
      const data = await fetch('https://ipinfo.io/?token=d32f445400d6b0');
      const json = await data.json();

      if (!json.country) {
        success('pk');
        return;
      }

      success(json.country);

      if (window.intlTelInputGlobals) {
        const countryData = window.intlTelInputGlobals
          .getCountryData()
          .find(c => c.iso2 === json.country.toLowerCase());

        if (countryData) {
          notify('Country: ' + countryData.name);
        }
      }
    } catch (error) {
      console.log('IP_INFO_ERROR');
      console.log(error);
    }
  },
  nationalMode: false,
  preferredCountries: ['us', 'gb', 'pk'],
  separateDialCode: true,
  utilsScript: './country_selector/js/utils.js',
});

iti.setCountry('pk');

const toastifyConfig = {
  close: true,
  duration: 2500,
  backgroundColorError: 'rgb(255, 60, 0)',
  backgroundColorInfo: 'rgb(115, 115, 115)',
  position: 'center',
  gravity: 'bottom',
  stopOnFocus: true,
};

const WhatsAppAPI = 'https://api.whatsapp.com/send';

const form = document.querySelector('#form');

form.addEventListener('submit', e => {
  e.preventDefault();

  const number = form.full_number.value || iti.getNumber();
  const message = form.message.value;

  if (!number) {
    notify('Number can not be empty', true);
    return;
  }

  if (number.match(/[a-z]/i)) {
    notify('Number can not contain alphabets', true);
    return;
  }

  const numberWithoutPlus = number.substr(1);

  const miscParams = `${WhatsAppAPI}?type=phone_number&app_absent=0`;
  const link = `${miscParams}&phone=${numberWithoutPlus}&text=${message || ''}`;

  addInRecentChats(link, number);
  openInNewTab(link);
  form.reset();
});

function notify(text, isError) {
  const config = { ...toastifyConfig };
  if (isError) {
    config.backgroundColor = toastifyConfig.backgroundColorError;
  } else {
    config.backgroundColor = toastifyConfig.backgroundColorInfo;
  }

  Toastify({
    ariaLive: text,
    text,
    ...config,
  }).showToast();
}

function openInNewTab(href) {
  Object.assign(document.createElement('a'), {
    target: '_blank',
    href,
  }).click();
}

/*************
Recent Chats
*************/

function loadRecentChats() {
  const chatListDOM = document.querySelector('#chats-list');
  if (!chatListDOM) return;

  chatListDOM.innerHTML = '';

  const chatsStr = localStorage.getItem('app_recent_chats') || '[]';
  const chats = JSON.parse(chatsStr);

  chats.forEach(chat => {
    const { link, number, time } = chat || {};

    const div = document.createElement('div');
    div.setAttribute('data-url', link);
    div.classList.add('recent_number');

    const spanNumber = document.createElement('span');
    spanNumber.classList.add('number');
    spanNumber.textContent = number;
    div.appendChild(spanNumber);

    const spanDate = document.createElement('span');
    spanDate.classList.add('date');
    spanDate.textContent = time;
    div.appendChild(spanDate);

    chatListDOM.appendChild(div);
  });

  addRecentChatLinkListener();
}

function addInRecentChats(link, number) {
  const chatsStr = localStorage.getItem('app_recent_chats') || '[]';
  const chats = JSON.parse(chatsStr);

  const time = getDateFormatted();

  const index = chats.findIndex(c => c.link === link);
  if (index >= 0) chats.splice(index, 1);

  const dataToSet = {
    link,
    number,
    time,
  };

  chats.unshift(dataToSet);

  if (chats.length > 10) chats.pop();

  localStorage.setItem('app_recent_chats', JSON.stringify(chats));
  loadRecentChats();
}

function addRecentChatLinkListener() {
  const recentChats = document.querySelector('#recent-chats');
  if (!recentChats) return;

  recentChats.addEventListener('click', function (e) {
    if (e.target?.matches('.recent_number *')) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const parent = e.target.closest('.recent_number');
      openInNewTab(parent.getAttribute('data-url'));
    }
  });
}

function getDateFormatted() {
  const date = new Date();
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const formattedDate = `${date.toLocaleDateString('en-US', {
    weekday: 'short',
    ...options,
  })}`;

  return formattedDate;
}

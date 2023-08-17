const installAppBtn = document.getElementById('installApp');
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  installAppBtn.style.display = 'block';
  deferredPrompt = e;
});

installAppBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    deferredPrompt = null;
  }
});

function openURL(url) {
  let options = 'width=640,height=480,';
  options += 'menubar=no,status=no,location=no,';
  options += `left=${screen.width / 2 - 640 / 2},`;
  options += `top=${0.3 * screen.height - 480 / 2},`;

  return window.open(url, 'popup', options), !1;
}

const url = 'https://whatsnewchat.com';
const text = `Send WhatsApp message without saving the number.`;

function handleShare({ target: el } = {}) {
  if (!el || !el.dataset) return;
  if (!el.dataset.platform) return;

  switch (el.dataset.platform) {
    case 'twitter':
      openURL(
        `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=WhatsApp`,
      );
      break;

    case 'facebook':
      openURL(
        `http://facebook.com/sharer/sharer.php?u=${url}&display=popup&quote=${text}`,
      );
      break;

    case 'linkedin':
      openURL(
        `https://linkedin.com/shareArticle?mini=true&url=${url}&title=${text}&summary=${text}`,
      );
      break;

    case 'telegram':
      openURL(`https://telegram.me/share/url?text=${text}&url=${url}`);
      break;

    case 'whatsapp':
      openURL(
        `https://api.whatsapp.com/send/?text=${text}%0A${url}&autoload=1&app_absent=1`,
      );
      break;

    default:
      break;
  }
}

function handleFAQ({ target: el } = {}) {
  if (!el) return;
  if (!el.classList.contains('collapsible')) return;

  el.classList.toggle('active');

  const content = el.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    content.style.padding = '5px 15px 0';
  } else {
    content.style.maxHeight = content.scrollHeight + 20 + 'px';
    content.style.padding = '5px 15px';
  }
}

const header = document.querySelector('header');
window.onscroll = function () {
  const scrolled = document.documentElement.scrollTop > 80;
  header.classList[scrolled ? 'add' : 'remove']('hidden-small');
};

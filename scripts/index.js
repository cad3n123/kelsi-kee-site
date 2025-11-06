// Elements
const [$social, $mainNav, $homeContent] = [
  'social',
  'main-nav',
  'home-content',
].map((id) => document.getElementById(id));
const [[$links]] = ['.links'].map((descriptor) =>
  $mainNav.querySelectorAll(descriptor)
);
const [[$listenHere]] = ['.cta'].map((descriptor) =>
  $homeContent.querySelectorAll(descriptor)
);

// Global Vars
let data = {};

document.addEventListener('DOMContentLoaded', async function () {
  setCountryList();
  await checkPassword();

  (async () => {
    await fetchData();
    setSocials();
    setLinks();
  })();

  const rsvpForm = document.getElementById('mc-embedded-subscribe-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      // Always stop the form submission first
      e.preventDefault();

      // --- START: Updated Validation ---

      // Check the form's validity.
      // If any 'required' field is empty, this will:
      // 1. Show the browser's default validation alert (e.g., "Please fill out this field")
      // 2. Return 'false'
      if (!rsvpForm.reportValidity()) {
        // If the form is invalid (reportValidity returned false),
        // stop right here. The browser has already shown the alert.
        return;
      }

      // --- END: Updated Validation ---

      // If we get here, it means reportValidity() returned 'true'
      // (all required fields are filled), so we show the "thank you" page.
      const submitBtn = document.getElementById('submit');
      submitBtn.innerHTML = 'submitting...';
      submitBtn.disabled = true;
      submitBtn.style.color = '#808080';

      console.log('Form submission captured. Backend endpoint removed.');
      setTimeout(function () {
        ['mc-embedded-subscribe-form', 'mailchimp-logo']
          .map((id) => document.getElementById(id))
          .map(($) => ($.style.display = 'none'));
        document.getElementById('thankyou').style.display = 'block';
      }, 500);
    });
  }
  removeCurtainAfterImagesLoad();
});

function changeOpacity(element, startOpacity, endOpacity, startTime, endTime) {
  const duration = endTime - startTime;
  const currentTime = new Date().getTime();
  if (currentTime < startTime) {
    element.style.opacity = startOpacity;
  } else if (currentTime > endTime) {
    element.style.opacity = endOpacity;
  } else {
    const progress = (currentTime - startTime) / duration;
    const opacity = startOpacity + (endOpacity - startOpacity) * progress;
    element.style.opacity = opacity;
  }
}

const element = document.querySelector('#overlay');
const startOpacity = 0;
const endOpacity = 1;
const startTime = new Date(1742918400000); // Start at 3/25/25, 12:00:00 PM
const endTime = new Date(1746763200000); // End at 5/9/25, 12:00:00 AM

function updateOpacity() {
  if (element) {
    changeOpacity(element, startOpacity, endOpacity, startTime, endTime);
    requestAnimationFrame(updateOpacity);
  }
}
updateOpacity();

function togglePopup(popupId) {
  document.getElementById(popupId).classList.toggle('open');
  document.getElementById('main-nav').classList.remove('open');
}
function closePopup(popupId) {
  document.getElementById(popupId).classList.toggle('open');
}
function toggleMenu() {
  document.getElementById('main-nav').classList.toggle('open');
}
async function checkPassword() {
  return new Promise((resolve, reject) => {
    const allowedStored = localStorage.getItem('allowed');
    if (allowedStored !== null) {
      if (JSON.parse(allowedStored)) {
        resolve();
        return;
      }
    }

    const correctPassword = 'rareroom';
    while (true) {
      const enteredPassword = prompt('Enter password:').toLowerCase().trim();

      if (enteredPassword === correctPassword) {
        localStorage.setItem('allowed', JSON.stringify(true));
        resolve();
        return;
      } else {
        alert('Access Denied. Incorrect password.');
      }
    }
  });
}
function setCountryList() {
  fetch('https://restcountries.com/v3.1/all?fields=name')
    .then((res) => res.json())
    .then((data) => {
      const select = document.querySelector("select[name='COUNTRY']");
      data
        .sort((a, b) => a.name.common.localeCompare(b.name.common))
        .forEach((country) => {
          const opt = document.createElement('option');
          opt.value = country.name.common;
          opt.textContent = country.name.common;
          select.appendChild(opt);
        });
    });
}
function removeCurtainAfterImagesLoad() {
  const $$images = [...document.querySelectorAll('img')];
  const proms = $$images.map(($image) => {
    if ($image.complete) {
      return Promise.resolve();
    }
    return new Promise((res) => {
      $image.onload = res;
      $image.onerror = res;
    });
  });

  const $curtain = document.getElementById('curtain');

  const finish = (() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      $curtain.classList.remove('active');
      const milliseconds = secondsToMilliseconds(
        getComputedStyle($curtain).getPropertyValue('--transition-time').trim()
      );
      setTimeout(() => {
        $curtain.remove();
      }, milliseconds * 1.1);
    };
  })();

  Promise.all(proms).then(finish);
  setTimeout(finish, 10000);
}
function secondsToMilliseconds(timeStr) {
  const match = timeStr.match(/^([\d.]+)s$/);
  if (!match) throw new Error("Invalid time format. Must end in 's'.");
  return Math.round(parseFloat(match[1]) * 1000);
}
function setCountryList() {
  fetch('https://restcountries.com/v3.1/all?fields=name')
    .then((res) => res.json())
    .then((data) => {
      const select = document.querySelector("select[name='COUNTRY']");
      data
        .sort((a, b) => a.name.common.localeCompare(b.name.common))
        .forEach((country) => {
          const opt = document.createElement('option');
          opt.value = country.name.common;
          opt.textContent = country.name.common;
          select.appendChild(opt);
        });
    });
}
async function fetchData() {
  const S3_URL =
    'https://rareroom-bucket.s3.us-east-2.amazonaws.com/kelsi-kee/data.json';

  try {
    const response = await fetch(S3_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data = await response.json();
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
}
function setSocials() {
  const socialLinks = data['social-links'];

  if (socialLinks === undefined) {
    return;
  }

  const $$socials = [...$social.querySelectorAll('a')].filter(
    ($) => $.target === '_blank'
  );
  for (const social in socialLinks) {
    const $social = $$socials.find(
      ($social) => $social.getAttribute('aria-label') === social
    );
    const link = socialLinks[social];

    if ($social === undefined || link === undefined || link === '') {
      $social.style.display = 'none';
      continue;
    }

    $social.href = link;
  }
}
function setLinks() {
  const $$links = [...$links.querySelectorAll('a')];

  ['music', 'video'].forEach((key) => {
    const link = data[key];
    console.log(link);
    const $link = $$links.find(($link) => $link.classList.contains(key));
    if ([link, $link].includes(undefined)) {
      return;
    }
    $link.href = link;
    if (key === 'music') {
      $listenHere.href = link;
    }
  });
}

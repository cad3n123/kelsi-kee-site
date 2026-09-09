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

/* ---------------------------------------------------------------------------
   TEMPORARILY SWITCHED OFF. Flip a flag to `true` to bring that piece back —
   that is the only change needed, nothing else references these.

     music      — the "Music" link in the nav
     video      — the "Video" link in the nav
     albumTitle — the "The Line" title and its "listen here" link, bottom left
   --------------------------------------------------------------------------- */
const FEATURES = {
  music: false,
  video: false,
  albumTitle: false,
};

/* Taken out of the document rather than hidden with CSS: the nav spaces itself
   with `a + a` rules, which still count an element that is only display:none —
   leaving a stray divider line above the fan club button on mobile. */
function applyFeatureFlags() {
  if (!FEATURES.music) $links.querySelector('.music')?.remove();
  if (!FEATURES.video) $links.querySelector('.video')?.remove();
  if (!FEATURES.albumTitle) $homeContent.remove();
}

document.addEventListener('DOMContentLoaded', function () {
  applyFeatureFlags();
  setCountryList();

  (async () => {
    await fetchData();
    setSocials();
    setLinks();
  })();

  wireFanClubForm();
  orbitThisFeeling();
  removeCurtainAfterImagesLoad();
});

/* The fan club form. This used to call preventDefault, log "Backend endpoint
   removed" and show the thank-you without sending anything — every signup was
   discarded while the visitor was told it worked. It now really subscribes, via
   the same JSONP call to Mailchimp the RAREROOM site uses, so the person stays
   on the page and the thank-you is honest.

   Tag 11840393 and option 2 ("Kelsi Kee") of interest group 28117 mark these as
   Kelsi Kee's in the shared RAREROOM audience. The signup popup sends the same
   pair — see scripts/signup-popup.js. */
const FANCLUB_MAILCHIMP = {
  action:
    'https://rareroomeast.us9.list-manage.com/subscribe/post-json?u=dc1ef2b26411dc4872ade1a16&id=12eb6d76fb&f_id=00f951e1f0',
  botField: 'b_dc1ef2b26411dc4872ade1a16_12eb6d76fb',
  tags: ['11840393'],
  groups: { 28117: ['2'] },
};

function wireFanClubForm() {
  const form = document.getElementById('mc-embedded-subscribe-form');
  if (!form) return;
  const submitBtn = document.getElementById('submit');
  const honeypot = form.querySelector(
    'input[name="' + FANCLUB_MAILCHIMP.botField + '"]'
  );

  function showThankYou() {
    form.style.display = 'none';
    document.getElementById('thankyou').style.display = 'block';
  }

  function resetButton() {
    submitBtn.innerHTML = 'SUBMIT';
    submitBtn.disabled = false;
    submitBtn.style.color = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Browser-native validation first — it shows its own message on the field.
    if (!form.reportValidity()) return;

    /* Offscreen and aria-hidden, so a person never fills it and anything in it
       came from a script filling every field it found. Show the same thank-you
       and send nothing: a bot told "blocked" gets a signal to adapt. */
    if (honeypot && honeypot.value) {
      showThankYou();
      return;
    }

    submitBtn.innerHTML = 'submitting...';
    submitBtn.disabled = true;
    submitBtn.style.color = '#808080';

    const cb = 'mcCb' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    function cleanup() {
      delete window[cb];
      script.remove();
    }
    const timer = setTimeout(function () {
      cleanup();
      resetButton();
      alert('Something went wrong — please try again.');
    }, 8000);

    window[cb] = function (res) {
      clearTimeout(timer);
      cleanup();
      const raw = (res && res.msg ? String(res.msg) : '')
        .replace(/<[^>]*>/g, '')
        .trim();
      // Check the message text BEFORE the result flag: Mailchimp reports an
      // already-subscribed address in `msg` but has been seen to return it with
      // result:'success' too. Either way it's a thank-you, not an error.
      if (/already subscribed/i.test(raw) || (res && res.result === 'success')) {
        showThankYou();
      } else {
        resetButton();
        alert(raw || 'Please enter a valid email.');
      }
    };
    script.onerror = function () {
      clearTimeout(timer);
      cleanup();
      resetButton();
      alert('Something went wrong — please try again.');
    };

    // Everything the form collects, plus the tag/group. The honeypot goes over
    // empty; it was checked above.
    let src = FANCLUB_MAILCHIMP.action;
    ['EMAIL', 'FNAME', 'LNAME', 'COUNTRY', 'PHONE'].forEach(function (name) {
      const field = form.querySelector('[name="' + name + '"]');
      if (field && field.value.trim())
        src += '&' + name + '=' + encodeURIComponent(field.value.trim());
    });
    src += '&' + encodeURIComponent(FANCLUB_MAILCHIMP.botField) + '=';
    if (FANCLUB_MAILCHIMP.tags.length)
      src += '&tags=' + encodeURIComponent(FANCLUB_MAILCHIMP.tags.join(','));
    Object.keys(FANCLUB_MAILCHIMP.groups).forEach(function (group) {
      FANCLUB_MAILCHIMP.groups[group].forEach(function (option) {
        // The brackets are part of the field NAME Mailchimp matches on, so the
        // whole thing is encoded as a unit.
        src +=
          '&' +
          encodeURIComponent('group[' + group + '][' + option + ']') +
          '=1';
      });
    });
    script.src = src + '&c=' + cb;
    document.body.appendChild(script);
  });
}

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
/* ISO 3166-1, already in alphabetical order.

   This list used to be fetched from restcountries.com, which no longer works
   from a browser. Two separate reasons, either one fatal: v3.1 is deprecated
   and now answers every request with a "please migrate" error, and the
   endpoint 301s to a second host whose redirect response carries no CORS
   header, so the request is blocked before it even arrives. The dropdown was
   left holding only the three countries hard-coded in the markup, and nothing
   said so — the fetch failed silently.

   Kept here instead: no third-party call to go stale, and the options are in
   the DOM on the first frame. */
const COUNTRIES = [
  'Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa',
  'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia',
  'Bonaire, Sint Eustatius and Saba', 'Bosnia and Herzegovina', 'Botswana',
  'Bouvet Island', 'Brazil', 'British Indian Ocean Territory',
  'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde',
  'Cambodia', 'Cameroon', 'Canada', 'Cayman Islands',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island',
  'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo',
  'Congo, The Democratic Republic of the', 'Cook Islands', 'Costa Rica',
  'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czechia',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
  'Ethiopia', 'Falkland Islands (Malvinas)', 'Faroe Islands', 'Fiji',
  'Finland', 'France', 'French Guiana', 'French Polynesia',
  'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany',
  'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe',
  'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Heard Island and McDonald Islands',
  'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte',
  'Mexico', 'Micronesia, Federated States of', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'North Korea',
  'North Macedonia', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine, State of', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico',
  'Qatar', 'Réunion', 'Romania', 'Russian Federation', 'Rwanda',
  'Saint Barthélemy', 'Saint Helena, Ascension and Tristan da Cunha',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin (French part)',
  'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten (Dutch part)',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Georgia and the South Sandwich Islands', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Svalbard and Jan Mayen', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Türkiye', 'Turkmenistan',
  'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States',
  'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Venezuela', 'Vietnam', 'Virgin Islands, British', 'Virgin Islands, U.S.',
  'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe',
];

function setCountryList() {
  const select = document.querySelector("select[name='COUNTRY']");
  if (!select) return;

  /* The markup ships US/Canada/UK so the field still works if this never runs.
     They come out here so the full list doesn't list them twice. The empty
     "select your country" option has no value and stays. */
  [...select.querySelectorAll('option')]
    .filter((option) => option.value)
    .forEach((option) => option.remove());

  const fragment = document.createDocumentFragment();
  COUNTRIES.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    fragment.appendChild(option);
  });
  select.appendChild(fragment);
}
/* Walks the "This Feeling" wordmark around the rim of the fisheye circle in
   the background photo.

   The circle is part of the photo, so its position on screen is whatever
   `background-size: cover` makes it: the photo is scaled by the larger of the
   two viewport/photo ratios and centred, and the circle rides along. These
   numbers are measured off /images/background-image-fisheye.jpg — if that photo
   is ever swapped out, re-measure them. */
const FISHEYE = {
  width: 2666,
  height: 1500,
  centerX: 0.5004, // circle centre, as a fraction of the photo
  centerY: 0.491,
  radius: 627, // in photo pixels
};
const ORBIT_SECONDS = 26;
/* Wordmark width as a share of the circle's diameter. */
const ORBIT_SIZE = 0.26;

function orbitThisFeeling() {
  const $orbiter = document.getElementById('orbit-this-feeling');
  if (!$orbiter) return;

  let orbit = null;

  const measure = () => {
    const { innerWidth: viewW, innerHeight: viewH } = window;
    const scale = Math.max(viewW / FISHEYE.width, viewH / FISHEYE.height);

    orbit = {
      // `cover` centres the photo, so offsets are measured from photo centre.
      x: viewW / 2 + (FISHEYE.centerX - 0.5) * FISHEYE.width * scale,
      y: viewH / 2 + (FISHEYE.centerY - 0.5) * FISHEYE.height * scale,
      radius: FISHEYE.radius * scale,
    };
    $orbiter.style.width = `${orbit.radius * 2 * ORBIT_SIZE}px`;
  };

  /* Kept upright rather than turned to follow the curve — it is a wordmark, and
     tangent to the circle it reads upside down across the bottom half. */
  const draw = (milliseconds) => {
    const angle =
      (milliseconds / (ORBIT_SECONDS * 1000)) * Math.PI * 2 - Math.PI / 2;
    const x = orbit.x + Math.cos(angle) * orbit.radius;
    const y = orbit.y + Math.sin(angle) * orbit.radius;
    $orbiter.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  };

  /* Placed once up front as well as on every frame: requestAnimationFrame does
     not run in a hidden tab, and without a starting position the wordmark would
     be parked in the top-left corner when that tab is brought forward. */
  let lastMilliseconds = 0;
  const place = () => {
    measure();
    draw(lastMilliseconds);
  };

  place();
  window.addEventListener('resize', place);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const step = (milliseconds) => {
    lastMilliseconds = milliseconds;
    draw(milliseconds);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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
/* The icons ship `hidden` in the markup, so nothing is on screen until the
   bucket file has been read. Only the ones it gives a link to are revealed, and
   they are re-appended in its key order — so the bucket file decides both which
   icons appear and the order they sit in. */
function setSocials() {
  const socialLinks = data['social-links'];

  if (socialLinks === undefined) {
    return;
  }

  const $$socials = [...$social.querySelectorAll('a[aria-label]')];

  // Dropped rather than left hidden: the row is spaced with an `a + a` rule,
  // which would otherwise indent the first icon that is actually visible.
  const live = Object.keys(socialLinks).filter((name) => socialLinks[name]);
  $$socials
    .filter(($) => !live.includes($.getAttribute('aria-label')))
    .forEach(($) => $.remove());

  live.forEach((name) => {
    const $link = $$socials.find(($) => $.getAttribute('aria-label') === name);
    if ($link === undefined) {
      return;
    }
    $link.href = socialLinks[name];
    $link.hidden = false;
    $social.appendChild($link); // re-appending in order sets the on-screen order
  });
}
function setLinks() {
  const $$links = [...$links.querySelectorAll('a')];

  ['music', 'video'].forEach((key) => {
    const link = data[key];
    const $link = $$links.find(($link) => $link.classList.contains(key));
    if ([link, $link].includes(undefined)) {
      return;
    }
    $link.href = link;
  });

  // Set from the data rather than from the nav link, so "listen here" still
  // works if the Music link is switched off in FEATURES but this block is not.
  if ($listenHere !== undefined && data.music !== undefined) {
    $listenHere.href = data.music;
  }
}

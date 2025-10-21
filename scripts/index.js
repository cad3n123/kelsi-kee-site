document.addEventListener('DOMContentLoaded', function () {
  const rsvpForm = document.getElementById('mc-embedded-subscribe-form');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      // --- VALIDATION CHECK ---
      // We run this check in a tiny delay (1ms) to let
      // the Mailchimp validator (mc-validate.js) run FIRST.
      setTimeout(function () {
        // The validator adds an 'error' class to any invalid field.
        // We check if any field with that class exists.
        const hasErrors = rsvpForm.querySelector('input.error, select.error');

        // If there ARE errors, stop! Let the user see the form
        // and the Mailchimp error messages.
        if (hasErrors) {
          return;
        }

        // --- YOUR CODE ---
        // If there are NO errors, go ahead and show "submitting..."
        // and the "thank you" message.
        const submitBtn = document.getElementById('submit');
        submitBtn.innerHTML = 'submitting...';
        submitBtn.disabled = true;
        submitBtn.style.color = '#808080';

        // Show the "thank you" message
        setTimeout(function () {
          document.getElementById('mc-embedded-subscribe-form').style.display =
            'none';
          document.getElementById('thankyou').style.display = 'block';
        }, 500);
      }, 1); // 1ms delay is all we need
    });
  }
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

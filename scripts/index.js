document.addEventListener('DOMContentLoaded', function () {
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
        document.getElementById('mc-embedded-subscribe-form').style.display =
          'none';
        document.getElementById('thankyou').style.display = 'block';
      }, 500);
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

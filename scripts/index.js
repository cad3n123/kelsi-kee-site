document.addEventListener('DOMContentLoaded', function () {
  const rsvpForm = document.getElementById('invitation-rsvp');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = document.getElementById('submit');
      submitBtn.innerHTML = 'submitting...';
      submitBtn.disabled = true;
      submitBtn.style.color = '#808080';

      // Original third-party AJAX call removed.
      // This simulates a successful form submission for the UI.
      console.log('Form submission captured. Backend endpoint removed.');
      setTimeout(function () {
        document.getElementById('invitation-rsvp').style.display = 'none';
        document.getElementById('thankyou').style.display = 'block';
      }, 500); // Adding a small delay to mimic a network request
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

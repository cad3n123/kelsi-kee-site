document.addEventListener('DOMContentLoaded', function () {
  const rsvpForm = document.getElementById('mc-embedded-subscribe-form');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      // Use a timeout of 0ms.
      // This is a common trick to push this function to the
      // end of the browser's "to-do" list.
      // This GUARANTEES it will run AFTER Mailchimp's
      // validation script has already finished.
      setTimeout(function () {
        // e.defaultPrevented is a built-in browser property.
        // If Mailchimp's script (or any other script) called
        // e.preventDefault() to stop the submission, this will be true.
        if (e.defaultPrevented) {
          // VALIDATION FAILED!
          // Mailchimp stopped the submit, so we do nothing
          // and let the user see the errors.
          return;
        }

        // --- YOUR CODE ---
        // If we get here, e.defaultPrevented was false.
        // This means validation PASSED and the form is
        // really submitting to Mailchimp.
        // So, now we can safely show the "thank you" message.

        const submitBtn = document.getElementById('submit');
        submitBtn.innerHTML = 'submitting...';
        submitBtn.disabled = true;
        submitBtn.style.color = '#808080';

        // Show the "thank you" message
        setTimeout(function () {
          document.getElementById('mc-embedded-subscribe-form').style.display =
            'none';
          document.getElementById('thankyou').style.display = 'block';
        }, 500); // Your 500ms aesthetic delay is perfectly fine
      }, 0); // 0ms delay is the key
    });
  }

  // ... (rest of your file)
  // function changeOpacity(...)
  // const element = ...
  // etc.
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

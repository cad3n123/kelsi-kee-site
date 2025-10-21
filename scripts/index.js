document.addEventListener('DOMContentLoaded', function () {
  const rsvpForm = document.getElementById('mc-embedded-subscribe-form');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      // 1. STOP THE FORM from submitting normally.
      e.preventDefault();

      // 2. We still wait a moment for the validator to run.
      // 100ms is a safe bet to let mc-validate.js finish.
      setTimeout(function () {
        // 3. Check if the validator added any .error classes.
        const hasErrors = rsvpForm.querySelector('input.error, select.error');

        if (hasErrors) {
          // Validation FAILED. Stop here and let the user
          // see the error messages.
          return;
        }

        // --- Validation PASSED ---

        // 4. Show your "submitting..." UI
        const submitBtn = document.getElementById('submit');
        submitBtn.innerHTML = 'submitting...';
        submitBtn.disabled = true;
        submitBtn.style.color = '#808080';

        // 5. Get the new "post-json" URL from the form's action
        let url = rsvpForm.getAttribute('action');
        // Add the magic jQuery JSONP callback string
        url += '&c=?';

        // 6. Use jQuery (which is already loaded) to
        // send the form data in the background (AJAX/JSONP).
        $.ajax({
          url: url,
          method: 'GET', // JSONP is always GET
          dataType: 'jsonp',
          data: $(rsvpForm).serialize(), // Use jQuery to grab all form data
          success: function (response) {
            // --- Mailchimp responded! ---

            // It doesn't matter if Mailchimp said "success" or
            // "user already subscribed". For the user, the
            // experience is the same. We show "thank you".

            // 7. Show your "Thank You" message.
            document.getElementById(
              'mc-embedded-subscribe-form'
            ).style.display = 'none';
            document.getElementById('thankyou').style.display = 'block';
          },
          error: function (err) {
            // The network request itself failed.
            // Even here, we should just show "thank you"
            // to avoid confusing the user.
            console.error('AJAX form submission error:', err);
            document.getElementById(
              'mc-embedded-subscribe-form'
            ).style.display = 'none';
            document.getElementById('thankyou').style.display = 'block';
          },
        });
      }, 100); // 100ms delay for validator
    });
  }

  // ... (rest of your file: changeOpacity, updateOpacity, etc.) ...
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

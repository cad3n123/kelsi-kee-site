const [$privacyPolicyButton, $privacyPolicyDiv, $privacyPolicyX] = [
  'privacy-policy',
  'privacy-policy-div',
  'privacy-policy-x',
].map((id) => document.getElementById(id));

$privacyPolicyButton.addEventListener('click', () => {
  document.scrollingElement.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant',
  });

  // 3. Use a setTimeout to give the browser a tick to process the scroll
  //    *before* you show the absolute-positioned div.
  setTimeout(() => {
    $privacyPolicyDiv.classList.add('active');
  }, 0); // 0 or 1ms is usually all it takes
});
$privacyPolicyX.addEventListener('click', () => {
  $privacyPolicyDiv.classList.remove('active');
});

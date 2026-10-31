(function () {
  'use strict';
  var f = document.getElementById('contact');
  if (!f) return;
  var endpoint = f.getAttribute('data-endpoint');
  if (!endpoint) return;               // stays hidden until an endpoint is configured
  f.hidden = false;
  var status = document.getElementById('contact-status');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (f._gotcha && f._gotcha.value) return;
    status.textContent = 'Sending…';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: f.email.value, message: f.message.value, _gotcha: f._gotcha.value })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      f.reset(); status.textContent = 'Thanks, your message has been sent.';
    }).catch(function () {
      status.textContent = 'Sorry, that did not send. Please try again later.';
    });
  });
})();

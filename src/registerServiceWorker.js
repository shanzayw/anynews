/* eslint-disable no-console */

import { register } from 'register-service-worker'

let callbacks = {
  registrationOptions: { scope: './' },
  ready () {
    console.log(
      'SW: App is being served from cache by a service worker.\n' +
      'For more details, visit https://goo.gl/AFskqB'
    );
    var updatedEvent = new CustomEvent('swUpdated', {});
    document.dispatchEvent(updatedEvent);
  },
  registered () {
    console.log('SW: Service worker has been registered.')
  },
  cached () {
    console.log('SW: Content has been cached for offline use.')
  },
  updatefound () {
    console.log('SW: New content is downloading...')
  },
  updated (registration) {
    console.log('SW: New content is available; please refresh! Ask user!');

    // App may not have been created yet, so store a copy in document and fetch in "mounted()"!
    document.pendingAppUpdate = registration;

    var updateEvent = new CustomEvent('swUpdateAvailable', { detail: registration });
    document.dispatchEvent(updateEvent);
  },
  offline () {
    console.log('SW: No internet connection found. App is running in offline mode.')
  },
  error (error) {
    console.error('SW: Error during service worker registration:', error)
  }
}

console.log("Registering service worker");
if (process.env.NODE_ENV === 'production') {
  register("./service-worker.js", callbacks);
} else {
  register("./service-worker-debug.js", callbacks);
}

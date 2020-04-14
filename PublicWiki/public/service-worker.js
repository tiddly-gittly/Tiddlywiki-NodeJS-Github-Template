importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉Service Worker is working!`);
} else {
  console.log(`Boo! Workbox didn't load 😬Service Worker won't work properly...`);
}

const { registerRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, matchPrecache } = workbox.precaching;

// seems syncadaptor will fetch these files, we rename them to cached version
addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.url.endsWith('/%24%3A%2Fcore%2Ftemplates%2Ftiddlywiki5.js')) {
    event.respondWith(matchPrecache('tiddlywiki5.js'));
  } else if (request.url.endsWith('/status')) {
    event.respondWith(matchPrecache('status.json'));
  } else if (request.url.endsWith('/recipes/default/tiddlers.json')) {
    event.respondWith(matchPrecache('tiddlers.json'));
  }
  return;
});

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  /\.css$/,
  // Use cache but update in the background.
  new StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: 'css-cache',
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|woff2?|ttf)$/,
  // Use the cache if it's available.
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        // Cache only a few images.
        maxEntries: 100,
        // Cache for a maximum of a week.
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(/\.js$/, new StaleWhileRevalidate());
registerRoute(/(^\/$|index.html)/, new StaleWhileRevalidate());

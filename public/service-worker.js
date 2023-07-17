importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.4/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉Service Worker is working!`);
} else {
  console.log(`Boo! Workbox didn't load 😬Service Worker won't work properly...`);
}

const { registerRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, matchPrecache } = workbox.precaching;

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


/*
可选的html缓存策略，StaleWhileRevalidate、NetworkFirst

StaleWhileRevalidate：当请求的路由有对应的Cache缓存结果就直接返回，
在返回Cache缓存结果的同时会在后台发起网络请求拿到请求结果并更新Cache缓存，
如果本来就没有Cache缓存的话，就直接发起网络请求并返回结果，
这对用户来说是一种非常安全的策略.

NetworkFirst：当请求的路由是被匹配的，就采用网络优先的策略，也就是
优先尝试拿到网络请求的返回结果，如果拿到网络请求的结果，就将结果返回
给客户端并且写入Cache缓存，如果网络请求失败，那最后被缓存的Cache缓
存结果就会被返回到客户端，这种策略一般适用于返回结果不太固定或对实时性
有要求的请求，为网络请求失败进行兜底。
 */
registerRoute(/(^\/$|index.html)/, new StaleWhileRevalidate());

/**
 * NanoMarketCap widget auto-fit: the embed page posts its real height
 * (width-dependent: widgets compact below 380px), and this script applies it
 * to the matching iframe. Include right after any widget iframe:
 *
 *   <script src="https://nanomarketcap.com/widgets/embed.js" defer></script>
 *
 * The fixed height attribute stays as a no-JS / blocked-script fallback.
 */
(function () {
  'use strict'
  window.addEventListener('message', function (event) {
    var data = event.data
    if (!data || data.type !== 'nmc-widget-resize') return
    var height = Math.round(Number(data.height))
    if (!(height >= 100 && height <= 800)) return
    var frames = document.querySelectorAll('iframe[src*="/widgets/embed/"]')
    Array.prototype.forEach.call(frames, function (frame) {
      if (event.source === frame.contentWindow) {
        frame.style.height = height + 'px'
      }
    })
  })
})()

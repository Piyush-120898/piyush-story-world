import assert from 'node:assert/strict';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const home = await fetch(base);
assert.equal(home.status, 200);
assert((await home.text()).includes('Animated stories.'));
for (const asset of ['styles.css', 'main.js', 'site-config.js', 'assets/story-world.webp', 'assets/story-world-small.webp', 'assets/fonts/dm-serif-display-italic.ttf', 'assets/the-smile-story-poster.jpg', 'assets/comfort-at-home-poster.jpg']) {
  assert.equal((await fetch(`${base}/${asset}`, { method: 'HEAD' })).status, 200, asset);
}
for (const film of ['the-smile-story', 'comfort-at-home']) {
  const response = await fetch(`${base}/assets/${film}.mp4`, { headers: { Range: 'bytes=0-1023' } });
  assert.equal(response.status, 206, 'Video seeking requires byte-range support');
  assert.equal(response.headers.get('content-type'), 'video/mp4');
  assert.equal((await response.arrayBuffer()).byteLength, 1024);
}
assert.equal((await fetch(`${base}/missing-file`)).status, 404);
console.log('HTTP smoke checks passed: page, styles, JavaScript, artwork, fonts, posters, and byte-range streaming for both videos.');

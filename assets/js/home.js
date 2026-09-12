'use strict';
const menuButton = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const mobileMenu = window.matchMedia('(max-width: 768px)');
function setMenu(open) {
  menuButton.classList.toggle('active', open);
  navLinks.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  navLinks.inert = mobileMenu.matches && !open;
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navLinks.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => {
  if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false); menuButton.focus();
  }
});
mobileMenu.addEventListener('change', () => setMenu(false));
setMenu(false);
const reader = document.getElementById('comic-reader');
const comics = Array.from(document.querySelectorAll('[data-comic]'));
const readerImage = document.getElementById('reader-image');
const readerPrev = document.getElementById('reader-prev');
const readerNext = document.getElementById('reader-next');
let comicIndex = 0;
let readerTrigger = null;
function showComic(index) {
  comicIndex = index;
  const comic = comics[index];
  readerImage.src = comic.getAttribute('href');
  readerImage.alt = comic.querySelector('img').alt;
  document.getElementById('reader-title').textContent = comic.dataset.title;
  document.getElementById('reader-date').textContent = comic.dataset.date;
  document.getElementById('reader-counter').textContent = `${index + 1} / ${comics.length}`;
  readerPrev.disabled = index === 0;
  readerNext.disabled = index === comics.length - 1;
  reader.scrollTop = 0;
}
comics.forEach((comic, index) => comic.addEventListener('click', event => {
  if (typeof reader.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); readerTrigger = comic; showComic(index);
  reader.showModal(); document.body.classList.add('reader-open');
  document.getElementById('reader-close').focus();
}));
document.getElementById('reader-close').addEventListener('click', () => reader.close());
readerPrev.addEventListener('click', () => { if (comicIndex > 0) showComic(comicIndex - 1); });
readerNext.addEventListener('click', () => { if (comicIndex < comics.length - 1) showComic(comicIndex + 1); });
reader.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && comicIndex > 0) { event.preventDefault(); showComic(comicIndex - 1); }
  if (event.key === 'ArrowRight' && comicIndex < comics.length - 1) { event.preventDefault(); showComic(comicIndex + 1); }
});
reader.addEventListener('click', event => {
  if (event.target !== reader) return;
  const rect = reader.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) reader.close();
});
reader.addEventListener('close', () => { document.body.classList.remove('reader-open'); readerTrigger?.focus(); });

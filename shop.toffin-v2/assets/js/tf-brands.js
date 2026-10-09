/* =====================================================================
   Toffin v2 · tf-brands.js — halaman Brand: cari + filter kategori di klien.
   Vanilla JS, tanpa jQuery. Membaca ?q= dan ?cat= (kunci grup chip) dari URL.
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('.tf-brands');
	if (!root) return;
	var input = root.querySelector('[data-tf-brands-input]');
	var chips = Array.prototype.slice.call(root.querySelectorAll('[data-tf-brands-cat]'));
	var cards = Array.prototype.slice.call(root.querySelectorAll('[data-tf-brands-card]'));
	var count = root.querySelector('[data-tf-brands-count]');
	var total = root.querySelector('[data-tf-brands-total]');
	var empty = root.querySelector('[data-tf-brands-empty]');
	var resets = Array.prototype.slice.call(root.querySelectorAll('[data-tf-brands-reset]'));
	var cat = 'all';

	if (total) total.textContent = cards.length;

	function norm(v) { return String(v || '').toLowerCase().trim(); }

	function render() {
		var q = norm(input && input.value), shown = 0;
		cards.forEach(function (c) {
			var ok = (cat === 'all' || c.getAttribute('data-cat') === cat)
				&& (!q || norm(c.getAttribute('data-name')).indexOf(q) !== -1);
			c.hidden = !ok;
			if (ok) shown++;
		});
		if (count) count.textContent = shown;
		if (empty) empty.hidden = shown !== 0;
	}
	function setCat(k) {
		cat = chips.some(function (c) { return c.getAttribute('data-tf-brands-cat') === k; }) ? k : 'all';
		chips.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-tf-brands-cat') === cat); });
	}

	chips.forEach(function (c) { c.addEventListener('click', function () { setCat(c.getAttribute('data-tf-brands-cat')); render(); }); });
	if (input) input.addEventListener('input', render);
	resets.forEach(function (b) { b.addEventListener('click', function () {
		if (input) input.value = '';
		setCat('all');
		render();
		if (input) input.focus();
	}); });

	/* prefill dari URL: brand.html?q=hario atau brand.html?cat=mesin */
	var params = {};
	location.search.replace(/^\?/, '').split('&').forEach(function (p) {
		if (!p) return;
		var i = p.indexOf('='), k = decodeURIComponent(i < 0 ? p : p.slice(0, i)), v = i < 0 ? '' : decodeURIComponent(p.slice(i + 1).replace(/\+/g, ' '));
		params[k] = v;
	});
	if (input && params.q) input.value = params.q;
	if (params.cat) setCat(params.cat);
	render();
}());

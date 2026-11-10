/*
	HamfiSceneDetect (HamfiSD) — landing page · Plan B
	Navigation: tab strip anchored to the bottom of the hero, pinned on scroll.
*/

(function () {
	'use strict';

	var nav = document.getElementById('nav');
	var header = document.getElementById('header');
	var main = document.getElementById('main');
	var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('ul a[href^="#"]')) : [];
	var sections = links.map(function (link) {
		return document.querySelector(link.getAttribute('href'));
	}).filter(function (section) {
		return !!section;
	});

	function sectionTop(section) {
		return section.getBoundingClientRect().top + window.pageYOffset;
	}

	function update() {
		var mainTop = main ? main.getBoundingClientRect().top : 0;

		// Let the hero fill the viewport up to the tab strip, so at first paint the
		// strip's lower edge rests on the bottom edge of the window while staying
		// in the normal page flow (it scrolls together with the content below).
		if (nav && header && !nav.classList.contains('is-stuck')) {
			header.style.minHeight = Math.max(0, window.innerHeight - nav.getBoundingClientRect().height) + 'px';
		}

		if (nav && main) {
			nav.classList.toggle('is-stuck', mainTop <= 8);
		}

		if (!nav || !links.length) {
			return;
		}

		var probe = window.pageYOffset + nav.offsetHeight + Math.round(window.innerHeight * 0.18);
		var current = null;

		sections.forEach(function (section) {
			if (sectionTop(section) <= probe) {
				current = section;
			}
		});

		if (!current) {
			current = sections[0] || null;
		}

		links.forEach(function (link) {
			var target = document.querySelector(link.getAttribute('href'));
			link.classList.toggle('active', target === current);
		});
	}

	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	window.addEventListener('load', update);

	// Re-measure once late-loading images have changed the document height.
	if ('ResizeObserver' in window) {
		new ResizeObserver(update).observe(document.body);
	}

	links.forEach(function (link) {
		link.addEventListener('click', function () {
			links.forEach(function (other) {
				other.classList.remove('active');
			});
			link.classList.add('active');
		});
	});

	// Download dropdown (Windows / macOS / Linux).
	var downloadMenu = document.querySelector('.download-menu');
	var downloadToggle = downloadMenu ? downloadMenu.querySelector('.download-toggle') : null;

	if (downloadMenu && downloadToggle) {
		var setDownloadOpen = function (open) {
			downloadMenu.classList.toggle('is-open', open);
			downloadToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		};

		downloadToggle.addEventListener('click', function (event) {
			event.stopPropagation();
			setDownloadOpen(!downloadMenu.classList.contains('is-open'));
		});

		downloadMenu.addEventListener('click', function (event) {
			if (event.target.closest('a')) {
				setDownloadOpen(false);
			}
		});

		document.addEventListener('click', function (event) {
			if (!downloadMenu.contains(event.target)) {
				setDownloadOpen(false);
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				setDownloadOpen(false);
			}
		});
	}

	update();

	// Click-to-zoom preview for the output media (opens at native resolution).
	var lightbox = document.getElementById('lightbox');
	var lightboxImg = lightbox ? lightbox.querySelector('img') : null;

	if (lightbox && lightboxImg) {
		var closeLightbox = function () {
			lightbox.classList.remove('is-open');
			lightbox.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('lightbox-open');
		};

		Array.prototype.forEach.call(document.querySelectorAll('[data-zoom]'), function (media) {
			var source = media.querySelector('img') || media;

			media.addEventListener('click', function () {
				lightboxImg.src = source.currentSrc || source.getAttribute('src');
				lightboxImg.alt = source.getAttribute('alt') || '';
				lightbox.classList.add('is-open');
				lightbox.setAttribute('aria-hidden', 'false');
				document.body.classList.add('lightbox-open');
			});

			media.addEventListener('contextmenu', function (event) {
				event.preventDefault();
			});

			media.addEventListener('dragstart', function (event) {
				event.preventDefault();
			});
		});

		lightbox.addEventListener('click', function (event) {
			if (event.target === lightbox || event.target === lightboxImg || event.target.closest('.lightbox-close')) {
				closeLightbox();
			}
		});

		lightbox.addEventListener('contextmenu', function (event) {
			event.preventDefault();
		});

		lightbox.addEventListener('dragstart', function (event) {
			event.preventDefault();
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
				closeLightbox();
			}
		});
	}

	// Only play the sample video while it is on screen.
	var videos = document.querySelectorAll('video');

	if (videos.length && 'IntersectionObserver' in window) {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.play().catch(function () {});
				} else {
					entry.target.pause();
				}
			});
		}, { threshold: 0.35 });

		Array.prototype.forEach.call(videos, function (video) {
			observer.observe(video);
		});
	}
})();

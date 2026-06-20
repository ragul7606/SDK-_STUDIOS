// ===== SDK EDITS — Main Script =====
const ADMIN_PASSWORD = 'ok';
let isAdmin = false;

// ===== DEFAULT DATA =====
const DEFAULT_OFFERS = [
  {
    id: '1', name: 'Starter', price: '₹499', per: '/project',
    features: ['3 Photo edits', 'Basic color grading', 'High-res delivery', '1 Revision'],
    featured: false
  },
  {
    id: '2', name: 'Pro Package', price: '₹1,499', per: '/project',
    features: ['10 Photo edits', 'Video editing (up to 3 min)', 'Advanced color grading', 'Sound design', '3 Revisions'],
    featured: true
  },
  {
    id: '3', name: 'Premium', price: '₹3,999', per: '/month',
    features: ['Unlimited photo edits', 'Video editing (up to 10 min)', 'Basic VFX', 'Priority delivery', 'Unlimited revisions'],
    featured: false
  }
];

const DEFAULT_PROFILE = {
  name: 'SDK EDITS',
  tagline: 'Crafting Visual Stories — Photo Editing · Video Editing · VFX',
  whatsapp: '7708509295',
  instagram: 'https://www.instagram.com/sdk_edits_official'
};

// ===== STORAGE HELPERS =====
function getData(key, fallback) {
  try {
    const d = localStorage.getItem('sdk_' + key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}
function setData(key, val) {
  localStorage.setItem('sdk_' + key, JSON.stringify(val));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadGallery();
  loadOffers();
  loadFeedback();
  initScrollAnimations();
  initNavScroll();
  initFilters();
});

// ===== PROFILE =====
function loadProfile() {
  const profile = getData('profile', DEFAULT_PROFILE);
  if (profile.photo) document.getElementById('profilePhoto').src = profile.photo;
  if (profile.name) {
    document.getElementById('heroName').innerHTML = 'Welcome to <span class="gold">' + escapeHtml(profile.name) + '</span>';
  }
  if (profile.tagline) document.getElementById('heroTagline').textContent = profile.tagline;
  if (profile.whatsapp) {
    let phone = profile.whatsapp.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }
    document.getElementById('whatsappLink').href = 'https://wa.me/' + phone;
  }
  if (profile.instagram) {
    const ig = document.getElementById('instagramLink');
    let igUrl = profile.instagram.trim();
    if (!igUrl.startsWith('http://') && !igUrl.startsWith('https://')) {
      igUrl = 'https://instagram.com/' + igUrl;
    }
    ig.href = igUrl;

    let handle = profile.instagram.trim();
    if (handle.includes('instagram.com/')) {
      const parts = handle.split('instagram.com/');
      if (parts[1]) {
        handle = parts[1].split('/')[0].split('?')[0];
      }
    }
    ig.querySelector('p').textContent = 'Follow us @' + handle;
  }
}

function saveProfile() {
  const profile = getData('profile', DEFAULT_PROFILE);
  const name = document.getElementById('editName').value.trim();
  const tagline = document.getElementById('editTagline').value.trim();
  const whatsapp = document.getElementById('editWhatsApp').value.trim();
  const instagram = document.getElementById('editInstagram').value.trim();
  const fileInput = document.getElementById('editPhoto');

  if (name) profile.name = name;
  if (tagline) profile.tagline = tagline;
  if (whatsapp) profile.whatsapp = whatsapp;
  if (instagram) profile.instagram = instagram;

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profile.photo = e.target.result;
      setData('profile', profile);
      loadProfile();
      closeModal('editProfileModal');
      showToast('Profile updated!');
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    setData('profile', profile);
    loadProfile();
    closeModal('editProfileModal');
    showToast('Profile updated!');
  }
}

// ===== GALLERY =====
function loadGallery(filter) {
  filter = filter || 'all';
  const works = getData('works', []);
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('emptyGallery');

  // Remove existing items (keep empty msg)
  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

  const filtered = filter === 'all' ? works : works.filter(w => w.type === filter);

  if (filtered.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    filtered.forEach((work, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item reveal visible';
      item.setAttribute('data-type', work.type);
      item.style.animationDelay = (i * 0.05) + 's';

      if (work.type === 'video') {
        item.innerHTML = `
          <video src="${work.data}" muted preload="metadata"></video>
          <div class="overlay"><span style="color:#fff;font-weight:600">▶ ${escapeHtml(work.title || 'Video')}</span></div>
          <button class="delete-btn" onclick="event.stopPropagation();deleteWork('${work.id}')">&times;</button>
        `;
        item.onclick = () => openLightbox(work.data, 'video');
      } else {
        item.innerHTML = `
          <img src="${work.data}" alt="${escapeHtml(work.title || 'Photo')}" loading="lazy">
          <div class="overlay"><span style="color:#fff;font-weight:600">${escapeHtml(work.title || '')}</span></div>
          <button class="delete-btn" onclick="event.stopPropagation();deleteWork('${work.id}')">&times;</button>
        `;
        item.onclick = () => openLightbox(work.data, 'photo');
      }
      grid.appendChild(item);
    });
  }
}

function addWork() {
  const type = document.getElementById('workType').value;
  const title = document.getElementById('workTitle').value.trim();
  const fileInput = document.getElementById('workFile');

  if (!fileInput.files[0]) { showToast('Please select a file'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const works = getData('works', []);
    works.push({
      id: Date.now().toString(),
      type: type,
      title: title,
      data: e.target.result
    });
    setData('works', works);
    loadGallery();
    closeModal('addWorkModal');
    document.getElementById('workFile').value = '';
    document.getElementById('workTitle').value = '';
    showToast('Work added!');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deleteWork(id) {
  if (!confirm('Delete this work?')) return;
  const works = getData('works', []).filter(w => w.id !== id);
  setData('works', works);
  loadGallery();
  showToast('Work deleted');
}

// ===== OFFERS =====
function loadOffers() {
  const offers = getData('offers', DEFAULT_OFFERS);
  if (!localStorage.getItem('sdk_offers')) setData('offers', DEFAULT_OFFERS);
  const grid = document.getElementById('offersGrid');
  grid.innerHTML = '';

  offers.forEach(offer => {
    const card = document.createElement('div');
    card.className = 'offer-card reveal visible' + (offer.featured ? ' featured' : '');
    card.innerHTML = `
      <div class="admin-controls">
        <button class="edit-offer-btn" onclick="openEditOffer('${offer.id}')">✎</button>
        <button class="delete-offer-btn" onclick="deleteOffer('${offer.id}')">&times;</button>
      </div>
      <h3>${escapeHtml(offer.name)}</h3>
      <div class="offer-price">${escapeHtml(offer.price)} <span>${escapeHtml(offer.per || '')}</span></div>
      <ul class="offer-features">
        ${offer.features.map(f => '<li>' + escapeHtml(f) + '</li>').join('')}
      </ul>
      <a href="#contact" class="offer-btn">Get Started</a>
    `;
    grid.appendChild(card);
  });
}

function openAddOfferModal() {
  document.getElementById('offerModalTitle').textContent = 'Add Offer';
  document.getElementById('editOfferId').value = '';
  document.getElementById('offerName').value = '';
  document.getElementById('offerPrice').value = '';
  document.getElementById('offerPer').value = '';
  document.getElementById('offerFeatures').value = '';
  document.getElementById('offerFeatured').checked = false;
  openModal('offerModal');
}

function openEditOffer(id) {
  const offers = getData('offers', []);
  const offer = offers.find(o => o.id === id);
  if (!offer) return;
  document.getElementById('offerModalTitle').textContent = 'Edit Offer';
  document.getElementById('editOfferId').value = id;
  document.getElementById('offerName').value = offer.name;
  document.getElementById('offerPrice').value = offer.price;
  document.getElementById('offerPer').value = offer.per || '';
  document.getElementById('offerFeatures').value = offer.features.join('\n');
  document.getElementById('offerFeatured').checked = offer.featured;
  openModal('offerModal');
}

function saveOffer() {
  const id = document.getElementById('editOfferId').value;
  const name = document.getElementById('offerName').value.trim();
  const price = document.getElementById('offerPrice').value.trim();
  const per = document.getElementById('offerPer').value.trim();
  const features = document.getElementById('offerFeatures').value.trim().split('\n').filter(f => f.trim());
  const featured = document.getElementById('offerFeatured').checked;

  if (!name || !price) { showToast('Name and price are required'); return; }

  const offers = getData('offers', DEFAULT_OFFERS);

  if (id) {
    const idx = offers.findIndex(o => o.id === id);
    if (idx > -1) offers[idx] = { id, name, price, per, features, featured };
  } else {
    offers.push({ id: Date.now().toString(), name, price, per, features, featured });
  }

  setData('offers', offers);
  loadOffers();
  closeModal('offerModal');
  showToast(id ? 'Offer updated!' : 'Offer added!');
}

function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  const offers = getData('offers', []).filter(o => o.id !== id);
  setData('offers', offers);
  loadOffers();
  showToast('Offer deleted');
}

// ===== FEEDBACK =====
function loadFeedback() {
  const items = getData('feedback', []);
  const grid = document.getElementById('feedbackGrid');
  const empty = document.getElementById('emptyFeedback');

  grid.querySelectorAll('.feedback-item').forEach(el => el.remove());

  if (items.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'feedback-item reveal visible';
      div.innerHTML = `
        <img src="${item.data}" alt="Client feedback" loading="lazy" onclick="openLightbox('${item.data}','photo')">
        <button class="delete-btn" onclick="deleteFeedback('${item.id}')">&times;</button>
      `;
      grid.appendChild(div);
    });
  }
}

function addFeedback() {
  const fileInput = document.getElementById('feedbackFile');
  if (!fileInput.files[0]) { showToast('Please select a screenshot'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const items = getData('feedback', []);
    items.push({ id: Date.now().toString(), data: e.target.result });
    setData('feedback', items);
    loadFeedback();
    closeModal('addFeedbackModal');
    fileInput.value = '';
    showToast('Feedback added!');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;
  const items = getData('feedback', []).filter(f => f.id !== id);
  setData('feedback', items);
  loadFeedback();
  showToast('Feedback deleted');
}

// ===== ADMIN =====
function openAdminLogin(e) {
  e.preventDefault();
  if (isAdmin) {
    // Toggle admin mode off
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('adminToggleNav').textContent = '⚙ Admin';
    showToast('Admin mode disabled');
    return;
  }
  openModal('adminLoginModal');
}

function adminLogin() {
  const pw = document.getElementById('adminPassword').value;
  if (pw === ADMIN_PASSWORD) {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    document.getElementById('adminToggleNav').textContent = '✕ Exit Admin';
    closeModal('adminLoginModal');
    document.getElementById('adminPassword').value = '';
    showToast('Welcome, Admin!');

    // Show edit profile button in hero
    if (!document.getElementById('editProfileBtn')) {
      const btn = document.createElement('button');
      btn.id = 'editProfileBtn';
      btn.className = 'add-btn';
      btn.style.display = 'inline-flex';
      btn.style.marginTop = '20px';
      btn.textContent = '✎ Edit Profile';
      btn.onclick = () => {
        const profile = getData('profile', DEFAULT_PROFILE);
        document.getElementById('editName').value = profile.name || 'SDK EDITS';
        document.getElementById('editTagline').value = profile.tagline || '';
        document.getElementById('editWhatsApp').value = profile.whatsapp || '';
        document.getElementById('editInstagram').value = profile.instagram || '';
        openModal('editProfileModal');
      };
      document.querySelector('.hero-content').appendChild(btn);
    }
  } else {
    showToast('Wrong password!');
  }
}

// ===== LIGHTBOX =====
function openLightbox(src, type) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const vid = document.getElementById('lightboxVideo');
  if (type === 'video') {
    img.style.display = 'none';
    vid.style.display = 'block';
    vid.src = src;
  } else {
    vid.style.display = 'none';
    vid.pause && vid.pause();
    img.style.display = 'block';
    img.src = src;
  }
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  const vid = document.getElementById('lightboxVideo');
  lb.classList.remove('active');
  vid.pause && vid.pause();
  vid.src = '';
  document.body.style.overflow = '';
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===== FILTERS =====
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadGallery(btn.dataset.filter);
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== NAV SCROLL =====
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link
    const sections = document.querySelectorAll('section[id], .hero[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 150) current = sec.getAttribute('id');
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
// Close on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== HELPERS =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openAddWorkModal() { openModal('addWorkModal'); }
function openAddFeedbackModal() { openModal('addFeedbackModal'); }

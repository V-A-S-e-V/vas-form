import { ALL_COUNTRIES, AFRICAN_COUNTRIES } from './countries-data.js';

// Fetch countries for the dropdowns using a local static dataset.
// This avoids CORS issues from the public API and works in a plain browser static site.
const STORAGE_KEY = "vas_african_countries_v1";
const ALL_STORAGE_KEY = "vas_all_countries_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getCachedCountries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.ts || !parsed.countries) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.countries;
  } catch (e) {
    return null;
  }
}

function getCachedAllCountries() {
  try {
    const raw = localStorage.getItem(ALL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.ts || !parsed.countries) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.countries;
  } catch (e) {
    return null;
  }
}

function setCachedCountries(countries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), countries }));
  } catch (e) {
    // ignore storage errors
  }
}

function setCachedAllCountries(countries) {
  try {
    localStorage.setItem(ALL_STORAGE_KEY, JSON.stringify({ ts: Date.now(), countries }));
  } catch (e) {
    // ignore storage errors
  }
}

function sortCountries(list) {
  return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

async function fetchCountries() {
  const cached = getCachedCountries();
  if (cached) return cached;

  const sorted = sortCountries([...AFRICAN_COUNTRIES]);
  setCachedCountries(sorted);
  return sorted;
}

async function fetchAllCountries() {
  const cached = getCachedAllCountries();
  if (cached) return cached;

  const sorted = sortCountries([...ALL_COUNTRIES]);
  setCachedAllCountries(sorted);
  return sorted;
}

function setSelectLoading(select, text) {
  select.innerHTML = "";
  const opt = document.createElement('option');
  opt.value = "";
  opt.disabled = true;
  opt.selected = true;
  opt.textContent = text;
  select.appendChild(opt);
}

function populateSelect(select, countries) {
  select.innerHTML = "";
  const placeholder = document.createElement('option');
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "Select country...";
  select.appendChild(placeholder);

  countries.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.name; // store full country name as value
    opt.textContent = c.name;
    select.appendChild(opt);
  });

  // Optional 'Other' option
  const other = document.createElement('option');
  other.value = "Other";
  other.textContent = "Other";
  select.appendChild(other);
}

function showError(select) {
  select.innerHTML = "";
  const opt = document.createElement('option');
  opt.value = "";
  opt.disabled = true;
  opt.selected = true;
  opt.textContent = "Unable to load countries";
  select.appendChild(opt);
}

document.addEventListener('DOMContentLoaded', async () => {
  const dropdown = document.getElementById('country-origin-dropdown');
  const listWrap = document.getElementById('cd-list-wrap');
  const listEl = document.getElementById('cd-list');
  const selectedBtn = document.getElementById('cd-selected');
  const hiddenInput = document.getElementById('country-origin-input');
  const hiddenCode = document.getElementById('country-origin-code');
  const searchInput = document.getElementById('cd-search');

  // Fallback: existing plain select
  const selectFallback = document.getElementById('country-origin');

  if (!dropdown && !selectFallback) return;

  if (selectFallback) setSelectLoading(selectFallback, 'Loading countries...');
  if (selectedBtn) selectedBtn.textContent = 'Loading countries...';

  try {
    const countries = await fetchCountries();

    if (selectFallback) populateSelect(selectFallback, countries);

    if (dropdown && listEl && selectedBtn && hiddenInput) {
        buildCustomDropdown({ countries, dropdown, listWrap, listEl, selectedBtn, hiddenInput, hiddenCode, searchInput });
      selectedBtn.textContent = 'Select country...';
    }
  } catch (err) {
    console.error('Error loading countries:', err);
    if (selectFallback) showError(selectFallback);
    if (selectedBtn) selectedBtn.textContent = 'Unable to load countries';
  }
});

// Build nationality dropdown (all countries) if present
document.addEventListener('DOMContentLoaded', async () => {
  const dropdown = document.getElementById('nationality-dropdown');
  const listWrap = document.getElementById('nat-list-wrap');
  const listEl = document.getElementById('nat-list');
  const selectedBtn = document.getElementById('nat-selected');
  const hiddenInput = document.getElementById('nationality-input');
  const hiddenCode = document.getElementById('nationality-code');
  const searchInput = document.getElementById('nat-search');

  if (!dropdown) return;

  if (selectedBtn) selectedBtn.textContent = 'Loading countries...';

  try {
    const countries = await fetchAllCountries();
    buildCustomDropdown({ countries, dropdown, listWrap, listEl, selectedBtn, hiddenInput, hiddenCode, searchInput });
    if (selectedBtn) selectedBtn.textContent = 'Select country...';
  } catch (err) {
    console.error('Error loading all countries:', err);
    if (selectedBtn) selectedBtn.textContent = 'Unable to load countries';
  }
});

function buildCustomDropdown({ countries, dropdown, listWrap, listEl, selectedBtn, hiddenInput, hiddenCode, searchInput }) {
  listEl.innerHTML = '';

  countries.forEach((c) => {
    const li = document.createElement('li');
    li.className = 'cd-item';
    li.tabIndex = 0;
    li.dataset.name = c.name;
    li.dataset.code = c.code;

    const img = document.createElement('img');
    img.className = 'cd-flag';
    img.alt = `${c.name} flag`;
    // Prefer local file: flags/{code}.svg (lowercase). Browser will 404 if missing; set onerror to fallback to remote URL
    const localPath = `flags/${c.code.toLowerCase()}.svg`;
    img.src = localPath;
    img.loading = 'lazy';
    img.width = 20;
    img.height = 14;
    // fallback to remote if local not available
    img.onerror = () => {
      if (c.flag) img.src = c.flag;
      else img.style.display = 'none';
    };

    const span = document.createElement('span');
    span.className = 'cd-name';
    span.textContent = c.name;

    li.appendChild(img);
    li.appendChild(span);

    li.addEventListener('click', () => {
      selectCountry(c.name, c.code, selectedBtn, hiddenInput, hiddenCode, listWrap);
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCountry(c.name, c.code, selectedBtn, hiddenInput, hiddenCode, listWrap);
      }
    });

    listEl.appendChild(li);
  });

  // Search filtering
  if (searchInput) {
    searchInput.value = '';
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      Array.from(listEl.children).forEach((li) => {
        const name = li.dataset.name.toLowerCase();
        li.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  // Toggle open/close
  if (selectedBtn) {
    selectedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = listWrap && listWrap.hasAttribute('hidden') === false;
      if (open) closeList(listWrap, selectedBtn);
      else openList(listWrap, selectedBtn, searchInput);
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      closeList(listWrap, selectedBtn);
    }
  });

  // Keyboard: close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeList(listWrap, selectedBtn);
  });
}

function openList(listWrap, selectedBtn, searchInput) {
  if (!listWrap) return;
  listWrap.removeAttribute('hidden');
  selectedBtn.setAttribute('aria-expanded', 'true');
  if (searchInput) searchInput.focus();
}

function closeList(listWrap, selectedBtn) {
  if (!listWrap) return;
  listWrap.setAttribute('hidden', '');
  selectedBtn.setAttribute('aria-expanded', 'false');
}

function selectCountry(name, code, selectedBtn, hiddenInput, hiddenCode, listWrap) {
  selectedBtn.innerHTML = '';
  const list = document.getElementById('cd-list');
  const li = Array.from(list.children).find((el) => el.dataset.name === name);
  if (li) {
    const flagImg = li.querySelector('img');
    if (flagImg && flagImg.src) {
      const img = document.createElement('img');
      img.src = flagImg.src;
      img.alt = flagImg.alt;
      img.className = 'cd-flag-inline';
      img.width = 20;
      img.height = 14;
      selectedBtn.appendChild(img);
    }
  }
  const span = document.createElement('span');
  span.textContent = ` ${name}`;
  selectedBtn.appendChild(span);

  hiddenInput.value = name;
  if (hiddenCode) hiddenCode.value = code || '';
  closeList(listWrap, selectedBtn);
}

// Export for testing/debugging if needed
export { fetchCountries, getCachedCountries };

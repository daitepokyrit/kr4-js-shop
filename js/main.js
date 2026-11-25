const products = window.PACE_PRODUCTS;

const formatPrice = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const calculateDiscount = (price, percent) => Math.round(price * percent / 100);
const calculateFinalPrice = product => product.price - calculateDiscount(product.price, product.discountPercent);
const getProductStatus = product => product.stock > 0 ? `В наличии: ${product.stock} пар` : 'Нет в наличии';
const createProductSummary = product => `${product.brand} ${product.name}: ${formatPrice(calculateFinalPrice(product))}. ${getProductStatus(product)}.`;
const productCard = product => `<article class="product-card"><a class="product-image" href="product.html?id=${product.id}" aria-label="Подробнее о модели ${product.name}"><picture><source media="(min-width: 1200px)" srcset="${product.image}"><img src="${product.image}" alt="Кроссовки ${product.name}, вид сбоку" width="800" height="650" loading="lazy"></picture><span class="product-category">${product.brand} · ${product.category}</span></a><div class="product-card-info"><div><span class="product-code">PACE / ${String(product.id + 1).padStart(2, '0')}</span><h2><a href="product.html?id=${product.id}">${product.name}</a></h2><p>${product.color}</p><small>${getProductStatus(product)}</small></div><div class="product-card-bottom"><strong>${formatPrice(calculateFinalPrice(product))}</strong><button class="round-link quick-view" type="button" data-quick-view="${product.id}" aria-label="Быстрый просмотр ${product.name}">⌕</button></div><button class="button button-dark add-to-cart" type="button" data-add-cart="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>В корзину</button></div></article>`;

const cartKey = 'pace-cart';
const readCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
const writeCart = cart => { localStorage.setItem(cartKey, JSON.stringify(cart)); updateCartBadges(); renderCartPage(); };
const updateCartBadges = () => document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = String(readCart().reduce((sum, item) => sum + item.quantity, 0)); });
const addToCart = id => { const cart = readCart(); const found = cart.find(item => item.id === id); found ? found.quantity++ : cart.push({ id, quantity: 1 }); writeCart(cart); };
const renderCartPage = () => {
  const root = document.querySelector('[data-cart]'); if (!root) return;
  const cart = readCart().filter(item => products.some(product => product.id === item.id));
  if (!cart.length) { root.innerHTML = '<p class="empty-state">Корзина пока пуста. <a href="catalog.html">Перейти в каталог →</a></p>'; return; }
const total = cart.reduce((sum, item) => sum + calculateFinalPrice(products.find(product => product.id === item.id)) * item.quantity, 0);
  root.innerHTML = `<div class="cart-list">${cart.map(item => { const product = products.find(entry => entry.id === item.id); return `<article class="cart-item"><img src="${product.image}" alt="" width="120" height="100"><div><h2>${product.name}</h2><p>${formatPrice(calculateFinalPrice(product))} · Количество: <button type="button" data-cart-qty="${product.id}" data-delta="-1" aria-label="Уменьшить количество ${product.name}">−</button> ${item.quantity} <button type="button" data-cart-qty="${product.id}" data-delta="1" aria-label="Увеличить количество ${product.name}">+</button></p></div><button type="button" data-remove-cart="${product.id}">Удалить</button></article>`; }).join('')}</div><div class="cart-total"><strong>Итого: ${formatPrice(total)}</strong><a class="button button-dark" href="order.html">Оформить заявку →</a></div>`;
};
document.addEventListener('click', event => {
  const add = event.target.closest('[data-add-cart]'); if (add) { addToCart(Number(add.dataset.addCart)); add.textContent = 'Добавлено ✓'; }
  const remove = event.target.closest('[data-remove-cart]');
  const qty = event.target.closest('[data-cart-qty]');
  if (remove || qty) { const id = Number((remove || qty).dataset.removeCart ?? (remove || qty).dataset.cartQty); let cart = readCart(); if (remove) cart = cart.filter(item => item.id !== id); else { const item = cart.find(entry => entry.id === id); item.quantity += Number(qty.dataset.delta); if (item.quantity < 1) cart = cart.filter(entry => entry.id !== id); } writeCart(cart); }
  const quick = event.target.closest('[data-quick-view]'); if (quick) openProductModal(Number(quick.dataset.quickView));
});
let modalTrigger = null;
const openProductModal = id => { const product = products.find(item => item.id === id); if (!product) return; modalTrigger = document.activeElement; const modal = document.querySelector('#productModal'); modal.innerHTML = `<div class="product-modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" type="button" aria-label="Закрыть окно">×</button><img src="${product.image}" alt="Кроссовки ${product.name}" width="800" height="650"><span class="eyebrow">${product.brand} · ${product.category}</span><h2 id="modal-title">${product.name}</h2><p>${createProductSummary(product)}</p><strong>${formatPrice(calculateFinalPrice(product))}</strong><button class="button button-dark" type="button" data-add-cart="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>Добавить в корзину</button></div>`; modal.hidden = false; modal.querySelector('.modal-close').focus(); };
const productModal = document.createElement('div'); productModal.id='productModal'; productModal.className='product-modal'; productModal.hidden=true; document.body.append(productModal);
const closeProductModal = () => { productModal.hidden = true; modalTrigger?.focus(); };
productModal.addEventListener('click', event => { if (event.target === productModal || event.target.closest('.modal-close')) closeProductModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !productModal.hidden) closeProductModal(); });
updateCartBadges(); renderCartPage();
console.info('PACE · JavaScript для практической работы №15 загружен');
console.table(products.map(product => ({ model: product.name, price: calculateFinalPrice(product), status: getProductStatus(product) })));

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  nav.classList.toggle('is-open', !expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    nav.classList.remove('is-open');
    menuButton.focus();
  }
});

const featured = document.querySelector('[data-featured]');
if (featured) featured.innerHTML = products.slice(0, 3).map(productCard).join('');

const catalog = document.querySelector('[data-catalog]');
if (catalog) {
  const search = document.querySelector('#productSearch');
  const sort = document.querySelector('#sortBy');
  const count = document.querySelector('#resultsCount');
  const kindChecks = [...document.querySelectorAll('input[name="kind"]')];
  let selectedSize = '';
  const query = new URLSearchParams(location.search);
  if (query.has('type')) {
    const checkbox = kindChecks.find(input => input.value === query.get('type'));
    if (checkbox) checkbox.checked = true;
  }
  const renderCatalog = () => {
    const text = search.value.trim().toLocaleLowerCase('ru');
    const kinds = kindChecks.filter(input => input.checked).map(input => input.value);
    let visible = products.filter(product => {
      const matchesText = !text || `${product.brand} ${product.name} ${product.category} ${product.color}`.toLocaleLowerCase('ru').includes(text);
      return matchesText && (!kinds.length || kinds.includes(product.kind)) && (!selectedSize || product.sizes.includes(Number(selectedSize)));
    });
    if (sort.value === 'price-up') visible.sort((a, b) => a.price - b.price);
    if (sort.value === 'price-down') visible.sort((a, b) => b.price - a.price);
    if (sort.value === 'name') visible.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    catalog.innerHTML = visible.length ? visible.map(productCard).join('') : '<p class="empty-state">По этим параметрам кроссовки не найдены. Измени фильтры и попробуй ещё раз.</p>';
    count.textContent = `Найдено моделей: ${visible.length}`;
  };
  [search, sort, ...kindChecks].forEach(control => control.addEventListener(control === search ? 'input' : 'change', renderCatalog));
  document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
    selectedSize = selectedSize === button.dataset.size ? '' : button.dataset.size;
    document.querySelectorAll('[data-size]').forEach(item => item.classList.toggle('is-selected', item.dataset.size === selectedSize));
    renderCatalog();
  }));
  document.querySelector('#resetFilters').addEventListener('click', () => {
    search.value = '';
    sort.value = 'popular';
    selectedSize = '';
    kindChecks.forEach(input => { input.checked = false; });
    document.querySelectorAll('[data-size]').forEach(item => item.classList.remove('is-selected'));
    history.replaceState({}, '', location.pathname);
    renderCatalog();
  });
  renderCatalog();
}

const productRoot = document.querySelector('[data-product]');
if (productRoot) {
  const id = Number(new URLSearchParams(location.search).get('id'));
  const product = products.find(item => item.id === id) || products[0];
  const rows = [
    ['Назначение', product.category], ['Цвет', product.color], ['Материал верха', product.material],
    ['Особенности конструкции', product.weight], ['Посадка', product.fit], ['Размеры в наличии', product.sizes.join(', ')]
  ];
  productRoot.innerHTML = `<div class="product-detail-image"><picture><source media="(min-width: 768px)" srcset="${product.image}"><img src="${product.image}" alt="Кроссовки ${product.name}, вид сбоку" width="800" height="650"></picture></div><div class="product-detail-copy"><span class="eyebrow">PACE / ${String(product.id + 1).padStart(2, '0')} · ${product.brand} · ${product.category.toUpperCase()}</span><h1>${product.name}</h1><p class="product-detail-color">${product.color}</p><p class="product-description">${product.description}</p><strong class="detail-price">${formatPrice(calculateFinalPrice(product))}</strong><p>${getProductStatus(product)}</p><div class="detail-sizes"><span>Размеры:</span> ${product.sizes.join(' · ')}</div><button class="button button-dark" type="button" data-add-cart="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>В корзину</button> <a class="button button-dark" href="order.html?product=${product.id}">Оставить заявку →</a><p class="product-note">Наличие и подходящий размер уточним по телефону.</p></div><section class="specs-section"><span class="eyebrow">ХАРАКТЕРИСТИКИ</span><h2>Подробности модели</h2><div class="table-wrapper" tabindex="0" aria-label="Таблица характеристик модели"><table class="product-table"><caption class="sr-only">Характеристики модели ${product.name}</caption><tbody>${rows.map(([key, value]) => `<tr><th scope="row">${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></div></section>`;
}

const orderForm = document.querySelector('#orderForm');
if (orderForm) {
  const shoeSelect = document.querySelector('#shoeChoice');
  const sizeSelect = document.querySelector('#shoeSize');
  const summary = document.querySelector('#orderSummary strong');
  const chosenId = new URLSearchParams(location.search).get('product');
  const requiredControls = [...orderForm.querySelectorAll('[required]')];
  const updateFieldValidity = control => {
    const invalid = !control.checkValidity();
    if (invalid) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    const error = document.getElementById(`${control.id}-error`);
    error?.classList.toggle('is-visible', invalid && orderForm.classList.contains('was-validated'));
  };
  requiredControls.forEach(control => {
    control.addEventListener('input', () => updateFieldValidity(control));
    control.addEventListener('change', () => updateFieldValidity(control));
  });
  shoeSelect.insertAdjacentHTML('beforeend', products.map(product => `<option value="${product.id}">${product.name} — ${formatPrice(calculateFinalPrice(product))}</option>`).join(''));
  const updateSizes = () => {
    const product = products.find(item => item.id === Number(shoeSelect.value));
    sizeSelect.innerHTML = '<option value="">Выберите размер</option>' + (product ? product.sizes.map(size => `<option value="${size}">${size}</option>`).join('') : '');
    summary.textContent = product ? `${product.name} · ${formatPrice(calculateFinalPrice(product))}` : 'Пока не выбрана модель';
  };
  shoeSelect.addEventListener('change', updateSizes);
  if (chosenId !== null && products.some(product => product.id === Number(chosenId))) {
    shoeSelect.value = chosenId;
    updateSizes();
  }
  orderForm.addEventListener('submit', event => {
    event.preventDefault();
    orderForm.classList.add('was-validated');
    requiredControls.forEach(updateFieldValidity);
    if (!orderForm.checkValidity()) {
      requiredControls.find(control => !control.checkValidity())?.focus();
      return;
    }
    document.querySelector('#formSuccess').hidden = false;
    document.querySelector('#formSuccess').textContent = `Спасибо, ${orderForm.elements.name.value}! Заявка на ${shoeSelect.selectedOptions[0].text.split(' — ')[0]}, размер ${sizeSelect.value}, подготовлена. Это демонстрационная форма.`;
    orderForm.reset();
    orderForm.classList.remove('was-validated');
    updateSizes();
  });
}

// The cabinet is a front-end demo; profile data stays in this browser only.
const accountForm = document.querySelector('#accountForm');
if (accountForm) {
  const storageKey = 'pace-profile';
  const nameInput = document.querySelector('#accountName');
  const emailInput = document.querySelector('#accountEmail');
  const status = document.querySelector('#accountStatus');
  const clearButton = document.querySelector('#accountClear');
  const renderProfile = () => {
    const profile = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (profile) {
      nameInput.value = profile.name;
      emailInput.value = profile.email;
      status.textContent = `Профиль сохранён для ${profile.name}.`;
      clearButton.hidden = false;
    }
  };
  accountForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!accountForm.reportValidity()) return;
    localStorage.setItem(storageKey, JSON.stringify({ name: nameInput.value.trim(), email: emailInput.value.trim() }));
    renderProfile();
  });
  clearButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    accountForm.reset();
    clearButton.hidden = true;
    status.textContent = 'Профиль очищен в этом браузере.';
  });
  renderProfile();
}

// Local demo chat with a small FAQ; it does not send messages to a server.
if (!document.querySelector('.chat-panel')) {
  document.body.insertAdjacentHTML('beforeend', `<button class="chat-launch" type="button" aria-label="Открыть чат" aria-controls="chat-panel" aria-expanded="false">✉</button><section class="chat-panel" id="chat-panel" role="dialog" aria-labelledby="chat-title" aria-hidden="true"><div class="chat-head"><div><strong id="chat-title">PACE · поддержка</strong><small>Демо чат магазина</small></div><button class="chat-close" type="button" aria-label="Закрыть чат">×</button></div><div class="chat-messages" aria-live="polite"><div class="chat-message">Привет! Подскажу по моделям, размерам и часам работы.</div></div><form class="chat-form"><label class="sr-only" for="chat-input">Ваше сообщение</label><input id="chat-input" placeholder="Напишите вопрос…" required maxlength="300"><button type="submit" aria-label="Отправить сообщение">↑</button></form></section>`);
  const launch = document.querySelector('.chat-launch');
  const panel = document.querySelector('.chat-panel');
  const chatForm = document.querySelector('.chat-form');
  const chatInput = chatForm.querySelector('input');
  const messages = document.querySelector('.chat-messages');
  const addMessage = (text, who='') => { const item=document.createElement('div'); item.className=`chat-message ${who}`.trim(); item.textContent=text; messages.append(item); messages.scrollTop=messages.scrollHeight; };
  const closeChat = () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); launch.setAttribute('aria-expanded','false'); launch.focus(); };
  launch.addEventListener('click', () => { const open=!panel.classList.contains('is-open'); panel.classList.toggle('is-open',open); panel.setAttribute('aria-hidden',String(!open)); launch.setAttribute('aria-expanded',String(open)); if(open) chatInput.focus(); });
  document.querySelector('.chat-close').addEventListener('click',closeChat);
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') closeChat(); });
  chatForm.addEventListener('submit', event => {
    event.preventDefault(); const question=chatInput.value.trim(); if(!question) return;
    addMessage(question,'user'); chatInput.value='';
    const q=question.toLocaleLowerCase('ru');
    const answer=q.includes('размер') ? 'Размеры и наличие указаны в карточке модели. Можно оставить заявку — уточним детали по телефону.' : q.includes('время')||q.includes('работ') ? 'Магазин в макете работает с понедельника по субботу, с 10:00 до 20:00.' : q.includes('достав') ? 'Детали доставки можно указать в комментарии к заявке.' : 'Спасибо за вопрос! Это демонстрационный чат: оставь заявку, и на учебном макете появится подтверждение.';
    window.setTimeout(()=>addMessage(answer),350);
  });
}

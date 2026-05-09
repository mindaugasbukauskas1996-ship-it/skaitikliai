document.addEventListener('DOMContentLoaded', function () {
  // Cart drawer
  var cartDrawer = document.getElementById('cart-drawer');
  var cartToggle = document.getElementById('CartToggle');
  var cartClose = cartDrawer && cartDrawer.querySelector('.cart-drawer__close');
  var cartOverlay = cartDrawer && cartDrawer.querySelector('.cart-drawer__overlay');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    refreshCartDrawer();
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Mobile menu
  var menuToggle = document.getElementById('MenuToggle');
  var siteNav = document.getElementById('SiteNav');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  function formatMoney(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function updateCartCount(count) {
    var el = document.getElementById('CartCount');
    if (!el) return;
    el.textContent = count;
    el.classList.toggle('has-items', count > 0);
  }

  function refreshCartDrawer() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        updateCartCount(cart.item_count);
        var itemsEl = document.getElementById('cart-items');
        var subtotalEl = document.getElementById('cart-subtotal');
        if (!itemsEl) return;

        if (cart.item_count === 0) {
          itemsEl.innerHTML = '<div class="cart-drawer__empty"><p>Jūsų krepšelis tuščias</p></div>';
        } else {
          itemsEl.innerHTML = cart.items.map(function (item) {
            return '<div class="cart-drawer__item">'
              + '<div class="cart-drawer__item-image">'
              + (item.image ? '<img src="' + item.image + '" alt="' + item.product_title + '" loading="lazy">' : '')
              + '</div>'
              + '<div class="cart-drawer__item-info">'
              + '<div class="cart-drawer__item-title">' + item.product_title + '</div>'
              + (item.variant_title && item.variant_title !== 'Default Title' ? '<div class="cart-drawer__item-variant">' + item.variant_title + '</div>' : '')
              + '<div>x' + item.quantity + '</div>'
              + '</div>'
              + '<div class="cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</div>'
              + '</div>';
          }).join('');
        }
        if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
      })
      .catch(function () {});
  }

  // Add to cart
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList.contains('product-form')) return;
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Dedama...';

    var fd = new FormData(form);
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: fd.get('id'), quantity: parseInt(fd.get('quantity'), 10) || 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        btn.textContent = 'Pridėta!';
        setTimeout(function () { btn.disabled = false; btn.textContent = orig; }, 1500);
        openCart();
      })
      .catch(function () { btn.disabled = false; btn.textContent = orig; });
  });

  // Variant buttons
  document.querySelectorAll('.variant-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = this.closest('.variant-options');
      group.querySelectorAll('.variant-option').forEach(function (b) { b.classList.remove('is-selected'); });
      this.classList.add('is-selected');
      var input = document.querySelector('input[name="id"]');
      if (input && this.dataset.variantId) input.value = this.dataset.variantId;
    });
  });

  // Quantity selectors
  document.querySelectorAll('.quantity-selector').forEach(function (el) {
    var inp = el.querySelector('input');
    el.querySelector('.qty-minus') && el.querySelector('.qty-minus').addEventListener('click', function () {
      if (parseInt(inp.value, 10) > 1) inp.value = parseInt(inp.value, 10) - 1;
    });
    el.querySelector('.qty-plus') && el.querySelector('.qty-plus').addEventListener('click', function () {
      inp.value = parseInt(inp.value, 10) + 1;
    });
  });

  // Product gallery thumbnails
  document.querySelectorAll('.product-gallery__thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var main = document.querySelector('.product-gallery__main img');
      var src = this.querySelector('img').src;
      if (main) main.src = src.replace(/_\d+x(\d+x)?\./, '.');
      document.querySelectorAll('.product-gallery__thumb').forEach(function (t) { t.classList.remove('is-active'); });
      this.classList.add('is-active');
    });
  });

  refreshCartDrawer();
});

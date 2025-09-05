// assets/js/store.js
// ===============================
// Helpers & Storage
// ===============================
function $(id){ return document.getElementById(id); }
function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function formatCurrency(n){ return '$' + Number(n).toFixed(2); }
function getParam(name){ return new URLSearchParams(location.search).get(name); }

// ===============================
// Debounce helper
// ===============================
function debounce(fn, delay=200){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), delay);
  };
}

// ===============================
// Cart operations
// ===============================
function getCartCount(){ return getCart().reduce((s,i)=>s+i.qty,0); }
function isInCart(productId){ return getCart().some(i=>i.id===productId); }

function addToCart(productId){
  const prod = (window.products || []).find(p=>p.id===productId);
  if(!prod) return;
  const cart = getCart();
  const found = cart.find(i=>i.id===productId);
  if(found) found.qty += 1;
  else cart.push({ id:prod.id, name:prod.name, price:prod.price, image:prod.image, qty:1 });
  saveCart(cart);
  updateCartBadge();
  renderProducts();
  renderFeatured();
  renderProductDetail();
  renderCart();
}

function incrementItem(productId){ const cart=getCart(); const it=cart.find(i=>i.id===productId); if(it){ it.qty+=1; saveCart(cart); renderCart(); updateCartBadge(); } }
function decrementItem(productId){ const cart=getCart(); const idx=cart.findIndex(i=>i.id===productId); if(idx>-1){ cart[idx].qty-=1; if(cart[idx].qty<=0) cart.splice(idx,1); saveCart(cart); renderCart(); updateCartBadge(); } }
function removeFromCart(productId){ const cart=getCart().filter(i=>i.id!==productId); saveCart(cart); renderCart(); updateCartBadge(); }

// ===============================
// Badge
// ===============================
function updateCartBadge(){ const el = $('cartCount'); if(el) el.textContent = getCartCount(); }

// ===============================
// Product list (filtered/sorted)
 // currentList is the active list displayed on products page
let currentList = [];

// ===============================
// Render products (uses currentList)
function renderProducts(searchQuery = "") {
  const container = document.getElementById("products-list");
  if (!container) return;

  let list = currentList.length ? currentList : (window.products || []);

  if(searchQuery){
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery)
    );
  }

  container.innerHTML = list.map(product => {
    const inCart = getCart().find(item => item.id === product.id);
    return `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">$${product.price.toFixed(2)}</p>

            ${
              inCart
                ? `<button class="btn btn-success" onclick="addToCart(${product.id})">+ (${inCart.qty})</button>`
                : `<button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>`
            }

            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-secondary ms-2">
              View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


// ===============================
// Featured (home)
function renderFeatured(){
  const wrap = $('featured-products'); if(!wrap) return;
  const featured = (window.products || []).slice(0,3);
  wrap.innerHTML = featured.map(p=>`
    <div class="col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body text-center">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text fw-bold">${formatCurrency(p.price)}</p>
          <a class="btn btn-outline-primary" href="product-detail.html?id=${p.id}">View Details</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ===============================
// Product detail
function renderProductDetail(){
  const container = $('productContainer'); if(!container) return;
  const id = Number(getParam('id')); const p = (window.products || []).find(x=>x.id===id);
  if(!p){ container.innerHTML = `<div class="text-center py-5">Product not found. <a href="products.html">Back to products</a></div>`; return; }
  const inCart = isInCart(p.id);
  container.innerHTML = `
    <div class="row g-4 align-items-center">
      <div class="col-md-6">
        <img src="${p.image}" class="img-fluid rounded-4 shadow-sm" alt="${p.name}">
      </div>
      <div class="col-md-6">
        <h1 class="h3">${p.name}</h1>
        <p class="lead fw-bold">${formatCurrency(p.price)}</p>
        <div class="d-flex gap-2 mb-4">
          ${ inCart ? `<button class="btn btn-success" onclick="addToCart(${p.id})"><i class="fa-solid fa-plus"></i> Add one more</button>` : `<button class="btn btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>` }
          <a href="products.html" class="btn btn-outline-secondary">Back to Products</a>
        </div>
        <p class="text-secondary">High quality product with reliable warranty and worldwide shipping.</p>
      </div>
    </div>
  `;
}

// ===============================
// Cart page
function renderCart(){
  const wrap = $('cartItems'); if(!wrap) return;
  const cart = getCart();
  if(!cart.length){
    wrap.innerHTML = `
      <div class="text-center py-5 bg-white rounded-4 shadow-sm">
        <p class="mb-3">Your cart is empty.</p>
        <a href="products.html" class="btn btn-primary">Go to Products</a>
      </div>`;
    const sub = $('subtotal'); const tot = $('total'); if(sub) sub.textContent='$0.00'; if(tot) tot.textContent='$0.00';
    return;
  }
  wrap.innerHTML = cart.map(item=>`
    <div class="card mb-3 shadow-sm">
      <div class="card-body d-flex gap-3 align-items-center">
        <img src="${item.image}" alt="${item.name}" style="width:90px;height:90px;object-fit:cover" class="rounded">
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-1">${item.name}</h6>
            <strong>${formatCurrency(item.price*item.qty)}</strong>
          </div>
          <div class="d-flex align-items-center gap-2 mt-2">
            <button class="btn btn-outline-secondary btn-sm" onclick="decrementItem(${item.id})">−</button>
            <span class="px-2">${item.qty}</span>
            <button class="btn btn-outline-secondary btn-sm" onclick="incrementItem(${item.id})">+</button>
            <button class="btn btn-link text-danger ms-3" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const sub = $('subtotal'); const tot = $('total'); if(sub) sub.textContent = formatCurrency(subtotal); if(tot) tot.textContent = formatCurrency(subtotal);
  const checkoutBtn = $('checkoutBtn'); if(checkoutBtn) checkoutBtn.onclick = ()=>alert('Demo checkout - no backend integrated.');
}

// ===============================
// Search & Sort wiring
function wireSearchAndSort(){
  const search = $('search');  // matches HTML id="search"
  const sort = $('sort');      // matches HTML id="sort"

  // initial currentList to all products
  currentList = Array.isArray(window.products) ? [...window.products] : [];

  function apply(){
    const term = search ? search.value.trim().toLowerCase() : '';
    currentList = (window.products || []).filter(p => {
      const hay = (p.name + ' ' + (p.description||'')).toLowerCase();
      return !term || hay.indexOf(term) !== -1;
    });

    // sorting
    if(sort){
      switch(sort.value){
        case 'price-asc': currentList.sort((a,b)=>a.price-b.price); break;
        case 'price-desc': currentList.sort((a,b)=>b.price-a.price); break;
        case 'name-asc': currentList.sort((a,b)=>a.name.localeCompare(b.name)); break;
        case 'popular':
        default: break;
      }
    }

    renderProducts(); // <- we’ll fix renderProducts below
  }

  const debouncedApply = debounce(apply, 200);
  if(search) search.addEventListener('input', debouncedApply);
  if(sort) sort.addEventListener('change', apply);

  apply(); // run once to populate
}
wireSearchAndSort();

// ===============================
// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      renderProducts(e.target.value.toLowerCase());
    });
  }
  renderFeatured();
  renderProducts();
  updateCartBadge();
});

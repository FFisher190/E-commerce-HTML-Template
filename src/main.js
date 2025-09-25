// app.js

// Sample product data (id, title, price, image)
const products = [
  {id:1, title:'Wireless Headphones', price:59.99, img:'https://picsum.photos/seed/p1/600/400'},
  {id:2, title:'Classic Sneakers', price:79.00, img:'https://picsum.photos/seed/p2/600/400'},
  {id:3, title:'Smart Watch', price:129.5, img:'https://picsum.photos/seed/p3/600/400'},
  {id:4, title:'Backpack', price:39.99, img:'https://picsum.photos/seed/p4/600/400'},
  {id:5, title:'Sunglasses', price:24.99, img:'https://picsum.photos/seed/p5/600/400'},
  {id:6, title:'Coffee Mug', price:12.49, img:'https://picsum.photos/seed/p6/600/400'}
];

// Cart (persisted in localStorage)
let cart = JSON.parse(localStorage.getItem('cart_v1') || '{}');

// Utilities
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Render product grid
function renderProducts(){
  const grid = $('#productGrid');
  grid.innerHTML = '';
  products.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4';
    col.innerHTML = `
      <div class="card product-card h-100 position-relative">
        ${Math.random()<0.25?'<span class="badge badge-sale p-2">Sale</span>':''}
        <img src="${p.img}" class="card-img-top" alt="${p.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.title}</h5>
          <p class="mb-2 text-muted small">Short product description goes here.</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <div class="price">$${p.price.toFixed(2)}</div>
            <button class="btn btn-sm btn-outline-primary add-to-cart" data-id="${p.id}"><i class="fa-solid fa-cart-plus me-1"></i>Add</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
  $('#productCount').textContent = products.length;

  attachAddToCartHandlers();
}

// Attach Add to Cart button handlers (used for both grid and featured carousel)
function attachAddToCartHandlers(){
  $$('.add-to-cart').forEach(btn=>btn.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    addToCart(id);
  }));
}

function addToCart(productId, qty=1){
  cart[productId] = (cart[productId]||0) + qty;
  saveCart();
  showToast('Added to cart');
  updateCartUI();
}

function removeFromCart(productId){
  delete cart[productId];
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(productId, qty){
  if(qty<=0){ removeFromCart(productId); return; }
  cart[productId] = qty;
  saveCart();
  updateCartUI();
  renderCartItems();
}

function saveCart(){
  localStorage.setItem('cart_v1', JSON.stringify(cart));
}

function cartTotal(){
  let total = 0;
  for(const id in cart){
    const p = products.find(x=>x.id===Number(id));
    if(p) total += p.price * cart[id];
  }
  return total;
}

function updateCartUI(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  $('#cartCount').textContent = count;
}

function renderCartItems(){
  const container = $('#cartItems');
  container.innerHTML = '';
  if(Object.keys(cart).length===0){
    container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    $('#cartTotal').textContent = '$0.00';
    return;
  }

  const table = document.createElement('div');
  table.className = 'list-group';

  for(const id in cart){
    const p = products.find(x=>x.id===Number(id));
    if(!p) continue;
    const qty = cart[id];
    const el = document.createElement('div');
    el.className = 'list-group-item d-flex align-items-center justify-content-between';
    el.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${p.img}" width="64" height="48" style="object-fit:cover; border-radius:6px" class="me-3" alt="${p.title}">
        <div>
          <div class="fw-semibold">${p.title}</div>
          <div class="small text-muted">$${p.price.toFixed(2)} each</div>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <input type="number" min="0" value="${qty}" style="width:70px" class="form-control form-control-sm me-2 qty-input" data-id="${p.id}">
        <div class="text-end" style="min-width:90px">$${(p.price*qty).toFixed(2)}</div>
        <button class="btn btn-link text-danger ms-2 remove-item" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    table.appendChild(el);
  }
  container.appendChild(table);
  $('#cartTotal').textContent = '$' + cartTotal().toFixed(2);

  $$('.qty-input').forEach(input=>{
    input.addEventListener('change', e=>{
      const id = Number(e.currentTarget.dataset.id);
      const v = Number(e.currentTarget.value) || 0;
      changeQty(id, v);
    });
  });
  $$('.remove-item').forEach(btn=>btn.addEventListener('click', e=>{
    const id = Number(e.currentTarget.dataset.id);
    removeFromCart(id);
  }));
}

function showToast(msg){
  const toastEl = $('#cartToast');
  toastEl.querySelector('.toast-body').textContent = msg;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function checkout(){
  if(Object.keys(cart).length===0){ alert('Your cart is empty.'); return; }
  cart = {};
  saveCart();
  updateCartUI();
  renderCartItems();
  const modal = bootstrap.Modal.getInstance($('#cartModal'));
  if(modal) modal.hide();
  showToast('Thanks! Your order has been placed (demo)');
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  renderCartItems();
  updateCartUI();
  $('#year').textContent = new Date().getFullYear();

  $('#checkoutBtn').addEventListener('click', checkout);

  $('#subscribeForm').addEventListener('submit', e=>{
    e.preventDefault();
    showToast('Subscribed — demo');
    e.target.reset();
  });

  const cartModalEl = document.getElementById('cartModal');
  cartModalEl.addEventListener('show.bs.modal', renderCartItems);

  // Attach handlers to carousel featured products as well
  attachAddToCartHandlers();
});
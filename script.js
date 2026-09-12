const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchEmpty = document.getElementById("searchEmpty");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartEmpty = document.getElementById("cartEmpty");
const cartLines = document.getElementById("cartLines");
const cartFoot = document.getElementById("cartFoot");
const cartTotalEl = document.getElementById("cartTotal");
const cartSubtotalRow = document.getElementById("cartSubtotalRow");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartCouponRow = document.getElementById("cartCouponRow");
const cartCouponLabel = document.getElementById("cartCouponLabel");
const cartCouponOff = document.getElementById("cartCouponOff");
const cartShipRow = document.getElementById("cartShipRow");
const cartShipLabel = document.getElementById("cartShipLabel");
const cartShipOff = document.getElementById("cartShipOff");
const cartShipNote = document.getElementById("cartShipNote");
const cartPay = document.getElementById("cartPay");
const payOverlay = document.getElementById("payOverlay");
const payClose = document.getElementById("payClose");
const payTitle = document.getElementById("payTitle");
const detailsForm = document.getElementById("detailsForm");
const detailsAmount = document.getElementById("detailsAmount");
const detailsCouponRow = document.getElementById("detailsCouponRow");
const detailsCouponLabel = document.getElementById("detailsCouponLabel");
const detailsCouponOff = document.getElementById("detailsCouponOff");
const detailsShipRow = document.getElementById("detailsShipRow");
const detailsShipLabel = document.getElementById("detailsShipLabel");
const detailsShipOff = document.getElementById("detailsShipOff");
const detailsShipNote = document.getElementById("detailsShipNote");
const detailsPayable = document.getElementById("detailsPayable");
const detailsError = document.getElementById("detailsError");
const couponEntry = document.getElementById("couponEntry");
const couponInput = document.getElementById("payCoupon");
const couponApply = document.getElementById("couponApply");
const couponApplied = document.getElementById("couponApplied");
const couponAppliedText = document.getElementById("couponAppliedText");
const couponRemove = document.getElementById("couponRemove");
const couponStatus = document.getElementById("couponStatus");
const payCommercial = document.getElementById("payCommercial");
const gstNumberWrap = document.getElementById("gstNumberWrap");
const payGst = document.getElementById("payGst");
const payGstLine = document.getElementById("payGstLine");
const payGstShow = document.getElementById("payGstShow");
const payForm = document.getElementById("payForm");
const paySuccess = document.getElementById("paySuccess");
const payAmount = document.getElementById("payAmount");
const payCouponRow = document.getElementById("payCouponRow");
const payCouponLabel = document.getElementById("payCouponLabel");
const payCouponOff = document.getElementById("payCouponOff");
const payShipRow = document.getElementById("payShipRow");
const payShipLabel = document.getElementById("payShipLabel");
const payShipOff = document.getElementById("payShipOff");
const payNote = document.getElementById("payNote");
const payError = document.getElementById("payError");
const paySubmit = document.getElementById("paySubmit");
const payDone = document.getElementById("payDone");
const payBack = document.getElementById("payBack");
const paySuccessText = document.getElementById("paySuccessText");
const payQr = document.getElementById("payQr");
const packOverlay = document.getElementById("packOverlay");
const packClose = document.getElementById("packClose");
const packProduct = document.getElementById("packProduct");
const packOptions = document.getElementById("packOptions");
const packTitle = document.getElementById("packTitle");

const CART_KEY = "monika-spices-cart";
const ORDER_KEY = "monika-spices-orders";
const DETAILS_KEY = "monika-spices-delivery";
const COUPON_KEY = "monika-spices-coupon";
const payConfig = window.MONIKA_PAY || { merchantName: "Monika Spices", razorpayKeyId: "", upiId: "", coupons: [] };
let payMethod = "upi";
let razorpayScriptLoading = null;
let packProductPending = null;

const PACKS = [
  { id: "100g", label: "100 g", grams: 100 },
  { id: "250g", label: "250 g", grams: 250 },
  { id: "500g", label: "500 g", grams: 500 },
  { id: "1kg", label: "1 kg", grams: 1000 },
];

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  });
});

function filterProducts(query) {
  const q = query.trim().toLowerCase();
  const cards = document.querySelectorAll(".product-card");
  let shown = 0;

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    const match = !q || text.includes(q);
    card.classList.toggle("is-hidden", !match);
    if (match) shown += 1;
  });

  document.querySelectorAll(".catalog").forEach((section) => {
    const visible = section.querySelector(".product-card:not(.is-hidden)");
    section.classList.toggle("is-hidden", Boolean(q) && !visible);
  });

  searchEmpty.classList.toggle("show", Boolean(q) && shown === 0);

  if (q && shown) {
    const first = document.querySelector(".product-card:not(.is-hidden)");
    if (first) {
      first.closest(".catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  filterProducts(searchInput.value);
});

searchInput.addEventListener("input", () => {
  filterProducts(searchInput.value);
});

function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(items)) return [];
    return items.map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeCartItem(item) {
  if (!item || !item.name) return null;
  const qty = lineQty(item);
  if (qty <= 0) return null;
  if (item.pack && Number(item.kg) > 0) {
    return {
      ...item,
      qty,
      productId: item.productId || String(item.id || "").replace(/__[^_]+$/, "") || productId(item.name),
    };
  }
  const productKey = item.productId || item.id || productId(item.name);
  return {
    ...item,
    id: `${productKey}__1kg`,
    productId: productKey,
    pack: "1kg",
    packLabel: "1 kg",
    kg: 1,
    unit: "1 kg",
    qty,
  };
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function productId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rupees(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function productFromCard(card) {
  const name = card.querySelector("h3").textContent.trim();
  const price = Number(card.querySelector(".price").textContent.replace(/[^\d]/g, ""));
  const img = card.querySelector("img").getAttribute("src");
  return { productId: productId(name), name, priceKg: price, img };
}

function packPrice(priceKg, grams) {
  return Math.round((Number(priceKg) * grams) / 1000);
}

function lineId(productKey, packId) {
  return `${productKey}__${packId}`;
}

function addToCart(product, pack, qty) {
  const items = loadCart();
  const id = lineId(product.productId, pack.id);
  const price = packPrice(product.priceKg, pack.grams);
  const found = items.find((item) => item.id === id);
  if (found) {
    found.qty += qty;
    found.price = price;
    found.kg = pack.grams / 1000;
    found.packLabel = pack.label;
  } else {
    items.push({
      id,
      productId: product.productId,
      name: product.name,
      pack: pack.id,
      packLabel: pack.label,
      kg: pack.grams / 1000,
      price,
      unit: pack.label,
      img: product.img,
      qty,
    });
  }
  saveCart(items);
  renderCart();
}

function setQty(id, qty) {
  let items = loadCart();
  if (qty <= 0) {
    items = items.filter((item) => item.id !== id);
  } else {
    const found = items.find((item) => item.id === id);
    if (found) found.qty = qty;
  }
  saveCart(items);
  renderCart();
}

function openCart() {
  cartOverlay.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  cartBtn.setAttribute("aria-label", "Close cart");
}

function closeCart() {
  cartOverlay.hidden = true;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  cartBtn.setAttribute("aria-label", "Open cart");
}

function lineQty(item) {
  const qty = Number(item.qty);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
}

function renderCart() {
  const items = loadCart();
  const packCount = items.reduce((sum, item) => sum + lineQty(item), 0);
  const total = items.reduce((sum, item) => sum + Number(item.price) * lineQty(item), 0);

  cartCountEl.textContent = String(packCount);
  cartCountEl.classList.toggle("show", packCount > 0);
  cartBtn.setAttribute("aria-label", packCount ? `Open cart, ${packCount} packs` : "Open cart");

  cartEmpty.classList.toggle("show", items.length === 0);
  cartFoot.hidden = items.length === 0;
  cartLines.innerHTML = "";

  items.forEach((item) => {
    const line = document.createElement("article");
    line.className = "cart-line";
    const packLabel = item.packLabel || item.unit || "1 kg";
    line.innerHTML = `
      <img src="${item.img}" alt="">
      <div>
        <h3>${item.name}</h3>
        <p class="unit">${packLabel} · ${rupees(item.price)} each</p>
        <div class="qty-box">
          <button type="button" class="qty-btn" data-id="${item.id}" data-delta="-1" aria-label="Remove one ${packLabel} pack of ${item.name}">−</button>
          <span>${item.qty} × ${packLabel}</span>
          <button type="button" class="qty-btn" data-id="${item.id}" data-delta="1" aria-label="Add one ${packLabel} pack of ${item.name}">+</button>
        </div>
      </div>
      <div class="cart-line-side">
        <p class="line-total">${rupees(item.price * item.qty)}</p>
        <button type="button" class="remove-btn" data-remove="${item.id}">Remove</button>
      </div>
    `;
    cartLines.appendChild(line);
  });

  cartTotalEl.textContent = rupees(total);
  updateAmountViews();

  document.querySelectorAll(".product-card").forEach((card) => {
    const product = productFromCard(card);
    const inCart = items.filter((item) => item.productId === product.productId);
    const btn = card.querySelector(".add-cart");
    if (!btn) return;
    const n = inCart.reduce((sum, item) => sum + lineQty(item), 0);
    btn.textContent = n ? `Add another pack (${n} in cart)` : "Add to Cart";
  });
}

function openPackPicker(product) {
  packProductPending = product;
  packProduct.textContent = product.name;
  packOptions.innerHTML = "";
  PACKS.forEach((pack) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pack-option";
    btn.setAttribute("data-pack", pack.id);
    btn.innerHTML = `<span class="pack-size">${pack.label}</span><span class="pack-price">${rupees(packPrice(product.priceKg, pack.grams))}</span>`;
    packOptions.appendChild(btn);
  });
  packOverlay.hidden = false;
  document.body.classList.add("pack-open");
  packTitle.focus?.();
}

function closePackPicker() {
  packOverlay.hidden = true;
  document.body.classList.remove("pack-open");
  packProductPending = null;
}

function decorateProductCards() {
  document.querySelectorAll(".product-card").forEach((card) => {
    if (card.querySelector(".pack-list")) return;
    const price = card.querySelector(".price");
    if (!price) return;
    const note = document.createElement("p");
    note.className = "pack-list";
    note.textContent = "100 g · 250 g · 500 g · 1 kg";
    price.insertAdjacentElement("afterend", note);
  });
}

document.addEventListener("click", (event) => {
  const add = event.target.closest(".add-cart");
  if (add) {
    const card = add.closest(".product-card");
    openPackPicker(productFromCard(card));
    return;
  }

  const packBtn = event.target.closest(".pack-option");
  if (packBtn && packProductPending) {
    const pack = PACKS.find((row) => row.id === packBtn.getAttribute("data-pack"));
    if (pack) addToCart(packProductPending, pack, 1);
    closePackPicker();
    return;
  }

  const qtyBtn = event.target.closest(".qty-btn");
  if (qtyBtn) {
    const id = qtyBtn.getAttribute("data-id");
    const delta = Number(qtyBtn.getAttribute("data-delta"));
    const item = loadCart().find((row) => row.id === id);
    if (item) setQty(id, item.qty + delta);
    return;
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    setQty(remove.getAttribute("data-remove"), 0);
  }
});

cartBtn.addEventListener("click", () => {
  if (cartDrawer.classList.contains("open")) closeCart();
  else openCart();
});
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
packClose.addEventListener("click", closePackPicker);
packOverlay.addEventListener("click", (event) => {
  if (event.target === packOverlay) closePackPicker();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("pack-open")) {
    closePackPicker();
  }
});

function paySettings() {
  return {
    key: String(payConfig.razorpayKeyId || "").trim(),
    upiId: String(payConfig.upiId || "").trim(),
    name: payConfig.merchantName || "Monika Spices",
  };
}

function cartTotalValue() {
  return loadCart().reduce((sum, item) => sum + Number(item.price) * lineQty(item), 0);
}

function cartKg() {
  return loadCart().reduce((sum, item) => {
    const kgEach = Number(item.kg);
    const weight = Number.isFinite(kgEach) && kgEach > 0 ? kgEach : 1;
    return sum + weight * lineQty(item);
  }, 0);
}

function formatKg(kg) {
  const grams = Math.round(Number(kg) * 1000);
  if (grams < 1000) return `${grams} g`;
  if (grams % 1000 === 0) return `${grams / 1000} kg`;
  return `${(grams / 1000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} kg`;
}

function shippingRates() {
  const s = payConfig.shipping || {};
  return {
    indiaFreeFrom: Number(s.indiaFreeFrom) || 1000,
    indiaPerKg: Number(s.indiaPerKg) || 50,
    intlPerKg: Number(s.intlPerKg) || 1000,
  };
}

function isIndiaCountry(country) {
  const c = String(country || "").trim().toLowerCase();
  if (!c) return true;
  return /^(india|in|bharat|hindustan|indian)$/.test(c);
}

function currentCountry() {
  const live = document.getElementById("payCountry");
  if (live && live.value.trim()) return live.value.trim();
  try {
    const saved = JSON.parse(localStorage.getItem(DETAILS_KEY) || "{}");
    if (saved && saved.country) return String(saved.country);
  } catch {
    /* ignore */
  }
  return "India";
}

function shippingInfo(subtotal) {
  const rates = shippingRates();
  const kg = cartKg();
  if (kg <= 0) {
    return { amount: 0, label: "Shipping", note: "", free: true };
  }
  if (isIndiaCountry(currentCountry())) {
    if (subtotal >= rates.indiaFreeFrom) {
      return {
        amount: 0,
        label: "Shipping (India)",
        note: `Free shipping across India on orders of ${rupees(rates.indiaFreeFrom)}+.`,
        free: true,
      };
    }
    return {
      amount: Math.round(kg * rates.indiaPerKg),
      label: `Shipping (India, ${rupees(rates.indiaPerKg)}/kg)`,
      note: `India shipping is ${rupees(rates.indiaPerKg)} per kg below ${rupees(rates.indiaFreeFrom)}. Add ${rupees(rates.indiaFreeFrom - subtotal)} more for free shipping across India.`,
      free: false,
    };
  }
  return {
    amount: Math.round(kg * rates.intlPerKg),
    label: `Shipping (outside India, ${rupees(rates.intlPerKg)}/kg)`,
    note: `Outside India, standard shipping is ${rupees(rates.intlPerKg)} per kg.`,
    free: false,
  };
}

function withShipping(state) {
  const ship = shippingInfo(state.subtotal);
  return {
    ...state,
    kg: cartKg(),
    shipping: ship.amount,
    shipLabel: ship.label,
    shipNote: ship.note,
    shipFree: ship.free,
    payable: Math.max(0, state.subtotal - state.discount) + ship.amount,
  };
}

function listCoupons() {
  return Array.isArray(payConfig.coupons) ? payConfig.coupons : [];
}

function findCoupon(code) {
  const key = String(code || "").trim().toUpperCase();
  if (!key) return null;
  return listCoupons().find((row) => String(row.code || "").trim().toUpperCase() === key) || null;
}

function loadCouponCode() {
  try {
    return String(localStorage.getItem(COUPON_KEY) || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

function saveCouponCode(code) {
  const key = String(code || "").trim().toUpperCase();
  if (!key) localStorage.removeItem(COUPON_KEY);
  else localStorage.setItem(COUPON_KEY, key);
}

function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  const min = Number(coupon.minSubtotal) || 0;
  if (subtotal < min) return 0;
  let discount = 0;
  if (coupon.percent) {
    discount = Math.round((subtotal * Number(coupon.percent)) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  } else if (coupon.amount) {
    discount = Number(coupon.amount);
  }
  if (!Number.isFinite(discount)) return 0;
  return Math.max(0, Math.min(discount, subtotal));
}

function couponState() {
  const subtotal = cartTotalValue();
  const code = loadCouponCode();
  const coupon = findCoupon(code);
  if (!code) {
    return withShipping({ subtotal, code: "", coupon: null, discount: 0, applied: false, message: "" });
  }
  if (!coupon) {
    return withShipping({ subtotal, code, coupon: null, discount: 0, applied: false, message: "This coupon is not valid." });
  }
  const min = Number(coupon.minSubtotal) || 0;
  if (subtotal < min) {
    return withShipping({
      subtotal,
      code,
      coupon,
      discount: 0,
      applied: false,
      message: `${coupon.code} needs a minimum order of ${rupees(min)}.`,
    });
  }
  const discount = couponDiscount(coupon, subtotal);
  if (discount <= 0) {
    return withShipping({ subtotal, code, coupon, discount: 0, applied: false, message: "This coupon cannot be applied." });
  }
  return withShipping({
    subtotal,
    code: coupon.code,
    coupon,
    discount,
    applied: true,
    message: "",
  });
}

function payableAmount() {
  return couponState().payable;
}

function setCouponStatus(message, kind) {
  couponStatus.hidden = !message;
  couponStatus.textContent = message || "";
  couponStatus.classList.toggle("is-error", kind === "error");
  couponStatus.classList.toggle("is-ok", kind === "ok");
}

function renderCouponBox(state) {
  if (state.applied) {
    couponEntry.hidden = true;
    couponApplied.hidden = false;
    couponAppliedText.textContent = `${state.code} applied · ${state.coupon.label || "discount"} · −${rupees(state.discount)}`;
    couponInput.value = state.code;
    setCouponStatus("", "");
    return;
  }
  couponEntry.hidden = false;
  couponApplied.hidden = true;
  if (state.code && !couponInput.value) couponInput.value = state.code;
  if (state.message) setCouponStatus(state.message, "error");
}

function updateAmountViews() {
  const state = couponState();
  const hasSave = state.applied && state.discount > 0;
  const shipText = state.shipFree ? "Free" : rupees(state.shipping);

  cartSubtotalRow.hidden = false;
  cartSubtotalEl.textContent = rupees(state.subtotal);
  cartCouponRow.hidden = !hasSave;
  if (hasSave) {
    cartCouponLabel.textContent = `Coupon ${state.code}`;
    cartCouponOff.textContent = `−${rupees(state.discount)}`;
  }
  cartShipLabel.textContent = state.shipLabel;
  cartShipOff.textContent = shipText;
  cartShipRow.classList.toggle("is-free", state.shipFree);
  cartShipNote.textContent = state.shipNote;
  cartTotalEl.textContent = rupees(state.payable);

  detailsAmount.textContent = rupees(state.subtotal);
  detailsCouponRow.hidden = !hasSave;
  if (hasSave) {
    detailsCouponLabel.textContent = `Coupon ${state.code}`;
    detailsCouponOff.textContent = `−${rupees(state.discount)}`;
  }
  detailsShipLabel.textContent = state.shipLabel;
  detailsShipOff.textContent = shipText;
  detailsShipRow.classList.toggle("is-free", state.shipFree);
  detailsPayable.textContent = rupees(state.payable);
  if (detailsShipNote) detailsShipNote.textContent = state.shipNote || "India: ₹50/kg below ₹1,000. Free shipping across India on ₹1,000+. Outside India: ₹1,000/kg.";

  payAmount.textContent = rupees(state.payable);
  payCouponRow.hidden = !hasSave;
  if (hasSave) {
    payCouponLabel.textContent = `Coupon ${state.code}`;
    payCouponOff.textContent = `−${rupees(state.discount)}`;
  }
  payShipLabel.textContent = state.shipLabel;
  payShipOff.textContent = shipText;
  payShipRow.classList.toggle("is-free", state.shipFree);
  if (paySubmit && !paySubmit.disabled) {
    paySubmit.textContent = `Pay ${rupees(state.payable)}`;
  }

  renderCouponBox(state);
  return state;
}

function applyCouponFromInput() {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    setCouponStatus("Enter a coupon code.", "error");
    return;
  }
  const coupon = findCoupon(code);
  if (!coupon) {
    saveCouponCode("");
    setCouponStatus("This coupon is not valid.", "error");
    updateAmountViews();
    return;
  }
  const subtotal = cartTotalValue();
  const min = Number(coupon.minSubtotal) || 0;
  if (subtotal < min) {
    saveCouponCode(code);
    updateAmountViews();
    return;
  }
  if (couponDiscount(coupon, subtotal) <= 0) {
    saveCouponCode("");
    setCouponStatus("This coupon cannot be applied.", "error");
    updateAmountViews();
    return;
  }
  saveCouponCode(code);
  const state = updateAmountViews();
  setCouponStatus(`${state.code} applied. You save ${rupees(state.discount)}.`, "ok");
  const orderId = payForm.dataset.orderId;
  if (orderId) renderPayQr(state.payable, orderId);
}

function removeCoupon() {
  saveCouponCode("");
  couponInput.value = "";
  setCouponStatus("Coupon removed.", "ok");
  const state = updateAmountViews();
  const orderId = payForm.dataset.orderId;
  if (orderId) renderPayQr(state.payable, orderId);
}

function upiLink(amount, orderId) {
  const pay = paySettings();
  const pa = pay.upiId || "monikaspices@upi";
  const params = new URLSearchParams({
    pa,
    pn: pay.name,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Monika Spices ${orderId}`,
  });
  return `upi://pay?${params.toString()}`;
}

function renderPayQr(amount, orderId) {
  payQr.innerHTML = "";
  const url = upiLink(amount, orderId);
  if (window.QRCode) {
    new QRCode(payQr, {
      text: url,
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.M,
    });
    return;
  }
  const img = document.createElement("img");
  img.alt = "UPI payment QR";
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  payQr.appendChild(img);
}

function setPayMethod(method) {
  payMethod = method;
  document.querySelectorAll(".pay-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.getAttribute("data-method") === method);
  });
  document.getElementById("panel-upi").hidden = method !== "upi";
  document.getElementById("panel-qr").hidden = method !== "qr";
  document.getElementById("panel-card").hidden = method !== "card";
}

function showPayError(message) {
  payError.hidden = !message;
  payError.textContent = message || "";
}

function fieldValue(id) {
  return document.getElementById(id).value.trim();
}

function showDetailsError(message) {
  detailsError.hidden = !message;
  detailsError.textContent = message || "";
}

function isGstin(value) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(value || "").trim().toUpperCase());
}

function toggleGstField() {
  const on = payCommercial.checked;
  gstNumberWrap.hidden = !on;
  refreshGstLine();
}

function refreshGstLine() {
  const d = getDelivery();
  const show = Boolean(d.commercial && d.gstin);
  payGstLine.hidden = !show;
  if (show) payGstShow.textContent = d.gstin;
}

function getDelivery() {
  const commercial = payCommercial.checked;
  return {
    name: fieldValue("payName"),
    building: fieldValue("payBuilding"),
    street: fieldValue("payStreet"),
    road: fieldValue("payRoad"),
    zip: fieldValue("payZip"),
    city: fieldValue("payCity"),
    state: fieldValue("payState"),
    country: fieldValue("payCountry"),
    commercial,
    gstin: commercial ? fieldValue("payGst").toUpperCase() : "",
  };
}

function formatAddress(d) {
  return [d.building, d.street, d.road, d.zip, `${d.city}, ${d.state}, ${d.country}`].join(", ");
}

function loadSavedDetails() {
  try {
    const saved = JSON.parse(localStorage.getItem(DETAILS_KEY));
    if (!saved || typeof saved !== "object") return;
    const map = {
      payName: saved.name,
      payBuilding: saved.building,
      payStreet: saved.street,
      payRoad: saved.road,
      payZip: saved.zip,
      payCity: saved.city,
      payState: saved.state,
      payCountry: saved.country,
    };
    Object.entries(map).forEach(([id, value]) => {
      if (value) document.getElementById(id).value = value;
    });
    payCommercial.checked = Boolean(saved.commercial);
    if (saved.gstin) payGst.value = String(saved.gstin).toUpperCase();
    toggleGstField();
  } catch {
    /* ignore */
  }
}

function validateDelivery() {
  const d = getDelivery();
  if (d.name.length < 2) return "Enter the full name.";
  if (d.building.length < 2) return "Enter the building name and flat no.";
  if (d.street.length < 2) return "Enter the street / society name.";
  if (d.road.length < 2) return "Enter the road name.";
  if (!/^\d{4,10}$/.test(d.zip)) return "Enter a valid ZIP / PIN code.";
  if (d.city.length < 2) return "Enter the city.";
  if (d.state.length < 2) return "Enter the state.";
  if (d.country.length < 2) return "Enter the country.";
  if (d.commercial && !isGstin(d.gstin)) {
    return "Enter a valid 15-character GST number to claim GST.";
  }
  return "";
}

function showDetailsStep() {
  payTitle.textContent = "Delivery details";
  detailsForm.hidden = false;
  payForm.hidden = true;
  paySuccess.hidden = true;
}

function showPayStep() {
  payTitle.textContent = "Secure payment";
  detailsForm.hidden = true;
  payForm.hidden = false;
  paySuccess.hidden = true;
}

function openPay() {
  const items = loadCart();
  if (!items.length) return;
  const orderId = `MS${Date.now().toString().slice(-8)}`;
  payForm.dataset.orderId = orderId;
  const pay = paySettings();
  if (pay.key) {
    payNote.textContent = "Debit card, credit card, UPI and QR are processed securely.";
  } else if (pay.upiId) {
    payNote.textContent = "Scan QR or pay by UPI to the shop UPI ID. Add a Razorpay Key ID in config.js for live card payments.";
  } else {
    payNote.textContent = "Demo checkout is on. Add your Razorpay Key ID and UPI ID in config.js to collect live card, UPI and QR payments.";
  }
  showPayError("");
  showDetailsError("");
  paySubmit.disabled = false;
  setPayMethod("upi");
  loadSavedDetails();
  if (!fieldValue("payCountry")) document.getElementById("payCountry").value = "India";
  couponInput.value = loadCouponCode();
  toggleGstField();
  const state = updateAmountViews();
  renderPayQr(state.payable, orderId);
  showDetailsStep();
  closeCart();
  payOverlay.hidden = false;
  document.body.classList.add("pay-open");
}

function closePay() {
  payOverlay.hidden = true;
  document.body.classList.remove("pay-open");
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
  orders.unshift(order);
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders.slice(0, 20)));
}

function completePayment(orderId, methodLabel) {
  const items = loadCart();
  const state = couponState();
  const delivery = getDelivery();
  saveOrder({
    id: orderId,
    items,
    subtotal: state.subtotal,
    discount: state.discount,
    coupon: state.applied ? state.code : "",
    shipping: state.shipping,
    kg: state.kg,
    total: state.payable,
    method: methodLabel,
    delivery,
    address: formatAddress(delivery),
    at: new Date().toISOString(),
  });
  saveCart([]);
  saveCouponCode("");
  couponInput.value = "";
  renderCart();
  detailsForm.hidden = true;
  payForm.hidden = true;
  paySuccess.hidden = false;
  payTitle.textContent = "Order placed";
  const saveNote = state.applied ? ` Coupon ${state.code} saved ${rupees(state.discount)}.` : "";
  const shipNote = state.shipFree
    ? " Shipping is free across India."
    : ` Shipping ${rupees(state.shipping)} (${formatKg(state.kg)}).`;
  const gstNote = delivery.gstin ? ` GSTIN ${delivery.gstin} is saved so you can claim GST.` : "";
  paySuccessText.textContent = `Order ${orderId} for ${rupees(state.payable)} is paid by ${methodLabel}.${saveNote}${shipNote}${gstNote} Delivery: ${formatAddress(delivery)}.`;
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptLoading) return razorpayScriptLoading;
  razorpayScriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => {
      razorpayScriptLoading = null;
      reject(new Error("Could not load Razorpay"));
    };
    document.body.appendChild(script);
  });
  return razorpayScriptLoading;
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function validCard(number) {
  const n = digits(number);
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function validExpiry(value) {
  const m = String(value || "").match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month);
  return exp > now;
}

async function payWithRazorpay(orderId, total, details) {
  await loadRazorpay();
  const pay = paySettings();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: pay.key,
      amount: Math.round(total * 100),
      currency: "INR",
      name: pay.name,
      description: `Order ${orderId}`,
      prefill: {
        name: details.name,
      },
      notes: {
        address: details.address,
        orderId,
        gstin: details.gstin || "",
        commercial: details.commercial ? "yes" : "no",
        shipping: String(details.shipping || 0),
      },
      theme: { color: "#8d160f" },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.open();
  });
}

cartPay.addEventListener("click", openPay);
payClose.addEventListener("click", closePay);
payDone.addEventListener("click", closePay);
payBack.addEventListener("click", () => {
  showPayError("");
  showDetailsStep();
});
payOverlay.addEventListener("click", (event) => {
  if (event.target === payOverlay) closePay();
});

document.querySelectorAll(".pay-tab").forEach((tab) => {
  tab.addEventListener("click", () => setPayMethod(tab.getAttribute("data-method")));
});

document.getElementById("payCard").addEventListener("input", (event) => {
  const n = digits(event.target.value).slice(0, 16);
  event.target.value = n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
});

document.getElementById("payExpiry").addEventListener("input", (event) => {
  let v = digits(event.target.value).slice(0, 4);
  if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
  event.target.value = v;
});

detailsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = validateDelivery();
  if (message) {
    showDetailsError(message);
    return;
  }
  localStorage.setItem(DETAILS_KEY, JSON.stringify(getDelivery()));
  showDetailsError("");
  const state = updateAmountViews();
  const orderId = payForm.dataset.orderId || `MS${Date.now().toString().slice(-8)}`;
  payForm.dataset.orderId = orderId;
  renderPayQr(state.payable, orderId);
  refreshGstLine();
  showPayStep();
});

couponApply.addEventListener("click", applyCouponFromInput);
couponRemove.addEventListener("click", removeCoupon);
couponInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCouponFromInput();
  }
});
payCommercial.addEventListener("change", toggleGstField);
payGst.addEventListener("input", () => {
  const caret = payGst.selectionStart;
  payGst.value = payGst.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
  if (typeof caret === "number") payGst.setSelectionRange(caret, caret);
  refreshGstLine();
});
document.getElementById("payCountry").addEventListener("input", () => {
  const state = updateAmountViews();
  const orderId = payForm.dataset.orderId;
  if (orderId) renderPayQr(state.payable, orderId);
});

payForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const items = loadCart();
  if (!items.length) {
    showPayError("Your cart is empty.");
    return;
  }
  const detailsErrorText = validateDelivery();
  if (detailsErrorText) {
    showPayError(detailsErrorText);
    showDetailsStep();
    return;
  }

  const delivery = getDelivery();
  const total = payableAmount();
  const orderId = payForm.dataset.orderId || `MS${Date.now().toString().slice(-8)}`;
  const pay = paySettings();
  const methodLabel = payMethod === "card" ? "debit/credit card" : payMethod === "qr" ? "UPI QR" : "UPI";

  if (!pay.key && payMethod === "upi") {
    const upi = document.getElementById("payUpi").value.trim();
    if (!upi.includes("@")) {
      showPayError("Enter a valid UPI ID, such as name@okaxis.");
      return;
    }
  }

  if (payMethod === "card" && !pay.key) {
    if (!validCard(document.getElementById("payCard").value)) {
      showPayError("Enter a valid debit or credit card number.");
      return;
    }
    if (!validExpiry(document.getElementById("payExpiry").value)) {
      showPayError("Enter a valid expiry as MM/YY.");
      return;
    }
    if (digits(document.getElementById("payCvv").value).length < 3) {
      showPayError("Enter the CVV.");
      return;
    }
    if (document.getElementById("payCardName").value.trim().length < 2) {
      showPayError("Enter the name on the card.");
      return;
    }
  }

  showPayError("");
  paySubmit.disabled = true;
  paySubmit.textContent = "Processing…";

  try {
    if (pay.key) {
      await payWithRazorpay(orderId, total, {
        name: delivery.name,
        address: formatAddress(delivery),
        gstin: delivery.gstin,
        commercial: delivery.commercial,
        shipping: couponState().shipping,
      });
    } else if (pay.upiId && (payMethod === "upi" || payMethod === "qr") && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      window.location.href = upiLink(total, orderId);
    }
    completePayment(orderId, methodLabel);
  } catch (error) {
    showPayError(error.message || "Payment was not completed.");
    paySubmit.disabled = false;
    paySubmit.textContent = `Pay ${rupees(total)}`;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!payOverlay.hidden) closePay();
  else closeCart();
});

function fillBusinessIds() {
  const fssai = String(payConfig.fssai || "").trim();
  const gstin = String(payConfig.gstin || "").trim();
  document.querySelectorAll("[data-fssai]").forEach((el) => {
    el.textContent = fssai;
  });
  document.querySelectorAll("[data-gstin]").forEach((el) => {
    el.textContent = gstin;
  });
}

fillBusinessIds();
decorateProductCards();
renderCart();

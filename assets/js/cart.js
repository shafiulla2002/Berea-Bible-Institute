/**
 * BEREA BIBLE INSTITUTE & THEOLOGICAL SEMINARY
 * Shopping Cart & Financial Calculations Module
 */

const CART_STORAGE_KEY = 'berea_prototype_cart';
const COUPON_STORAGE_KEY = 'berea_prototype_coupon';

const DEMO_COUPONS = {
  'BIBLE2026': { code: 'BIBLE2026', discountPercent: 20, desc: '20% Evangelical Student Scholarship' },
  'GRACE50':   { code: 'GRACE50',   discountPercent: 50, desc: '50% Ministry Worker Subsidy' },
  'WELCOME15': { code: 'WELCOME15', discountFixed: 15,   desc: '$15 First-Time Student Credit' },
};

function getCart() {
  // STRICT RULE: Without signing in, user cannot have items in the cart
  if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
    return [];
  }
  try {
    const raw = localStorage.getItem('berea_cart') || localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  const json = JSON.stringify(cart);
  localStorage.setItem('berea_cart', json);
  localStorage.setItem(CART_STORAGE_KEY, json);
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

function addToCart(courseId, batchDate = null) {
  // 0. STRICT AUTH GUARD: Without signing in, the user is unable to add courses to the cart!
  if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
    if (typeof showToast === 'function') {
      showToast('ℹ You must sign up or sign in to your student account to add courses to your cart.', 'warning');
    }
    if (typeof openAuthModal === 'function') {
      sessionStorage.setItem('berea_pending_course', courseId);
      openAuthModal('signup', null, courseId);
    }
    return false;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => (item.courseId || item.id) === courseId);
  const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;

  if (!course) {
    if (typeof showToast === 'function') showToast('Course not found', 'danger');
    return false;
  }

  // 1. Check if user already purchased/enrolled in this course
  if (typeof isCourseEnrolled === 'function' && isCourseEnrolled(course.id)) {
    if (typeof showToast === 'function') {
      showToast(`⚠ You have already purchased ${course.code} (${course.title})! You have active lifetime access to this course in your Student Portal.`, 'danger');
    }
    return false;
  }

  // 2. Check if already in current cart
  if (existingIndex > -1) {
    if (typeof showToast === 'function') {
      showToast(`ℹ ${course.code} is already in your registration cart`, 'gold');
    }
    return false;
  }

  cart.push({
    courseId: course.id,
    id: course.id,
    code: course.code,
    title: course.title,
    price: course.price,
    registrationFee: course.registrationFee,
    batch: batchDate || course.nextBatch,
    addedAt: new Date().toISOString()
  });

  saveCart(cart);
  if (typeof showToast === 'function') {
    showToast(`Added "${course.title}" to your enrollment cart!`, 'success');
  }
  return true;
}

function removeFromCart(courseId) {
  let cart = getCart();
  const item = cart.find(i => (i.courseId || i.id) === courseId);
  cart = cart.filter(i => (i.courseId || i.id) !== courseId);
  saveCart(cart);

  if (typeof showToast === 'function' && item) {
    showToast(`Removed "${item.title}" from cart`, 'info');
  }
  return true;
}

function clearCart() {
  localStorage.removeItem('berea_cart');
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem('berea_cart_coupon');
  localStorage.removeItem(COUPON_STORAGE_KEY);
  sessionStorage.removeItem('berea_cart_initialized');
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

function getAppliedCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyCoupon(code) {
  if (!code) return { success: false, message: 'Please enter a promo code.' };
  const clean = code.trim().toUpperCase();
  const coupon = DEMO_COUPONS[clean];

  if (coupon) {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    if (typeof showToast === 'function') {
      showToast(`Promo Code "${coupon.code}" applied! (${coupon.desc})`, 'success');
    }
    return { success: true, coupon };
  } else {
    if (typeof showToast === 'function') {
      showToast('Invalid promo code. Try "BIBLE2026" or "GRACE50"', 'danger');
    }
    return { success: false, message: 'Invalid promo code. Valid test codes: BIBLE2026, GRACE50, WELCOME15' };
  }
}

function removeCoupon() {
  localStorage.removeItem(COUPON_STORAGE_KEY);
  if (typeof showToast === 'function') {
    showToast('Promo code removed', 'info');
  }
}

function calculateCartTotals() {
  const cart = getCart();
  const coupon = getAppliedCoupon();

  let subtotal = 0;
  let registrationFeeTotal = 0;

  cart.forEach(item => {
    subtotal += Number(item.price) || 0;
    registrationFeeTotal += Number(item.registrationFee) || 0;
  });

  let discount = 0;
  if (coupon) {
    if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
    } else if (coupon.discountFixed) {
      discount = Math.min(subtotal, coupon.discountFixed);
    }
  }

  const finalTotal = Math.max(0, subtotal + registrationFeeTotal - discount);

  return {
    itemCount: cart.length,
    subtotal,
    registrationFeeTotal,
    discount,
    appliedCoupon: coupon,
    finalTotal
  };
}


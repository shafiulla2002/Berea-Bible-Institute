/**
 * BETHESDA BIBLE INSTITUTE — SHOPPING CART & LIVE COUPON VALIDATION
 * Validates promotional scholarship codes directly against `/api/v1/public/coupons/validate`.
 */

const CART_STORAGE_KEY = 'berea_cart';
const COUPON_STORAGE_KEY = 'berea_applied_coupon';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
  if (typeof updateCourseCardsAuthUI === 'function') {
    updateCourseCardsAuthUI();
  }
}

function addToCart(courseId, batchDate = null) {
  const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;
  if (!course) {
    if (typeof showToast === 'function') {
      showToast('Course details are still loading. Please open the course page.', 'warning');
    }
    return false;
  }

  if (typeof isCourseEnrolled === 'function' && isCourseEnrolled(courseId)) {
    if (typeof showToast === 'function') {
      showToast(`You are already enrolled in "${course.title}".`, 'warning');
    }
    return false;
  }

  const cart = getCart();
  const existingIdx = cart.findIndex((item) => item.courseId === courseId);

  if (existingIdx !== -1) {
    if (batchDate) {
      cart[existingIdx].batch = batchDate;
      saveCart(cart);
      if (typeof showToast === 'function') {
        showToast(`Cohort updated for ${course.title}.`, 'gold');
      }
      return true;
    }
    if (typeof showToast === 'function') {
      showToast(`"${course.title}" is already in your cart.`, 'warning');
    }
    return false;
  }

  cart.push({
    courseId: course.id,
    instituteId: course.instituteId || '',
    code: course.code,
    title: course.title,
    price: course.price,
    pricePaise: course.pricePaise ?? course.price * 100,
    registrationFee: course.registrationFee || 0,
    registrationFeePaise: course.registrationFeePaise ?? (course.registrationFee || 0) * 100,
    batch: batchDate || course.nextBatch || 'Rolling Cohort',
    addedAt: new Date().toISOString(),
  });

  saveCart(cart);
  if (typeof showToast === 'function') {
    showToast(`Added "${course.title}" to your enrollment cart.`, 'success');
  }
  return true;
}

function removeFromCart(courseId) {
  const cart = getCart().filter((item) => item.courseId !== courseId);
  saveCart(cart);
  if (typeof showToast === 'function') {
    showToast('Course removed from your cart.', 'info');
  }
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

function getAppliedCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function applyCoupon(code) {
  if (!code || !code.trim()) {
    if (typeof showToast === 'function') showToast('Please enter a promo code.', 'warning');
    return false;
  }

  const cart = getCart();
  const instituteId = cart[0]?.instituteId || undefined;
  const subtotalPaise = cart.reduce(
    (sum, item) => sum + (item.pricePaise ?? item.price * 100) + (item.registrationFeePaise ?? (item.registrationFee || 0) * 100),
    0,
  );

  if (typeof apiValidateCoupon !== 'function') {
    if (typeof showToast === 'function') showToast('Coupon validation service is unavailable.', 'danger');
    return false;
  }

  const validation = await apiValidateCoupon(code.trim().toUpperCase(), instituteId, subtotalPaise);
  if (!validation || !validation.valid) {
    localStorage.removeItem(COUPON_STORAGE_KEY);
    if (typeof showToast === 'function') {
      showToast(validation?.error || `Coupon code "${code}" is invalid or expired.`, 'danger');
    }
    return false;
  }

  localStorage.setItem(
    COUPON_STORAGE_KEY,
    JSON.stringify({
      code: validation.code,
      type: validation.type,
      value: validation.value,
      discountPaise: validation.discountPaise,
      description:
        validation.type === 'PERCENT'
          ? `${validation.value}% Scholarship Grant`
          : `₹${Math.round(validation.value / 100)} Fee Waiver`,
    }),
  );

  if (typeof showToast === 'function') {
    showToast(`Promo code ${validation.code} applied.`, 'success');
  }
  return true;
}

function removeCoupon() {
  localStorage.removeItem(COUPON_STORAGE_KEY);
  if (typeof showToast === 'function') {
    showToast('Promotional code removed.', 'info');
  }
}

function calculateCartTotals() {
  const cart = getCart();
  const coupon = getAppliedCoupon();

  const subtotalPaise = cart.reduce((sum, item) => sum + (item.pricePaise ?? item.price * 100), 0);
  const regFeePaise = cart.reduce(
    (sum, item) => sum + (item.registrationFeePaise ?? (item.registrationFee || 0) * 100),
    0,
  );

  let discountPaise = 0;
  if (coupon) {
    if (coupon.type === 'PERCENT') {
      discountPaise = Math.round(((subtotalPaise + regFeePaise) * (coupon.value || 0)) / 100);
    } else if (coupon.discountPaise !== undefined) {
      discountPaise = Number(coupon.discountPaise) || 0;
    } else {
      discountPaise = Number(coupon.value) || 0;
    }
    discountPaise = Math.min(subtotalPaise + regFeePaise, Math.max(0, discountPaise));
  }

  const finalTotalPaise = Math.max(0, subtotalPaise + regFeePaise - discountPaise);

  return {
    itemCount: cart.length,
    subtotalPaise,
    registrationFeeTotalPaise: regFeePaise,
    discountPaise,
    finalTotalPaise,
    subtotal: Math.round(subtotalPaise / 100),
    registrationFeeTotal: Math.round(regFeePaise / 100),
    discount: Math.round(discountPaise / 100),
    finalTotal: Math.round(finalTotalPaise / 100),
    appliedCoupon: coupon,
  };
}

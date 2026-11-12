/**
 * BETHESDA BIBLE INSTITUTE — CHECKOUT & RAZORPAY PAYMENT ORCHESTRATOR
 * Creates real server orders via `POST /api/v1/public/orders` and verifies
 * signatures strictly via `POST /api/v1/public/payments/verify`.
 */

let currentStep = 1;
const TOTAL_STEPS = 7;

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof loadPublicCourses === 'function') {
    await loadPublicCourses();
  }
  initCheckout();
});

function initCheckout() {
  if (typeof ensureCheckoutStudentAuth === 'function') {
    if (!ensureCheckoutStudentAuth()) return;
  }

  loadInitialCheckoutData();
  renderCourseSelectionStep();
  bindCheckoutEvents();
  goToStep(1);
}

function loadInitialCheckoutData() {
  try {
    const auth = typeof getAuthenticatedStudent === 'function' ? getAuthenticatedStudent() : {};
    const draft = JSON.parse(localStorage.getItem('berea_student_registration_draft') || '{}');

    if (document.getElementById('checkoutFullName') && (draft.fullName || auth?.fullName)) {
      document.getElementById('checkoutFullName').value = draft.fullName || auth.fullName;
    }
    if (document.getElementById('checkoutEmail') && (draft.email || auth?.email)) {
      document.getElementById('checkoutEmail').value = draft.email || auth.email;
    }
    if (document.getElementById('checkoutPhone') && (draft.mobile || auth?.phone)) {
      document.getElementById('checkoutPhone').value = draft.mobile || auth.phone;
    }
    if (document.getElementById('checkoutAddress') && draft.address) {
      document.getElementById('checkoutAddress').value = draft.address;
    }
    if (document.getElementById('checkoutCity') && draft.city) {
      document.getElementById('checkoutCity').value = draft.city;
    }
    if (document.getElementById('checkoutPostal') && draft.postalCode) {
      document.getElementById('checkoutPostal').value = draft.postalCode;
    }
    if (document.getElementById('checkoutCountry') && draft.country) {
      document.getElementById('checkoutCountry').value = draft.country;
    }
  } catch (e) {}
}

function ensureCheckoutStudentAuth() {
  const isAuthenticated = typeof isStudentAuthenticated === 'function' && isStudentAuthenticated();
  if (isAuthenticated) return true;

  if (typeof openAuthModal === 'function') {
    openAuthModal('signup', 'checkout.html');
  }

  const layout = document.querySelector('.checkout-layout');
  if (layout) {
    layout.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; padding:4rem 2.5rem; text-align:center; max-width:650px; margin:2rem auto; border-top:4px solid var(--gold-500); box-shadow:var(--shadow-lg);">
        <div style="font-size:3rem; margin-bottom:1rem; color:var(--burgundy-800);">🎓</div>
        <h2 style="font-size:1.75rem; color:var(--burgundy-950); margin-bottom:0.75rem;">Student Account Required for Checkout</h2>
        <p style="color:var(--charcoal-600); line-height:1.65; margin-bottom:2rem;">
          Sign in or register a student account to finalize your course enrollment and track tuition receipts.
        </p>
        <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-gold btn-lg" onclick="openAuthModal('signup', 'checkout.html')">
            Create Account to Checkout
          </button>
          <a href="student-login.html" class="btn btn-secondary btn-lg">Sign In Instead</a>
        </div>
      </div>
    `;
  }
  return false;
}

function renderCourseSelectionStep() {
  const container = document.getElementById('checkoutCourseList');
  if (!container) return;

  const cart = typeof getCart === 'function' ? getCart() : [];
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning">
        <span>Your cart has no courses selected yet. <a href="courses.html" style="text-decoration:underline; font-weight:700;">Browse Courses →</a></span>
      </div>
    `;
    renderCheckoutOrderSummary();
    return;
  }

  container.innerHTML = cart
    .map((item) => {
      const course = typeof getCourseById === 'function' ? getCourseById(item.courseId) : null;
      const batches = course && course.availableBatches ? course.availableBatches : [item.batch || 'Standard Cohort'];
      return `
        <div class="card" style="padding:1.25rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div style="flex:1; min-width:220px;">
            <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--gold-700);">${item.code}</span>
            <h4 style="margin:0.25rem 0; color:var(--burgundy-950);">${item.title}</h4>
            <div style="font-size:0.82rem; color:var(--charcoal-500);">Registration Fee: ₹${Number(item.registrationFee || 0).toLocaleString('en-IN')}</div>
          </div>
          <div>
            <select class="form-control form-select checkout-batch-select" data-course-id="${item.courseId}" style="font-size:0.85rem;">
              ${batches.map((b) => `<option value="${b}" ${b === item.batch ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div style="text-align:right; min-width:90px;">
            <strong style="font-size:1.15rem; color:var(--burgundy-900);">₹${Number(item.price || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>
      `;
    })
    .join('');

  attachCourseStepEvents(container);
  renderCheckoutOrderSummary();
}

function attachCourseStepEvents(container) {
  container.querySelectorAll('.checkout-batch-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const cId = e.target.getAttribute('data-course-id');
      const cart = getCart();
      const target = cart.find((i) => i.courseId === cId);
      if (target) {
        target.batch = e.target.value;
        saveCart(cart);
        renderStepReview();
      }
    });
  });
}

function bindCheckoutEvents() {
  document.querySelectorAll('.btn-next-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  document.querySelectorAll('.step-item').forEach((item) => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep < currentStep) {
        goToStep(targetStep);
      }
    });
  });

  const applyPromoBtn = document.getElementById('checkoutApplyPromoBtn');
  const promoInput = document.getElementById('checkoutPromoCode');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', async () => {
      const code = promoInput.value.trim();
      if (typeof applyCoupon === 'function') {
        await applyCoupon(code);
        renderCheckoutOrderSummary();
        renderStepReview();
      }
    });
  }

  const payBtn = document.getElementById('btnSubmitPayment') || document.getElementById('btnSubmitDemoPayment');
  if (payBtn) {
    payBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeLiveCheckoutPayment();
    });
  }
}

function validateCurrentStep(step) {
  let valid = true;
  if (step === 1) {
    const requiredIds = ['checkoutFullName', 'checkoutEmail', 'checkoutPhone'];
    requiredIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.classList.add('is-invalid');
        valid = false;
      } else if (el) {
        el.classList.remove('is-invalid');
      }
    });
    if (!valid && typeof showToast === 'function') {
      showToast('Please enter your name, email, and mobile phone number.', 'danger');
    }
  } else if (step === 2) {
    const cart = getCart();
    if (cart.length === 0) {
      if (typeof showToast === 'function') {
        showToast('Your cart is empty. Select at least one course before continuing.', 'danger');
      }
      valid = false;
    }
  } else if (step === 5) {
    const c1 = document.getElementById('agreeTerms1');
    const c2 = document.getElementById('agreeTerms2');
    if (c1 && !c1.checked) valid = false;
    if (c2 && !c2.checked) valid = false;
    if (!valid && typeof showToast === 'function') {
      showToast('Please accept the Statement of Academic Honor and Refund Policy.', 'warning');
    }
  }
  return valid;
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;
  currentStep = step;
  updateStepUI(step);
  renderCheckoutOrderSummary();
  if (step === 6) {
    renderStepReview();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepUI(activeStep) {
  document.querySelectorAll('.checkout-step-panel').forEach((panel) => {
    const stepNum = parseInt(panel.getAttribute('data-step-panel'), 10);
    panel.style.display = stepNum === activeStep ? 'block' : 'none';
  });
  document.querySelectorAll('.step-item').forEach((item) => {
    const stepNum = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (stepNum < activeStep) item.classList.add('completed');
    else if (stepNum === activeStep) item.classList.add('active');
  });
}

function renderCheckoutOrderSummary() {
  const container = document.getElementById('checkoutSummaryContent');
  if (!container || typeof calculateCartTotals !== 'function') return;

  const totals = calculateCartTotals();
  const cart = getCart();

  container.innerHTML = `
    <div style="margin-bottom:1.25rem;">
      ${cart
        .map(
          (item) => `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.5rem;">
          <span style="color:var(--charcoal-700);">${item.title}</span>
          <strong>₹${Number(item.price || 0).toLocaleString('en-IN')}</strong>
        </div>
      `,
        )
        .join('')}
    </div>
    <div class="summary-row"><span>Tuition Subtotal:</span><span>₹${totals.subtotal.toLocaleString('en-IN')}</span></div>
    <div class="summary-row"><span>Registration Fee:</span><span>₹${totals.registrationFeeTotal.toLocaleString('en-IN')}</span></div>
    ${
      totals.discount > 0
        ? `<div class="summary-row" style="color:var(--status-success); font-weight:700;"><span>Promo Discount (${totals.appliedCoupon?.code || 'CODE'}):</span><span>-₹${totals.discount.toLocaleString('en-IN')}</span></div>`
        : ''
    }
    <div class="summary-total">
      <span class="summary-total-label">Total Payable:</span>
      <span class="summary-total-amount">₹${totals.finalTotal.toLocaleString('en-IN')}</span>
    </div>
  `;
}

function renderStepReview() {
  const container = document.getElementById('checkoutReviewContent');
  if (!container) return;

  const name = document.getElementById('checkoutFullName')?.value || '';
  const email = document.getElementById('checkoutEmail')?.value || '';
  const phone = document.getElementById('checkoutPhone')?.value || '';
  const cart = getCart();
  const totals = calculateCartTotals();

  container.innerHTML = `
    <div class="card" style="padding:1.25rem; background:var(--cream-bg); margin-bottom:1rem;">
      <strong style="color:var(--burgundy-900); display:block; margin-bottom:0.4rem;">Applicant Details</strong>
      <div style="font-size:0.9rem;">${name} • ${email} • ${phone}</div>
    </div>
    <div class="card" style="padding:1.25rem; margin-bottom:1rem;">
      <strong style="color:var(--burgundy-900); display:block; margin-bottom:0.4rem;">Selected Courses (${cart.length})</strong>
      ${cart.map((c) => `<div style="font-size:0.88rem;">• ${c.title} (${c.batch}) — ₹${Number(c.price || 0).toLocaleString('en-IN')}</div>`).join('')}
    </div>
    <div style="font-weight:700; font-size:1.05rem; color:var(--burgundy-950);">
      Final Payable Amount: ₹${totals.finalTotal.toLocaleString('en-IN')}
    </div>
  `;
}

async function executeLiveCheckoutPayment() {
  const payBtn = document.getElementById('btnSubmitPayment') || document.getElementById('btnSubmitDemoPayment');
  const cart = getCart();
  if (cart.length === 0) {
    if (typeof showToast === 'function') showToast('Your cart is empty.', 'danger');
    return;
  }

  const instituteId = cart[0].instituteId;
  if (!instituteId) {
    if (typeof showToast === 'function') showToast('Course institute information is missing. Please re-add from catalog.', 'danger');
    return;
  }

  const fullName = document.getElementById('checkoutFullName')?.value?.trim() || 'Student';
  const email = document.getElementById('checkoutEmail')?.value?.trim() || '';
  const phoneNumber = document.getElementById('checkoutPhone')?.value?.trim() || '';
  const coupon = typeof getAppliedCoupon === 'function' ? getAppliedCoupon() : null;
  const totals = calculateCartTotals();
  const urlParams = new URLSearchParams(window.location.search);
  const admissionId = urlParams.get('admissionId') || undefined;

  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = '<span>⏳ Creating Secure Server Order...</span>';
  }

  const orderRes = await apiCreatePublicOrder({
    instituteId,
    courseIds: cart.map((c) => c.courseId),
    couponCode: coupon?.code,
    admissionId,
    fullName,
    phoneNumber,
    email: email || undefined,
  });

  if (!orderRes.success) {
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = 'Proceed to Secure Razorpay Payment';
    }
    if (typeof showToast === 'function') showToast(orderRes.message, 'danger');
    return;
  }

  const order = orderRes.order;
  const isMockPayment = Boolean(order.mockPayment || order.gatewayMode === 'MOCK');
  const orderSummarySnapshot = {
    orderRef: order.orderNumber,
    studentName: fullName,
    studentEmail: email,
    courses: cart,
    totals,
    mockPayment: isMockPayment,
    mockPaymentMessage:
      order.mockPaymentMessage ||
      'No amount will be debited from your account because Razorpay keys are not added yet.',
    paidAt: new Date().toISOString(),
  };
  localStorage.setItem('berea_last_order', JSON.stringify(orderSummarySnapshot));

  // Case 1: Mock Payment (until Razorpay keys are configured) or Free / 100% scholarship checkout
  if (!order.paymentRequired) {
    if (isMockPayment && typeof showToast === 'function') {
      showToast(
        'No amount will be debited from your account because Razorpay keys are not added yet. Completing transaction...',
        'success'
      );
    }
    if (payBtn) {
      payBtn.innerHTML = '<span>✓ Mock Payment Complete (₹0 Debited) — Redirecting...</span>';
    }
    await apiFetchStudentCourses();
    clearCart();
    const modeParam = isMockPayment ? 'mock' : 'free';
    setTimeout(() => {
      window.location.href = `payment-result.html?status=success&mode=${modeParam}&ref=${encodeURIComponent(order.orderNumber)}`;
    }, 900);
    return;
  }

  // Case 2: Razorpay Checkout flow (strict signature verification on backend)
  if (typeof window.Razorpay === 'function' && order.razorpayKeyId && order.providerOrderId) {
    const rzp = new window.Razorpay({
      key: order.razorpayKeyId,
      amount: order.amountPaise,
      currency: order.currency || 'INR',
      name: 'Bethesda Bible Institute',
      description: `${cart.length} Course Enrollment(s)`,
      order_id: order.providerOrderId,
      prefill: { name: fullName, email, contact: phoneNumber },
      handler: async (response) => {
        const verification = await apiVerifyRazorpayPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          method: 'RAZORPAY',
        });
        if (verification && verification.verified) {
          await apiFetchStudentCourses();
          clearCart();
          window.location.href = `payment-result.html?status=success&ref=${encodeURIComponent(order.orderNumber)}`;
        } else {
          window.location.href = `payment-result.html?status=failed&ref=${encodeURIComponent(order.orderNumber)}`;
        }
      },
      modal: {
        ondismiss: () => {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = 'Proceed to Secure Razorpay Payment';
          }
          if (typeof showToast === 'function') {
            showToast('Payment checkout closed before completion.', 'warning');
          }
        },
      },
    });
    rzp.open();
    return;
  }

  // Gateway order created — instruct user if Razorpay SDK script wasn't loaded
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.textContent = 'Proceed to Secure Razorpay Payment';
  }
  window.location.href = `payment-result.html?status=pending&ref=${encodeURIComponent(order.orderNumber)}`;
}

/**
 * BEREA BIBLE INSTITUTE & THEOLOGICAL SEMINARY
 * Multi-Step Checkout Controller (Steps 1–7) & Demo Payment Simulation
 */

let currentStep = 1;
const TOTAL_STEPS = 7;

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

function initCheckout() {
  const checkoutContainer = document.getElementById('checkoutContainer');
  if (!checkoutContainer) return;

  loadInitialCheckoutData();
  renderCheckoutOrderSummary();
  bindCheckoutEvents();
  updateStepUI(currentStep);
}

function loadInitialCheckoutData() {
  // Populate personal info from registration draft if available
  try {
    const regRaw = localStorage.getItem('berea_prototype_student_registration');
    if (regRaw) {
      const regData = JSON.parse(regRaw);
      const nameInput = document.getElementById('checkoutFullName');
      const emailInput = document.getElementById('checkoutEmail');
      const phoneInput = document.getElementById('checkoutPhone');
      const addressInput = document.getElementById('checkoutAddress');
      const cityInput = document.getElementById('checkoutCity');
      const countryInput = document.getElementById('checkoutCountry');
      const postalInput = document.getElementById('checkoutPostal');

      if (nameInput && regData.fullName) nameInput.value = regData.fullName;
      if (emailInput && regData.email) emailInput.value = regData.email;
      if (phoneInput && regData.mobile) phoneInput.value = regData.mobile;
      if (addressInput && regData.address) addressInput.value = regData.address;
      if (cityInput && regData.city) cityInput.value = regData.city;
      if (countryInput && regData.country) countryInput.value = regData.country;
      if (postalInput && regData.postalCode) postalInput.value = regData.postalCode;
    }
  } catch (e) {
    console.warn('Draft load note:', e);
  }

  // Populate course selection table in Step 2
  renderCourseSelectionStep();
}

function ensureCheckoutStudentAuth() {
  if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
    const nameInput = document.getElementById('checkoutFullName');
    const emailInput = document.getElementById('checkoutEmail');
    const phoneInput = document.getElementById('checkoutPhone');
    const name = (nameInput && nameInput.value.trim()) || 'Admissions Candidate';
    const email = (emailInput && emailInput.value.trim()) || 'candidate@bethesdabible.edu';
    const phone = (phoneInput && phoneInput.value.trim()) || '+91 (040) 2765-0199';
    if (typeof loginStudent === 'function') {
      loginStudent({
        fullName: name,
        email: email,
        phone: phone,
        status: 'Active Matriculated Candidate'
      });
    }
  }
}

function renderCourseSelectionStep() {
  const container = document.getElementById('checkoutCourseList');
  if (!container) return;

  const cart = typeof getCart === 'function' ? getCart() : [];
  const allCourses = typeof getAllCourses === 'function'
    ? getAllCourses()
    : (typeof SAMPLE_COURSES !== 'undefined' ? SAMPLE_COURSES : []);

  const cartIds = new Set(cart.map(item => item.courseId || item.id));
  const availableToSelect = allCourses.filter(c => !cartIds.has(c.id));

  let html = '';

  // 1. If user has courses in cart, display Selected Cohorts section
  if (cart.length > 0) {
    html += `
      <div style="margin-bottom:1.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem; padding:0.6rem 0.85rem; background:rgba(30, 126, 52, 0.08); border:1px solid rgba(30, 126, 52, 0.25); border-radius:var(--radius-sm);">
          <span style="font-weight:700; color:#1E7E34; font-size:0.9rem; display:flex; align-items:center; gap:0.4rem;">
            <span>✓</span> Selected Cohort(s) for Admission (${cart.length})
          </span>
          <span style="font-size:0.8rem; color:#1E7E34; font-weight:600;">Eligible to move forward to next step →</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${cart.map(item => {
            const course = typeof getCourseById === 'function' ? getCourseById(item.courseId) : null;
            const batchOptions = course && course.availableBatches
              ? course.availableBatches.map(b => `<option value="${b}" ${b === item.batch ? 'selected' : ''}>${b}</option>`).join('')
              : `<option value="${item.batch || 'Standard Cohort'}">${item.batch || 'Standard Cohort'}</option>`;

            return `
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1.15rem; border:1px solid var(--cream-border); border-left:4px solid var(--gold-500); border-radius:var(--radius-md); background:#FFFFFF; box-shadow:0 2px 6px rgba(42, 10, 18, 0.04);">
                <div style="flex:1; min-width:240px;">
                  <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--gold-800); background:var(--gold-50); padding:0.15rem 0.5rem; border-radius:4px; border:1px solid var(--gold-300);">${item.code}</span>
                  <h4 style="font-size:1.05rem; font-weight:700; color:var(--burgundy-950); margin:0.35rem 0 0.5rem;">${item.title}</h4>
                  <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--charcoal-600); flex-wrap:wrap;">
                    <label style="font-weight:600;">Cohort Schedule:</label>
                    <select class="form-control form-select batch-selector" data-course-id="${item.courseId}" style="width:auto; padding:0.35rem 2rem 0.35rem 0.75rem; font-size:0.85rem;">
                      ${batchOptions}
                    </select>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:1.25rem;">
                  <div style="text-align:right;">
                    <p style="font-size:0.72rem; color:var(--charcoal-500); text-transform:uppercase; margin:0;">Tuition</p>
                    <p style="font-family:var(--font-serif); font-size:1.35rem; font-weight:800; color:var(--burgundy-900); margin:0;">$${item.price}</p>
                    <p style="font-size:0.7rem; color:var(--charcoal-500); margin:0;">+$${item.registrationFee || 35} reg fee</p>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm btn-remove-checkout-course" data-course-id="${item.courseId}" title="Remove course" style="padding:0.4rem 0.75rem; font-size:0.8rem; color:var(--burgundy-700); border-color:#e0d0d5;">
                    ✕ Remove
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 2. If cart is empty, show instructional guidance banner
  if (cart.length === 0) {
    html += `
      <div style="background:#FFF9EB; border:1px solid #FFE6A5; border-radius:var(--radius-md); padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:0.9rem;">
        <span style="font-size:1.6rem; line-height:1; flex-shrink:0;">📚</span>
        <div>
          <h4 style="font-size:1.02rem; font-weight:700; color:var(--burgundy-950); margin:0 0 0.3rem;">Please Select Your Course(s) to Move Forward</h4>
          <p style="font-size:0.875rem; color:var(--charcoal-700); margin:0; line-height:1.45;">
            You have not selected a course yet. Choose one or more theological courses below to enroll into this semester. Click <strong>+ Select Course</strong> on any course, and you will be able to proceed directly to Discounts & Credits.
          </p>
        </div>
      </div>
    `;
  }

  // 3. Render available courses list to choose from (either empty state or add another course)
  if (availableToSelect.length > 0) {
    html += `
      <div style="${cart.length > 0 ? 'margin-top:2rem; padding-top:1.5rem; border-top:1px dashed var(--cream-border);' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-size:1.05rem; font-weight:700; color:var(--burgundy-950); margin:0; display:flex; align-items:center; gap:0.5rem;">
            ${cart.length > 0 ? '➕ Add Another Course to Your Admission' : '📖 Available Theological Courses'}
            <span style="font-size:0.75rem; font-weight:600; color:var(--gold-800); background:var(--gold-50); border:1px solid var(--gold-300); padding:0.15rem 0.5rem; border-radius:12px;">${availableToSelect.length} Available</span>
          </h3>
          <span style="font-size:0.8rem; color:var(--charcoal-500);">Fall 2026 Academic Term</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.9rem;">
          ${availableToSelect.map(course => {
            const batchOptions = course.availableBatches
              ? course.availableBatches.map(b => `<option value="${b}">${b}</option>`).join('')
              : `<option value="${course.nextBatch || 'Fall 2026'}">${course.nextBatch || 'Fall 2026'}</option>`;

            return `
              <div class="admission-course-card" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; padding:1.15rem 1.25rem; border:1px solid var(--cream-border); border-radius:var(--radius-md); background:#FFFFFF; transition:all 0.2s ease;">
                <div style="display:flex; align-items:center; gap:1rem; flex:1; min-width:280px;">
                  <img src="${course.image || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=400&q=80'}" alt="${course.title}" style="width:68px; height:68px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--cream-border); flex-shrink:0;">
                  <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem; flex-wrap:wrap;">
                      <span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--gold-800); background:var(--gold-50); padding:0.15rem 0.5rem; border-radius:4px; border:1px solid var(--gold-300);">${course.code}</span>
                      <span style="font-size:0.75rem; color:var(--charcoal-500); font-weight:600;">${course.category} • ${course.duration} (${course.credits} cr)</span>
                    </div>
                    <h4 style="font-size:1.02rem; font-weight:700; color:var(--burgundy-950); margin:0 0 0.25rem;">${course.title}</h4>
                    <div style="font-size:0.8rem; color:var(--charcoal-600); display:flex; align-items:center; gap:0.35rem;">
                      <span>Faculty:</span>
                      <strong style="color:var(--burgundy-900);">${course.instructor ? course.instructor.name : 'Seminary Faculty'}</strong>
                    </div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;">
                  <div style="min-width:190px;">
                    <label style="display:block; font-size:0.75rem; font-weight:600; color:var(--charcoal-600); margin-bottom:0.25rem;">Select Cohort Schedule:</label>
                    <select class="form-control form-select admission-cohort-select" data-course-id="${course.id}" style="font-size:0.82rem; padding:0.35rem 1.8rem 0.35rem 0.65rem; width:100%;">
                      ${batchOptions}
                    </select>
                  </div>

                  <div style="text-align:right; min-width:85px;">
                    <span style="font-size:0.72rem; color:var(--charcoal-500); text-transform:uppercase; display:block;">Tuition</span>
                    <span style="font-family:var(--font-serif); font-size:1.35rem; font-weight:800; color:var(--burgundy-900);">$${course.price}</span>
                    <span style="font-size:0.7rem; color:var(--charcoal-500); display:block;">+$${course.registrationFee || 35} reg fee</span>
                  </div>

                  <div>
                    <button type="button" class="btn btn-primary btn-sm btn-select-admission-course" data-course-id="${course.id}" style="padding:0.55rem 1.15rem; font-size:0.85rem; font-weight:700; white-space:nowrap; border-radius:var(--radius-sm); box-shadow:0 2px 4px rgba(42, 10, 18, 0.15);">
                      + Select Course
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Bind interaction handlers within Step 2
  attachCourseStepEvents(container);
}

function attachCourseStepEvents(container) {
  // 1. Select Course button handler
  container.querySelectorAll('.btn-select-admission-course').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      ensureCheckoutStudentAuth();
      const courseId = btn.getAttribute('data-course-id');
      const selectElem = container.querySelector(`.admission-cohort-select[data-course-id="${courseId}"]`);
      const chosenBatch = selectElem ? selectElem.value : null;

      if (typeof addToCart === 'function') {
        const added = addToCart(courseId, chosenBatch);
        if (added) {
          renderCourseSelectionStep();
          renderCheckoutOrderSummary();
          if (typeof updateCartBadge === 'function') updateCartBadge();
          if (typeof showToast === 'function') {
            const course = typeof getCourseById === 'function' ? getCourseById(courseId) : null;
            showToast(`✓ Selected ${course ? course.code : 'course'}! You can now move forward to Discounts & Credits.`, 'success');
          }
        }
      }
    });
  });

  // 2. Remove Course button handler
  container.querySelectorAll('.btn-remove-checkout-course').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseId = btn.getAttribute('data-course-id');
      if (typeof removeFromCart === 'function') {
        removeFromCart(courseId);
        renderCourseSelectionStep();
        renderCheckoutOrderSummary();
        if (typeof updateCartBadge === 'function') updateCartBadge();
      }
    });
  });

  // 3. Batch change handler
  container.querySelectorAll('.batch-selector').forEach(sel => {
    sel.addEventListener('change', () => {
      const courseId = sel.getAttribute('data-course-id');
      const cart = typeof getCart === 'function' ? getCart() : [];
      const item = cart.find(i => (i.courseId || i.id) === courseId);
      if (item) {
        item.batch = sel.value;
        if (typeof saveCart === 'function') saveCart(cart);
        renderCheckoutOrderSummary();
      }
    });
  });
}

function bindCheckoutEvents() {
  // Stepper navigation buttons (Next/Back)
  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  // Direct click on completed steps in header
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.getAttribute('data-step'), 10);
      if (targetStep < currentStep) {
        goToStep(targetStep);
      }
    });
  });

  // Promo code apply in Step 3
  const applyPromoBtn = document.getElementById('checkoutApplyPromoBtn');
  const promoInput = document.getElementById('checkoutPromoCode');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim();
      if (typeof applyCoupon === 'function') {
        applyCoupon(code);
        renderCheckoutOrderSummary();
        renderStepReview();
      }
    });
  }

  // Demo payment button
  const demoPayBtn = document.getElementById('btnSubmitDemoPayment');
  if (demoPayBtn) {
    demoPayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeDemoPayment();
    });
  }
}

function validateCurrentStep(step) {
  let valid = true;

  if (step === 1) {
    // Validate Personal info
    const requiredInputs = document.querySelectorAll('#step-1 input[required]');
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        valid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });
    if (!valid && typeof showToast === 'function') {
      showToast('Please fill out all required personal information fields.', 'danger');
    } else if (valid) {
      ensureCheckoutStudentAuth();
    }
  } else if (step === 2) {
    const cart = typeof getCart === 'function' ? getCart() : [];
    if (cart.length === 0) {
      if (typeof showToast === 'function') showToast('Please select at least one course from the list below to move forward.', 'danger');
      valid = false;
    }
  } else if (step === 4) {
    // Policy acceptance check
    const honorCheck = document.getElementById('policyHonorCode');
    const doctrinalCheck = document.getElementById('policyStatementOfFaith');
    const refundCheck = document.getElementById('policyRefundPolicy');

    if ((honorCheck && !honorCheck.checked) || (doctrinalCheck && !doctrinalCheck.checked) || (refundCheck && !refundCheck.checked)) {
      if (typeof showToast === 'function') {
        showToast('You must acknowledge and accept all institutional academic policies.', 'danger');
      }
      valid = false;
    }
  } else if (step === 5) {
    // Referral
    const referralSelect = document.getElementById('referralSource');
    if (referralSelect && !referralSelect.value) {
      referralSelect.classList.add('is-invalid');
      if (typeof showToast === 'function') showToast('Please let us know how you heard about Bethesda.', 'danger');
      valid = false;
    } else if (referralSelect) {
      referralSelect.classList.remove('is-invalid');
    }
  }

  return valid;
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;
  currentStep = step;
  updateStepUI(currentStep);

  if (currentStep === 2) {
    renderCourseSelectionStep();
  }

  if (currentStep === 6) {
    renderStepReview();
  }

  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function updateStepUI(activeStep) {
  // Update step indicators
  document.querySelectorAll('.step-item').forEach(item => {
    const s = parseInt(item.getAttribute('data-step'), 10);
    item.classList.remove('active', 'completed');
    if (s === activeStep) {
      item.classList.add('active');
    } else if (s < activeStep) {
      item.classList.add('completed');
    }
  });

  // Show/Hide Step panels
  document.querySelectorAll('.checkout-step-panel').forEach(panel => {
    const panelStep = parseInt(panel.getAttribute('data-step-panel'), 10);
    panel.style.display = panelStep === activeStep ? 'block' : 'none';
  });
}

function renderCheckoutOrderSummary() {
  const container = document.getElementById('checkoutSummaryContent');
  if (!container) return;

  const cart = typeof getCart === 'function' ? getCart() : [];
  const totals = typeof calculateCartTotals === 'function'
    ? calculateCartTotals()
    : { subtotal: 0, registrationFeeTotal: 0, discount: 0, finalTotal: 0 };

  container.innerHTML = `
    <div style="margin-bottom:1.25rem;">
      ${cart.map(item => `
        <div class="summary-item">
          <div>
            <div class="summary-item-name">${item.title}</div>
            <div class="summary-item-meta">${item.code} • ${item.batch || 'Cohort 2026'}</div>
          </div>
          <div class="summary-item-price">$${item.price}</div>
        </div>
      `).join('')}
    </div>

    <div class="summary-row">
      <span>Course Tuition (${totals.itemCount} items)</span>
      <span>$${totals.subtotal}</span>
    </div>

    <div class="summary-row">
      <span>Registration & Processing Fee</span>
      <span>$${totals.registrationFeeTotal}</span>
    </div>

    ${totals.discount > 0 ? `
      <div class="summary-row" style="color:var(--status-success); font-weight:700;">
        <span>Promo Discount (${totals.appliedCoupon.code})</span>
        <span>-$${totals.discount}</span>
      </div>
    ` : ''}

    <div class="summary-total">
      <span class="summary-total-label">Total Payable</span>
      <span class="summary-total-amount">$${totals.finalTotal}</span>
    </div>
  `;
}

function renderStepReview() {
  const reviewContainer = document.getElementById('checkoutReviewSummary');
  if (!reviewContainer) return;

  const cart = typeof getCart === 'function' ? getCart() : [];
  const totals = typeof calculateCartTotals === 'function' ? calculateCartTotals() : {};

  const fullName = document.getElementById('checkoutFullName')?.value || 'N/A';
  const email = document.getElementById('checkoutEmail')?.value || 'N/A';
  const phone = document.getElementById('checkoutPhone')?.value || 'N/A';
  const address = document.getElementById('checkoutAddress')?.value || 'N/A';
  const referral = document.getElementById('referralSource')?.value || 'Web Search';

  reviewContainer.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
      <div style="padding:1.25rem; background:var(--cream-bg); border-radius:var(--radius-md); border:1px solid var(--cream-border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:1rem; font-weight:700; color:var(--burgundy-900);">Personal Details</h4>
          <button type="button" class="btn btn-secondary btn-sm" onclick="goToStep(1)">Edit</button>
        </div>
        <p style="font-size:0.875rem;"><strong>Name:</strong> ${fullName}</p>
        <p style="font-size:0.875rem;"><strong>Email:</strong> ${email}</p>
        <p style="font-size:0.875rem;"><strong>Phone:</strong> ${phone}</p>
        <p style="font-size:0.875rem;"><strong>Address:</strong> ${address}</p>
      </div>

      <div style="padding:1.25rem; background:var(--cream-bg); border-radius:var(--radius-md); border:1px solid var(--cream-border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:1rem; font-weight:700; color:var(--burgundy-900);">Enrollment Program</h4>
          <button type="button" class="btn btn-secondary btn-sm" onclick="goToStep(2)">Edit</button>
        </div>
        <p style="font-size:0.875rem;"><strong>Total Courses:</strong> ${cart.length}</p>
        <p style="font-size:0.875rem;"><strong>Referral Channel:</strong> ${referral}</p>
        <p style="font-size:0.875rem;"><strong>Institutional Policies:</strong> <span style="color:var(--status-success); font-weight:700;">Accepted</span></p>
      </div>
    </div>
  `;
}

function executeDemoPayment() {
  const payBtn = document.getElementById('btnSubmitDemoPayment');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <span style="display:inline-block; animation:spin 1s linear infinite; margin-right:0.5rem;">⟳</span>
      Simulating Secure Demonstration Transaction...
    `;
  }

  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'CARD';
  const cart = typeof getCart === 'function' ? getCart() : [];
  const totals = typeof calculateCartTotals === 'function' ? calculateCartTotals() : {};

  const orderRecord = {
    orderRef: `BBI-${Date.now().toString().slice(-6)}`,
    studentName: document.getElementById('checkoutFullName')?.value || 'Student Candidate',
    email: document.getElementById('checkoutEmail')?.value || 'student@example.org',
    courses: cart,
    totals: totals,
    method: selectedMethod,
    paidAt: new Date().toISOString()
  };

  localStorage.setItem('berea_last_order', JSON.stringify(orderRecord));

  // Save to enrolled courses for the student dashboard demo
  try {
    const existingEnrolled = JSON.parse(localStorage.getItem('berea_enrolled_courses') || '[]');
    cart.forEach(c => {
      if (!existingEnrolled.some(e => e.courseId === c.courseId)) {
        existingEnrolled.push({
          courseId: c.courseId,
          code: c.code,
          title: c.title,
          batch: c.batch || 'Spring 2026',
          progressPct: 0,
          status: 'ACTIVE',
          enrolledAt: new Date().toISOString()
        });
      }
    });
    localStorage.setItem('berea_enrolled_courses', JSON.stringify(existingEnrolled));
    if (typeof apiSaveEnrollment === 'function') {
      apiSaveEnrollment(cart);
    }
  } catch (e) {}

  setTimeout(() => {
    // Clear shopping cart after successful enrollment simulation
    if (typeof clearCart === 'function') clearCart();
    window.location.href = `payment-result.html?status=success&ref=${orderRecord.orderRef}`;
  }, 1600);
}


/**
 * BEREA BIBLE INSTITUTE & THEOLOGICAL SEMINARY
 * Global Application Controller, Student Authentication, Toast Notifications & Shell Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initShellNavigation();
  updateCartBadge();
  setupGlobalCartListeners();
  setupCartCheckoutProtection();
  updateHeaderAuthUI();
  updateCourseCardsAuthUI();
  updateFirstTimeVisitorBanner();
  seedInitialCartIfEmpty();
  initPrototypeNavigator();
});

/**
 * Student Authentication State & First-Time Visitor Check
 */
function isStudentAuthenticated() {
  const student = localStorage.getItem('berea_auth_student');
  if (!student) return false;
  try {
    const parsed = JSON.parse(student);
    return !!(parsed && (parsed.email || parsed.studentId));
  } catch (e) {
    return false;
  }
}

function getAuthenticatedStudent() {
  const student = localStorage.getItem('berea_auth_student');
  if (!student) return null;
  try {
    return JSON.parse(student);
  } catch (e) {
    return null;
  }
}

function loginStudent(studentData) {
  localStorage.setItem('berea_auth_student', JSON.stringify(studentData));
  
  if (!localStorage.getItem('berea_student_registration')) {
    const draft = {
      fullName: studentData.fullName,
      email: studentData.email,
      phone: studentData.phone || '+1 (555) 234-5678',
      intendedTrack: studentData.track || 'Biblical Studies & Exegesis',
      country: 'United States',
      academicHonorCode: true,
      statementOfFaith: true,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('berea_student_registration', JSON.stringify(draft));
  }

  updateHeaderAuthUI();
  updateCourseCardsAuthUI();
  updateFirstTimeVisitorBanner();
}

function logoutStudent() {
  localStorage.removeItem('berea_auth_student');
  if (typeof clearCart === 'function') {
    clearCart();
  } else {
    localStorage.removeItem('berea_cart');
    localStorage.removeItem('berea_prototype_cart');
  }
  showToast('You have been signed out of your student account.', 'gold');
  updateHeaderAuthUI();
  updateCourseCardsAuthUI();
  updateFirstTimeVisitorBanner();
  updateCartBadge();
  setTimeout(() => {
    if (window.location.pathname.includes('student-dashboard')) {
      window.location.href = 'index.html';
    } else {
      window.location.reload();
    }
  }, 600);
}

/**
 * Sync header with authenticated state & Hide Admissions for registered students
 */
function updateHeaderAuthUI() {
  const isAuth = isStudentAuthenticated();
  const student = getAuthenticatedStudent();

  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const mobileToggle = navActions.querySelector('.mobile-nav-toggle');
    const isDashboardPage = window.location.pathname.includes('student-dashboard');

    // Remove old auth buttons or user pills
    navActions.querySelectorAll('.user-auth-pill, .btn-auth-signin, .btn-auth-signup, .btn-logout-trigger, .btn-my-portal, button[onclick*="logoutStudent"]').forEach(el => el.remove());
    navActions.querySelectorAll('a.btn-secondary, a.btn-primary').forEach(el => {
      const href = el.getAttribute('href');
      if (href === 'student-login.html' || href === 'registration.html') {
        el.remove();
      }
    });

    if (isAuth && student) {
      const initials = (student.fullName || 'Student')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      const firstName = (student.fullName || 'Student').split(' ')[0];

      const userPill = document.createElement('div');
      userPill.className = 'user-auth-pill';
      userPill.innerHTML = `
        <span class="user-avatar-tag">${initials}</span>
        <span class="user-greeting">Hi, ${firstName}</span>
      `;

      let portalBtn = null;
      // Only display "My Portal" shortcut when on pages OTHER than student-dashboard
      if (!isDashboardPage) {
        portalBtn = document.createElement('a');
        portalBtn.href = 'student-dashboard.html';
        portalBtn.className = 'btn btn-secondary btn-sm btn-my-portal';
        portalBtn.textContent = 'My Portal';
      }

      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'btn btn-outline btn-sm btn-logout-trigger';
      logoutBtn.textContent = 'Sign Out';
      logoutBtn.onclick = logoutStudent;

      if (mobileToggle) {
        navActions.insertBefore(userPill, mobileToggle);
        if (portalBtn) navActions.insertBefore(portalBtn, mobileToggle);
        navActions.insertBefore(logoutBtn, mobileToggle);
      } else {
        navActions.appendChild(userPill);
        if (portalBtn) navActions.appendChild(portalBtn);
        navActions.appendChild(logoutBtn);
      }

      // HIDE ADMISSIONS BUTTON AND APPLICATION LINKS (Student is already enrolled!)
      document.querySelectorAll('.nav-menu a, .drawer-links a').forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = (link.textContent || '').trim().toLowerCase();
        if (href.includes('registration.html') || text.includes('admission') || text.includes('apply')) {
          link.style.display = 'none';
        }
      });

      // Update hero section action button on Home page
      const heroApplyBtn = document.querySelector('.hero-actions a[href="registration.html"]');
      if (heroApplyBtn) {
        heroApplyBtn.href = 'student-dashboard.html';
        heroApplyBtn.textContent = '🎓 Go to My Student Portal';
      }

      // Update institutional crest CTA button
      const crestApplyBtn = document.querySelector('section#about a[href="registration.html"]');
      if (crestApplyBtn) {
        crestApplyBtn.href = 'student-dashboard.html';
        crestApplyBtn.textContent = 'Access My Portal';
      }

      // Update top announcement bar
      const topbarText = document.querySelector('.topbar .container > div:first-child');
      if (topbarText) {
        topbarText.innerHTML = `
          <span class="text-gold font-bold">Fall 2026 Academic Term:</span>
          <span>Welcome back, ${student.fullName}. Access your lectures and classes in your Student Portal.</span>
        `;
      }
    } else {
      const signinBtn = document.createElement('a');
      signinBtn.href = 'student-login.html';
      signinBtn.className = 'btn btn-secondary btn-sm btn-auth-signin';
      signinBtn.textContent = 'Sign In';

      const signupBtn = document.createElement('button');
      signupBtn.type = 'button';
      signupBtn.className = 'btn btn-primary btn-sm btn-auth-signup';
      signupBtn.textContent = 'Sign Up';
      signupBtn.onclick = () => openAuthModal('signup');

      if (mobileToggle) {
        navActions.insertBefore(signinBtn, mobileToggle);
        navActions.insertBefore(signupBtn, mobileToggle);
      } else {
        navActions.appendChild(signinBtn);
        navActions.appendChild(signupBtn);
      }

      // Restore Admissions link for guests
      document.querySelectorAll('.nav-menu a, .drawer-links a').forEach(link => {
        link.style.display = '';
      });
      const heroApplyBtn = document.querySelector('.hero-actions a[href="student-dashboard.html"]');
      if (heroApplyBtn) {
        heroApplyBtn.href = 'registration.html';
        heroApplyBtn.textContent = 'Apply for Enrollment';
      }
    }
  }

  // Mobile Drawer sync
  const drawerFooter = document.querySelector('.drawer-footer');
  if (drawerFooter) {
    if (isAuth && student) {
      drawerFooter.innerHTML = `
        <div style="text-align:center; margin-bottom:0.75rem; color:var(--burgundy-900); font-weight:700;">
          Signed in as ${student.fullName}
        </div>
        <a href="student-dashboard.html" class="btn btn-primary btn-block">Go to My Portal</a>
        <button type="button" class="btn btn-secondary btn-block" onclick="logoutStudent()">Sign Out</button>
      `;
    } else {
      drawerFooter.innerHTML = `
        <button type="button" class="btn btn-primary btn-block" onclick="openAuthModal('signup')">Create Student Account</button>
        <a href="student-login.html" class="btn btn-secondary btn-block">Sign In to Portal</a>
      `;
    }
  }
}

/**
 * Sync all course card buttons on the page with Auth state & Enrolled status
 */
function updateCourseCardsAuthUI() {
  const isAuth = isStudentAuthenticated();
  document.querySelectorAll('.course-card').forEach(card => {
    const courseId = card.getAttribute('data-course-id');
    const isEnrolled = typeof isCourseEnrolled === 'function' && isCourseEnrolled(courseId);
    const actionsDiv = card.querySelector('.course-actions');
    const btn = card.querySelector('.btn-add-cart');

    if (isEnrolled && actionsDiv) {
      const existingPortal = actionsDiv.querySelector('.btn-view-enrolled');
      if (!existingPortal) {
        if (btn) btn.remove();
        const portalBtn = document.createElement('a');
        portalBtn.href = 'student-dashboard.html';
        portalBtn.className = 'btn btn-secondary btn-sm btn-view-enrolled';
        portalBtn.style.fontWeight = '700';
        portalBtn.style.color = 'var(--burgundy-900)';
        portalBtn.style.borderColor = 'var(--burgundy-700)';
        portalBtn.innerHTML = `✓ My Portal`;
        actionsDiv.appendChild(portalBtn);
      }
    } else if (btn) {
      if (isAuth) {
        btn.className = 'btn btn-primary btn-sm btn-add-cart';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart`;
        btn.title = 'Add this course to your enrollment cart';
      } else {
        btn.className = 'btn btn-gold btn-sm btn-add-cart';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Sign Up to Buy`;
        btn.title = 'Sign up for a free student account to buy and enroll in this course';
      }
    }
  });
}

/**
 * First-Time Visitor Notification Banner
 */
function updateFirstTimeVisitorBanner() {
  const existing = document.getElementById('welcomeFirstTimeBanner');
  const isAuth = isStudentAuthenticated();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  if (isAuth || sessionStorage.getItem('berea_welcome_dismissed') === 'true' || currentPath === 'student-login.html') {
    if (existing) existing.remove();
    return;
  }

  if (!existing) {
    const banner = document.createElement('div');
    banner.className = 'welcome-first-time-banner';
    banner.id = 'welcomeFirstTimeBanner';
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <span style="color:var(--gold-400); font-weight:700;">✨ Welcome to Berea Bible Institute:</span>
        <span>First time visiting? Sign up for a free student account to enroll in courses and access syllabi.</span>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <button type="button" class="banner-cta" onclick="openAuthModal('signup')">Sign Up Free</button>
        <button type="button" style="background:transparent; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:1.15rem; line-height:1; padding:0 0.4rem;" onclick="dismissWelcomeBanner()">×</button>
      </div>
    `;
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      siteHeader.parentElement.insertBefore(banner, siteHeader);
    } else {
      document.body.prepend(banner);
    }
  }
}

function dismissWelcomeBanner() {
  sessionStorage.setItem('berea_welcome_dismissed', 'true');
  const banner = document.getElementById('welcomeFirstTimeBanner');
  if (banner) banner.remove();
}

/**
 * Intercept Checkout & Fast-Enroll clicks if unauthenticated
 */
function setupCartCheckoutProtection() {
  // On cart.html, protect "Proceed to Checkout"
  const checkoutBtn = document.querySelector('a[href="checkout.html"]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      if (!isStudentAuthenticated()) {
        e.preventDefault();
        openAuthModal('signup', 'checkout.html');
      }
    });
  }

  // On course-details.html, protect "Enroll Now" and "Add to Cart"
  const detailEnrollBtn = document.getElementById('btnDetailEnrollNow');
  if (detailEnrollBtn) {
    detailEnrollBtn.addEventListener('click', (e) => {
      if (!isStudentAuthenticated()) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id') || 'course-bib-101';
        sessionStorage.setItem('berea_pending_course', courseId);
        openAuthModal('signup', 'checkout.html', courseId);
      }
    });
  }

  const detailAddCartBtn = document.getElementById('btnDetailAddToCart');
  if (detailAddCartBtn) {
    detailAddCartBtn.addEventListener('click', (e) => {
      if (!isStudentAuthenticated()) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id') || 'course-bib-101';
        sessionStorage.setItem('berea_pending_course', courseId);
        openAuthModal('signup', null, courseId);
      }
    });
  }
}

/**
 * Delegate "Add to Cart" / "Sign Up to Buy" button clicks
 */
function setupGlobalCartListeners() {
  document.addEventListener('click', (e) => {
    // 0. STUDENT HUB AUTH PROTECTION: Require sign up before accessing student hub
    const hubLink = e.target.closest('a[href*="student-dashboard.html"], a[href*="/student-dashboard"], .btn-my-portal');
    if (hubLink) {
      if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof showToast === 'function') {
          showToast('ℹ Please sign up or sign in to your student account to access the Student Hub.', 'gold');
        }
        if (typeof openAuthModal === 'function') {
          openAuthModal('signup', 'student-dashboard.html');
        } else {
          window.location.href = 'student-login.html?returnUrl=student-dashboard.html';
        }
        return;
      }
    }

    // Handlers for already purchased course card buttons
    const purchasedBtn = e.target.closest('.btn-view-enrolled, .btn-already-purchased, .btn-already-enrolled');
    if (purchasedBtn) {
      if (typeof showToast === 'function') {
        showToast('ℹ You have already purchased this course! Opening your Student Portal...', 'gold');
      }
      return;
    }

    const btn = e.target.closest('.btn-add-cart');
    if (btn) {
      e.preventDefault();
      const courseId = btn.getAttribute('data-id');
      if (!courseId) return;

      // 1. CHECK IF COURSE IS ALREADY PURCHASED
      if (typeof isCourseEnrolled === 'function' && isCourseEnrolled(courseId)) {
        showToast('⚠ You have already purchased this course! You have active lifetime access to this course in your Student Portal.', 'danger');
        return;
      }

      // 2. FIRST TIME VISITOR CHECK: Must sign up before buying
      if (!isStudentAuthenticated()) {
        sessionStorage.setItem('berea_pending_course', courseId);
        openAuthModal('signup', null, courseId);
        return;
      }

      // 3. If authenticated, proceed with adding to cart
      if (typeof addToCart === 'function') {
        const added = addToCart(courseId);
        if (added) {
          btn.innerHTML = `✓ Added`;
          btn.classList.add('btn-gold');
          btn.classList.remove('btn-primary');
          setTimeout(() => {
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart`;
            btn.classList.remove('btn-gold');
            btn.classList.add('btn-primary');
          }, 2000);
        }
      }
    }
  });
}

/**
 * Global Student Auth Modal (Sign Up & Sign In)
 */
let authModalTargetUrl = null;
let authModalPendingCourseId = null;

function openAuthModal(mode = 'signup', returnUrl = null, pendingCourseId = null) {
  authModalTargetUrl = returnUrl;
  authModalPendingCourseId = pendingCourseId || sessionStorage.getItem('berea_pending_course');

  let modal = document.getElementById('authModalOverlay');
  if (!modal) {
    createAuthModalDOM();
    modal = document.getElementById('authModalOverlay');
  }

  switchModalAuthTab(mode);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const firstInput = modal.querySelector('input:not([type=hidden])');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchModalAuthTab(tab) {
  const tabSignup = document.getElementById('modalTabSignup');
  const tabSignin = document.getElementById('modalTabSignin');
  const formSignup = document.getElementById('modalSignupForm');
  const formSignin = document.getElementById('modalSigninForm');
  const title = document.getElementById('authModalTitle');
  const subtitle = document.getElementById('authModalSubtitle');

  if (tab === 'signup') {
    tabSignup.classList.add('active');
    tabSignin.classList.remove('active');
    formSignup.style.display = 'block';
    formSignin.style.display = 'none';
    title.textContent = 'Create Student Account';
    subtitle.textContent = authModalPendingCourseId 
      ? 'Sign up to unlock course purchase, access syllabi, and enroll in your selected cohort.'
      : 'Sign up to enroll in courses, access the digital library, and begin theological studies.';
  } else {
    tabSignin.classList.add('active');
    tabSignup.classList.remove('active');
    formSignin.style.display = 'block';
    formSignup.style.display = 'none';
    title.textContent = 'Sign In to Student Account';
    subtitle.textContent = 'Access your enrolled courses, cart, and academic records.';
  }
}

function createAuthModalDOM() {
  const overlay = document.createElement('div');
  overlay.className = 'auth-modal-overlay';
  overlay.id = 'authModalOverlay';
  overlay.innerHTML = `
    <div class="auth-modal-card">
      <div class="auth-modal-header">
        <button type="button" class="auth-modal-close" onclick="closeAuthModal()" aria-label="Close">×</button>
        <div class="brand-crest" style="width:48px; height:48px; margin:0 auto 0.75rem; font-size:1.3rem;">B</div>
        <h3 id="authModalTitle" style="font-size:1.4rem; color:var(--burgundy-950); margin-bottom:0.25rem;">Create Student Account</h3>
        <p id="authModalSubtitle" style="font-size:0.85rem; color:var(--charcoal-600);">
          Sign up to enroll in courses, access the digital library, and begin theological studies.
        </p>
      </div>

      <div class="auth-modal-body">
        <div class="auth-tabs-wrap">
          <button type="button" class="auth-tab-btn active" id="modalTabSignup" onclick="switchModalAuthTab('signup')">
            New Student Sign Up
          </button>
          <button type="button" class="auth-tab-btn" id="modalTabSignin" onclick="switchModalAuthTab('signin')">
            Existing Student Sign In
          </button>
        </div>

        <!-- SIGN UP FORM -->
        <form id="modalSignupForm" onsubmit="handleModalSignup(event)">
          <div class="form-group" style="margin-bottom:0.85rem;">
            <label class="form-label" style="font-size:0.8rem;">Full Legal Name <span class="required">*</span></label>
            <input type="text" id="modalSignupName" class="form-control" placeholder="e.g. Jonathan Edwards" value="Jonathan Edwards" required>
          </div>
          <div class="form-group" style="margin-bottom:0.85rem;">
            <label class="form-label" style="font-size:0.8rem;">Email Address <span class="required">*</span></label>
            <input type="email" id="modalSignupEmail" class="form-control" placeholder="e.g. j.edwards@example.com" value="j.edwards@berea-seminary.edu" required>
          </div>
          <div class="form-group" style="margin-bottom:0.85rem;">
            <label class="form-label" style="font-size:0.8rem;">Mobile Phone <span class="required">*</span></label>
            <input type="tel" id="modalSignupPhone" class="form-control" placeholder="(555) 234-5678" value="+1 (555) 234-5678" required>
          </div>
          <div class="form-group" style="margin-bottom:0.85rem;">
            <label class="form-label" style="font-size:0.8rem;">Create Password <span class="required">*</span></label>
            <input type="password" id="modalSignupPassword" class="form-control" value="Pass@2026Berea" required>
          </div>
          <div class="form-group" style="margin-bottom:1.25rem;">
            <label class="form-label" style="font-size:0.8rem;">Primary Theological Field of Interest</label>
            <select id="modalSignupTrack" class="form-control form-select">
              <option value="Biblical Languages">Biblical Languages (Koine Greek & Biblical Hebrew)</option>
              <option value="Systematic Theology">Systematic Theology & Historical Dogmatics</option>
              <option value="Pastoral Ministry">Pastoral Ministry & Expository Preaching</option>
              <option value="Biblical Studies">Biblical Studies & Exegesis</option>
            </select>
          </div>

          <button type="submit" class="btn btn-gold btn-block btn-lg" style="margin-bottom:0.75rem;">
            Create Account & Access Course Purchase
          </button>
          <p style="font-size:0.75rem; text-align:center; color:var(--charcoal-500);">
            By signing up, you agree to Berea Institute's Doctrinal Statement and Academic Honor Code.
          </p>
        </form>

        <!-- SIGN IN FORM -->
        <form id="modalSigninForm" style="display:none;" onsubmit="handleModalSignin(event)">
          <div class="form-group" style="margin-bottom:0.85rem;">
            <label class="form-label" style="font-size:0.8rem;">Registered Email or Mobile <span class="required">*</span></label>
            <input type="text" id="modalSigninIdentifier" class="form-control" placeholder="Email or Mobile" value="timothy.disciple@berea-seminary.edu" required>
          </div>
          <div class="form-group" style="margin-bottom:1.25rem;">
            <label class="form-label" style="font-size:0.8rem;">Account Password <span class="required">*</span></label>
            <input type="password" id="modalSigninPassword" class="form-control" value="SamplePassword123" required>
          </div>
          <button type="submit" class="btn btn-gold btn-block btn-lg">
            Sign In & Access Account
          </button>
        </form>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  document.body.appendChild(overlay);
}

function handleModalSignup(e) {
  e.preventDefault();
  const name = document.getElementById('modalSignupName').value.trim();
  const email = document.getElementById('modalSignupEmail').value.trim();
  const phone = document.getElementById('modalSignupPhone').value.trim();
  const track = document.getElementById('modalSignupTrack').value;

  if (!name || !email) {
    alert('Please enter your full name and email address.');
    return;
  }

  const student = {
    studentId: 'BEREA-' + Math.floor(1000 + Math.random() * 9000),
    fullName: name,
    email: email,
    phone: phone,
    track: track,
    role: 'Registered Candidate',
    enrolledSince: 'Fall 2026',
    status: 'Active'
  };

  loginStudent(student);
  closeAuthModal();

  const pending = authModalPendingCourseId || sessionStorage.getItem('berea_pending_course');
  if (pending && typeof addToCart === 'function') {
    addToCart(pending);
    sessionStorage.removeItem('berea_pending_course');
    showToast(`✓ Welcome, ${name}! Your student account is active. Course added to your cart.`, 'success');
  } else {
    showToast(`✓ Welcome to Berea Institute, ${name}! Your student account has been created.`, 'success');
  }

  if (authModalTargetUrl) {
    setTimeout(() => {
      window.location.href = authModalTargetUrl;
    }, 700);
  }
}

function handleModalSignin(e) {
  e.preventDefault();
  const identifier = document.getElementById('modalSigninIdentifier').value.trim();
  const name = identifier.includes('@') ? identifier.split('@')[0].replace('.', ' ') : 'Registered Student';

  const student = {
    studentId: 'BEREA-2026-8941',
    fullName: name.charAt(0).toUpperCase() + name.slice(1),
    email: identifier.includes('@') ? identifier : 'student@berea-seminary.edu',
    phone: identifier.includes('@') ? '+1 (555) 234-5678' : identifier,
    role: 'Enrolled Candidate',
    enrolledSince: 'Fall 2026',
    status: 'Active'
  };

  loginStudent(student);
  closeAuthModal();

  const pending = authModalPendingCourseId || sessionStorage.getItem('berea_pending_course');
  if (pending && typeof addToCart === 'function') {
    addToCart(pending);
    sessionStorage.removeItem('berea_pending_course');
    showToast(`✓ Welcome back, ${student.fullName}! Course added to your cart.`, 'success');
  } else {
    showToast(`✓ Welcome back, ${student.fullName}!`, 'success');
  }

  if (authModalTargetUrl) {
    setTimeout(() => {
      window.location.href = authModalTargetUrl;
    }, 700);
  }
}

/**
 * Pre-populate initial cart check
 * Keeps the cart null/empty until the student explicitly adds courses, or after completing checkout.
 */
function seedInitialCartIfEmpty() {
  // STRICT RULE: No default carts!
  // If the visitor is not authenticated, purge any residual cart data from old sessions
  if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
    localStorage.removeItem('berea_cart');
    localStorage.removeItem('berea_prototype_cart');
    localStorage.removeItem('berea_cart_coupon');
    localStorage.removeItem('berea_prototype_coupon');
  }
}

/**
 * Update the cart badges across desktop and mobile menus
 */
function updateCartBadge() {
  const cart = typeof getCart === 'function' ? getCart() : [];
  const count = cart.length;
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'gold') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.65rem;">
      <span style="font-size:1.1rem;">
        ${type === 'success' ? '✓' : type === 'danger' ? '⚠' : 'ℹ'}
      </span>
      <span>${message}</span>
    </div>
    <button style="color:var(--charcoal-400); font-size:1.2rem; cursor:pointer;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initShellNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.drawer-close');

  function openDrawer() {
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}


/**
 * Universal Prototype Navigator Toolbar
 * Injected automatically on all standalone pages for 1-click feature exploration.
 */
function initPrototypeNavigator() {
  // If running inside the showcase iframe, do not inject duplicate topbar
  if (window.self !== window.top) return;

  // Inject styles for the universal prototype navigator
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .proto-global-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 999999;
      background: #0F172A;
      color: #E2E8F0;
      border-bottom: 2px solid var(--gold-500, #C5A059);
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      padding: 0.4rem 1rem;
      display: none; /* Collapsed into corner button by default */
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 0.8rem;
    }
    .proto-bar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      color: var(--gold-400, #DFBE7B);
      font-weight: 700;
      text-decoration: none;
    }
    .proto-bar-pills {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      overflow-x: auto;
      scrollbar-width: thin;
      padding-bottom: 2px;
    }
    .proto-bar-pill {
      background: #1E293B;
      color: #94A3B8;
      border: 1px solid #334155;
      padding: 0.25rem 0.65rem;
      border-radius: 14px;
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.15s ease;
    }
    .proto-bar-pill:hover {
      background: #334155;
      color: #FFFFFF;
      border-color: var(--gold-400, #DFBE7B);
    }
    .proto-bar-pill.active {
      background: var(--burgundy-700, #651D2C);
      color: #FFFFFF;
      border-color: var(--gold-400, #DFBE7B);
      font-weight: 700;
    }
    .proto-bar-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .proto-btn-action {
      background: #334155;
      color: #FFFFFF;
      border: 1px solid #475569;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.15s;
    }
    .proto-btn-action:hover {
      background: #475569;
    }
    .proto-btn-seed {
      background: linear-gradient(135deg, #B58A3E, #C5A059);
      color: #0F172A;
      border: none;
      font-weight: 700;
    }
    .proto-btn-seed:hover {
      filter: brightness(1.1);
    }
    .proto-floating-toggle {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 999999;
      background: #0F172A;
      color: var(--gold-400, #DFBE7B);
      border: 1px solid var(--gold-500, #C5A059);
      padding: 0.5rem 0.9rem;
      border-radius: 30px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      display: flex; /* Visible in the corner by default */
      align-items: center;
      gap: 0.4rem;
    }
    .proto-floating-toggle:hover {
      background: #1E293B;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(styleEl);

  // Determine current active page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentSearch = window.location.search || '';

  const pages = [
    { name: '1. Home', url: 'index.html' },
    { name: '2. Courses', url: 'courses.html' },
    { name: '3. Details', url: 'course-details.html?id=course-bib-101' },
    { name: '4. Register', url: 'registration.html' },
    { name: '5. Cart', url: 'cart.html' },
    { name: '6. Checkout', url: 'checkout.html' },
    { name: '7. Review', url: 'order-review.html' },
    { name: '8. Receipt', url: 'payment-result.html?status=success' },
    { name: '9. Login', url: 'student-login.html' },
    { name: '10. Portal', url: 'student-dashboard.html' }
  ];

  // Container
  const bar = document.createElement('div');
  bar.className = 'proto-global-bar';
  bar.id = 'protoGlobalBar';

  // Floating trigger for when collapsed
  const floatingBtn = document.createElement('button');
  floatingBtn.type = 'button';
  floatingBtn.className = 'proto-floating-toggle';
  floatingBtn.id = 'protoFloatingToggle';
  floatingBtn.innerHTML = `<span>🎓</span> <span>Prototype Switcher</span>`;

  // Brand
  const brandWrap = document.createElement('div');
  brandWrap.className = 'proto-bar-brand';
  brandWrap.innerHTML = `<span>🎓</span> <span>Berea Prototype Navigator</span>`;
  bar.appendChild(brandWrap);

  // Pills
  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'proto-bar-pills';

  pages.forEach(p => {
    const a = document.createElement('a');
    a.href = p.url;
    a.className = 'proto-bar-pill';
    const pBase = p.url.split('?')[0];
    if (currentPath === pBase || (currentPath === '' && pBase === 'index.html')) {
      a.classList.add('active');
    }
    a.textContent = p.name;
    pillsWrap.appendChild(a);
  });
  bar.appendChild(pillsWrap);

  // Actions
  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'proto-bar-actions';

  // Seed Button
  const btnSeed = document.createElement('button');
  btnSeed.type = 'button';
  btnSeed.className = 'proto-btn-action proto-btn-seed';
  btnSeed.title = 'Pre-fill Demo Student Registration & Academic Profile';
  btnSeed.innerHTML = `⚡ Pre-fill Demo Data`;
  btnSeed.onclick = () => {
    // Keep cart clean (no default carts)
    localStorage.removeItem('berea_cart');
    localStorage.removeItem('berea_prototype_cart');
    localStorage.removeItem('berea_cart_coupon');

    // Registration Data
    const student = {
      fullName: 'Jonathan Edwards',
      email: 'j.edwards@berea-seminary.edu',
      phone: '+1 (555) 234-5678',
      dob: '1994-08-14',
      gender: 'male',
      country: 'United States',
      address: '1711 Scripture Way, Suite 400, Colorado Springs, CO',
      emergencyName: 'Sarah Edwards',
      emergencyRelationship: 'Spouse',
      emergencyPhone: '+1 (555) 987-6543',
      highestEducation: 'bachelor',
      institution: 'Wheaton College',
      intendedTrack: 'Pastoral Ministry & Theological Leadership',
      studyMode: 'online',
      christianTestimony: 'Committed to orthodox reformed theology and expository preaching.',
      academicHonorCode: true,
      statementOfFaith: true,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('berea_student_registration', JSON.stringify(student));
    localStorage.setItem('berea_checkout_data', JSON.stringify({
      student: student,
      cohort: 'June 1, 2026 - Morning Cohort',
      policiesAccepted: true,
      completedAt: new Date().toISOString()
    }));
    localStorage.setItem('berea_auth_student', JSON.stringify({
      studentId: 'BEREA-2026-8941',
      fullName: 'Jonathan Edwards',
      email: 'j.edwards@berea-seminary.edu',
      role: 'Master of Divinity Candidate',
      enrolledSince: 'Fall 2026',
      status: 'Active'
    }));

    if (typeof showToast === 'function') {
      showToast('✓ Demo Cart, Scholarship & Student Application Data Populated!', 'success');
    }
    setTimeout(() => window.location.reload(), 600);
  };
  actionsWrap.appendChild(btnSeed);

  // All in One Showcase Link
  const aShowcase = document.createElement('a');
  aShowcase.href = 'showcase.html';
  aShowcase.className = 'proto-btn-action';
  aShowcase.title = 'Switch to single-window iframe tester with Desktop/Tablet/Mobile frames';
  aShowcase.innerHTML = `🖥️ Showcase Hub`;
  actionsWrap.appendChild(aShowcase);

  // Minimize / Collapse button
  const btnMin = document.createElement('button');
  btnMin.type = 'button';
  btnMin.className = 'proto-btn-action';
  btnMin.title = 'Collapse topbar to corner button';
  btnMin.innerHTML = `✕ Collapse`;
  btnMin.onclick = () => {
    bar.style.display = 'none';
    floatingBtn.style.display = 'flex';
    sessionStorage.removeItem('berea_proto_expanded');
  };
  actionsWrap.appendChild(btnMin);

  floatingBtn.onclick = () => {
    bar.style.display = 'flex';
    floatingBtn.style.display = 'none';
    sessionStorage.setItem('berea_proto_expanded', 'true');
  };

  bar.appendChild(actionsWrap);
  document.body.prepend(bar);
  document.body.appendChild(floatingBtn);

  // Default behavior: collapsed into the corner button unless explicitly expanded by the user
  if (sessionStorage.getItem('berea_proto_expanded') === 'true') {
    bar.style.display = 'flex';
    floatingBtn.style.display = 'none';
  } else {
    bar.style.display = 'none';
    floatingBtn.style.display = 'flex';
  }
}



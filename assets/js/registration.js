/**
 * BETHESDA BIBLE INSTITUTE — STUDENT ADMISSION APPLICATION HANDLER
 * Submits real admissions to `POST /api/v1/public/applications` and supports
 * tracking status via `GET /api/v1/public/applications/status`.
 */

const REGISTRATION_STORAGE_KEY = 'berea_student_registration_draft';

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
});

async function initRegistrationForm() {
  const form = document.getElementById('studentRegistrationForm');
  if (!form) return;

  // Populate available published courses in the admission course selector if present
  const courseSelect = document.getElementById('regCourseSelect');
  if (courseSelect && typeof loadPublicCourses === 'function') {
    const courses = await loadPublicCourses();
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedCourse = urlParams.get('courseId') || urlParams.get('course');
    if (courses.length > 0) {
      courseSelect.innerHTML = courses
        .map(
          (c) =>
            `<option value="${c.id}" ${
              preselectedCourse === c.id || preselectedCourse === c.slug ? 'selected' : ''
            }>${c.title} (${c.courseType || c.level} — ${c.pricing === 'FREE' ? 'Free' : `₹${c.price.toLocaleString('en-IN')}`})</option>`,
        )
        .join('');
    }
  }

  loadSavedRegistrationDraft(form);

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) {
        validateField(field);
      }
      saveRegistrationDraft(form);
    });
  });

  setupFileUploadPreviews();

  const trackBtn = document.getElementById('btnTrackApplication');
  if (trackBtn) {
    trackBtn.addEventListener('click', handleApplicationStatusLookup);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRegistrationForm(form)) {
      if (typeof showToast === 'function') {
        showToast('Please complete all required application fields correctly.', 'danger');
      }
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Application...';
    }

    saveRegistrationDraft(form);
    const data = Object.fromEntries(new FormData(form).entries());

    // Pick selected course from dropdown, URL query, or cart first item
    const urlParams = new URLSearchParams(window.location.search);
    const cartFirst = typeof getCart === 'function' ? getCart()[0] : null;
    const allCourses = typeof getAllCourses === 'function' ? getAllCourses() : [];
    const targetCourseId =
      document.getElementById('regCourseSelect')?.value ||
      urlParams.get('courseId') ||
      cartFirst?.courseId ||
      allCourses[0]?.id;

    if (!targetCourseId || typeof apiSubmitApplication !== 'function') {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Official Application';
      }
      if (typeof showToast === 'function') {
        showToast('Please select a published course for your application.', 'warning');
      }
      return;
    }

    const res = await apiSubmitApplication({
      courseId: targetCourseId,
      fullName: data.fullName,
      email: data.email || undefined,
      phoneNumber: data.mobile || data.phoneNumber,
      gender: data.gender || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      church: data.churchName || data.churchAffiliation || data.church || undefined,
      preferredLanguage: data.preferredLanguage || 'English',
      applicantDetails: {
        qualification: data.qualification,
        ministryBackground: data.ministryBackground,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
      documents: window.__registrationDocumentsMeta || undefined,
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Official Application';
    }

    if (!res.success) {
      if (typeof showToast === 'function') {
        showToast(res.message || 'Could not submit application.', 'danger');
      }
      return;
    }

    const app = res.application;
    localStorage.setItem('berea_last_application', JSON.stringify(app));
    renderApplicationConfirmationBanner(app);

    if (typeof showToast === 'function') {
      showToast(
        `Application ${app.applicationNumber} submitted successfully!`,
        'success',
      );
    }

    if (!app.autoEnrolled && app.paymentRequired && typeof getCart === 'function' && getCart().length > 0) {
      setTimeout(() => {
        window.location.href = `checkout.html?admissionId=${encodeURIComponent(app.applicationId)}`;
      }, 1200);
    }
  });
}

function renderApplicationConfirmationBanner(app) {
  const banner = document.getElementById('applicationConfirmationBanner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.innerHTML = `
    <div style="padding:1.5rem; background:var(--status-success-bg, #ecfdf5); border:1px solid #10b981; border-radius:8px; margin-bottom:1.5rem;">
      <h3 style="margin:0 0 0.5rem; color:#065f46;">Application Submitted: ${app.applicationNumber}</h3>
      <p style="margin:0 0 0.75rem; color:#047857; font-size:0.95rem;">
        Course: <strong>${app.courseTitle || 'Selected Program'}</strong> • Status: <strong>${app.status}</strong>
      </p>
      <p style="margin:0; font-size:0.85rem; color:#065f46;">
        Keep your application number (<strong>${app.applicationNumber}</strong>) to track admissions review progress below.
      </p>
    </div>
  `;
  banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function handleApplicationStatusLookup() {
  const appInput = document.getElementById('trackAppNumber');
  const phoneInput = document.getElementById('trackAppPhone');
  const resultBox = document.getElementById('trackAppResult');
  if (!appInput || !phoneInput || !resultBox) return;

  const appNo = appInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!appNo || !phone) {
    resultBox.innerHTML = '<p style="color:#b91c1c;">Enter both Application Number and Registered Mobile Number.</p>';
    return;
  }

  resultBox.innerHTML = '<p>Checking application registry...</p>';
  const res = await apiTrackApplicationStatus(appNo, phone);
  if (!res.found) {
    resultBox.innerHTML = `<p style="color:#b91c1c;">${res.message || 'No matching application found.'}</p>`;
    return;
  }
  const d = res.data;
  resultBox.innerHTML = `
    <div style="padding:1rem; background:#fff; border:1px solid var(--cream-border); border-radius:8px;">
      <div><strong>Application:</strong> ${d.applicationNumber} • <strong>Status:</strong> ${d.status}</div>
      <div><strong>Applicant:</strong> ${d.studentName} • <strong>Course:</strong> ${d.course?.title || 'Program'}</div>
      ${d.batch ? `<div><strong>Assigned Batch:</strong> ${d.batch.name}</div>` : ''}
      ${d.rejectionReason ? `<div style="color:#b91c1c;"><strong>Remarks:</strong> ${d.rejectionReason}</div>` : ''}
    </div>
  `;
}

function validateField(field) {
  if (!field.hasAttribute('required')) {
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        field.classList.add('is-invalid');
        return false;
      }
    }
    field.classList.remove('is-invalid');
    return true;
  }

  let valid = true;
  const val = field.value.trim();

  if (field.type === 'checkbox') {
    valid = field.checked;
  } else if (field.type === 'file') {
    valid = true;
  } else if (field.type === 'email') {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  } else if (field.type === 'tel') {
    valid = val.replace(/\D/g, '').length >= 8;
  } else {
    valid = val.length > 0;
  }

  if (!valid) {
    field.classList.add('is-invalid');
  } else {
    field.classList.remove('is-invalid');
  }
  return valid;
}

function validateRegistrationForm(form) {
  let allValid = true;
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type === 'file') return;
    if (!validateField(field)) {
      allValid = false;
    }
  });
  return allValid;
}

function saveRegistrationDraft(form) {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    if (!(value instanceof File)) {
      data[key] = value;
    }
  });
  localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(data));
}

function loadSavedRegistrationDraft(form) {
  try {
    const raw = localStorage.getItem(REGISTRATION_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.keys(saved).forEach((key) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field && field.type !== 'file') {
        field.value = saved[key];
      }
    });
  } catch (e) {}
}

function setupFileUploadPreviews() {
  const photoInput = document.getElementById('profilePhotoInput');
  const photoPreview = document.getElementById('photoPreviewContainer');
  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.__registrationDocumentsMeta = {
        ...(window.__registrationDocumentsMeta || {}),
        photoFileName: file.name,
        photoMimeType: file.type,
        photoSizeBytes: file.size,
      };
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoPreview.innerHTML = `
          <div style="display:flex; align-items:center; gap:1rem; margin-top:0.75rem;">
            <img src="${ev.target.result}" alt="Portrait Preview" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-500);">
            <div style="font-size:0.85rem; color:var(--charcoal-700);">
              <strong style="display:block; color:var(--status-success);">✓ Portrait Selected</strong>
              <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    });
  }

  const docInput = document.getElementById('documentUploadInput');
  const docPreview = document.getElementById('docPreviewContainer');
  if (docInput && docPreview) {
    docInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.__registrationDocumentsMeta = {
        ...(window.__registrationDocumentsMeta || {}),
        transcriptFileName: file.name,
        transcriptMimeType: file.type,
        transcriptSizeBytes: file.size,
      };
      docPreview.innerHTML = `
        <div style="padding:0.75rem 1rem; background:var(--cream-bg); border:1px solid var(--cream-border); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:space-between; margin-top:0.75rem;">
          <span style="font-size:0.85rem; font-weight:600; color:var(--burgundy-900);">📄 ${file.name}</span>
          <span class="badge badge-success">Attached</span>
        </div>
      `;
    });
  }
}

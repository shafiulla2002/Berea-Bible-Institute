/**
 * BEREA BIBLE INSTITUTE & THEOLOGICAL SEMINARY
 * Student Registration Form Validation & Document Preview Module
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
});

const REG_STORAGE_KEY = 'berea_prototype_student_registration';

function initRegistrationForm() {
  const form = document.getElementById('studentRegistrationForm');
  if (!form) return;

  loadSavedRegistrationDraft(form);
  setupFileUploadPreviews();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateRegistrationForm(form)) {
      saveRegistrationData(form);
      if (typeof showToast === 'function') {
        showToast('Registration application saved successfully!', 'success');
      }

      // Check if student has items in cart to proceed to checkout, else go to courses
      const cart = typeof getCart === 'function' ? getCart() : [];
      setTimeout(() => {
        if (cart.length > 0) {
          window.location.href = 'checkout.html';
        } else {
          window.location.href = 'courses.html';
        }
      }, 800);
    } else {
      if (typeof showToast === 'function') {
        showToast('Please correct the highlighted errors before submitting.', 'danger');
      }
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Real-time validation on input
  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  const isRequired = field.hasAttribute('required');
  const val = field.value.trim();
  let valid = true;

  if (isRequired && !val) {
    valid = false;
  } else if (field.type === 'email' && val) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  } else if (field.type === 'tel' && val) {
    valid = /^(\+?\d{1,4}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/.test(val) || val.length >= 10;
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
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  fields.forEach(field => {
    if (!validateField(field)) {
      allValid = false;
    }
  });
  return allValid;
}

function saveRegistrationData(form) {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string') data[key] = value;
  });
  localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(data));
}

function loadSavedRegistrationDraft(form) {
  try {
    const raw = localStorage.getItem(REG_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(key => {
      const field = form.elements[key];
      if (field) field.value = data[key];
    });
  } catch (err) {
    console.warn('Error loading registration draft:', err);
  }
}

function setupFileUploadPreviews() {
  // Photo upload preview
  const photoInput = document.getElementById('profilePhotoInput');
  const photoPreview = document.getElementById('photoPreviewContainer');

  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          if (typeof showToast === 'function') showToast('Please select an image file (JPG, PNG).', 'danger');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          photoPreview.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem; margin-top:0.75rem;">
              <img src="${evt.target.result}" alt="Preview" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-500);" />
              <div>
                <p style="font-size:0.85rem; font-weight:700; color:var(--burgundy-900);">${file.name}</p>
                <p style="font-size:0.75rem; color:var(--charcoal-500);">${Math.round(file.size / 1024)} KB • Ready for submission</p>
              </div>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Document upload preview
  const docInput = document.getElementById('documentUploadInput');
  const docPreview = document.getElementById('docPreviewContainer');

  if (docInput && docPreview) {
    docInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        docPreview.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.75rem; padding:0.75rem 1rem; background:#FFFFFF; border:1px solid var(--cream-border); border-radius:var(--radius-md);">
            <span style="font-size:1.5rem; color:var(--burgundy-800);">📄</span>
            <div style="flex:1;">
              <p style="font-size:0.85rem; font-weight:700; color:var(--charcoal-900);">${file.name}</p>
              <p style="font-size:0.75rem; color:var(--charcoal-500);">${Math.round(file.size / 1024)} KB • Academic Credential Document</p>
            </div>
            <span style="font-size:0.75rem; font-weight:700; color:var(--status-success); background:var(--status-success-bg); padding:0.2rem 0.6rem; border-radius:10px;">Attached</span>
          </div>
        `;
      }
    });
  }
}


/**
 * BETHESDA BIBLE INSTITUTE — CENTRAL NESTJS API INTEGRATION LAYER
 * Replaces prototype localStorage DB (`BBI_DB`) with live `/api/v1` endpoints.
 */

function resolveBibleLmsApiBase() {
  if (typeof window !== 'undefined') {
    if (window.BIBLE_LMS_API_BASE) return String(window.BIBLE_LMS_API_BASE).replace(/\/$/, '');
    try {
      const override = localStorage.getItem('berea_api_base');
      if (override) return override.replace(/\/$/, '');
    } catch (e) {}
    const host = window.location && window.location.hostname;
    const protocol = window.location && window.location.protocol;
    if (protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') {
      const port = window.location && window.location.port;
      if (port && port !== '3000' && port !== '4000') {
        return 'http://localhost:4000/api/v1';
      }
      return port === '3000' ? 'http://localhost:4000/api/v1' : 'http://localhost:4000/api/v1';
    }
  }
  return '/api/v1';
}

const BIBLE_LMS_API_BASE = resolveBibleLmsApiBase();

function getDefaultInstituteSlug() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('institute');
    if (fromQuery) return fromQuery;
    try {
      const saved = localStorage.getItem('berea_institute_slug');
      if (saved) return saved;
    } catch (e) {}
  }
  return undefined;
}

function getAuthToken() {
  try {
    return localStorage.getItem('berea_auth_token') || null;
  } catch (e) {
    return null;
  }
}

async function callBackendApi(subPath, fetchOptions = {}) {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    };

    const res = await fetch(`${BIBLE_LMS_API_BASE}${subPath}`, {
      ...fetchOptions,
      credentials: 'include',
      headers,
    });

    const text = await res.text();
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (e) {
      payload = { message: text };
    }

    if (!res.ok) {
      const msg = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message || `API Error (${res.status})`;
      return { ok: false, status: res.status, error: msg, data: payload };
    }

    return { ok: true, status: res.status, data: payload };
  } catch (err) {
    return { ok: false, status: 0, error: err && err.message ? err.message : 'Network error' };
  }
}

function formatInrCurrency(rupeesOrNumber) {
  const num = Number(rupeesOrNumber) || 0;
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function syncActiveAccountSession(studentData) {
  try {
    if (studentData && studentData.token) {
      localStorage.setItem('berea_auth_token', studentData.token);
    }
    const cleanProfile = { ...(studentData || {}) };
    delete cleanProfile.token;
    localStorage.setItem('berea_auth_student', JSON.stringify(cleanProfile));
    if (typeof loginStudent === 'function') {
      loginStudent(cleanProfile);
    }
  } catch (e) {}
}

function clearActiveAccountSession() {
  try {
    localStorage.removeItem('berea_auth_token');
    localStorage.removeItem('berea_auth_student');
    localStorage.removeItem('berea_enrolled_courses');
  } catch (e) {}
}

/* ================================
   1. PUBLIC INSTITUTE & COURSE CATALOGUE
   ================================ */

async function apiFetchPublicInstitutes() {
  const res = await callBackendApi('/public/institutes', { method: 'GET' });
  if (!res.ok) return [];
  return Array.isArray(res.data) ? res.data : res.data.items || [];
}

async function apiFetchPublicCourses(filters = {}) {
  const params = new URLSearchParams();
  const slug = filters.instituteSlug || getDefaultInstituteSlug();
  if (slug) params.set('instituteSlug', slug);
  if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
  if (filters.level && filters.level !== 'ALL') params.set('level', filters.level);
  if (filters.courseType && filters.courseType !== 'ALL') params.set('courseType', filters.courseType);
  if (filters.search) params.set('search', filters.search);
  params.set('limit', String(filters.limit || 50));

  const res = await callBackendApi(`/public/courses?${params.toString()}`, { method: 'GET' });
  if (!res.ok) {
    return { items: [], total: 0, error: res.error };
  }
  return res.data;
}

async function apiFetchPublicCourseDetail(idOrSlug) {
  if (!idOrSlug) return null;
  const slug = getDefaultInstituteSlug();
  const qs = slug ? `?instituteSlug=${encodeURIComponent(slug)}` : '';
  const res = await callBackendApi(`/public/courses/${encodeURIComponent(idOrSlug)}${qs}`, { method: 'GET' });
  if (!res.ok) return null;
  return res.data;
}

async function apiValidateCoupon(code, instituteId, subtotalPaise = 0) {
  const params = new URLSearchParams({
    code: String(code || '').trim(),
    subtotal: String(Math.max(0, Math.round(subtotalPaise))),
  });
  if (instituteId) params.set('instituteId', instituteId);
  const slug = getDefaultInstituteSlug();
  if (!instituteId && slug) params.set('instituteSlug', slug);

  const res = await callBackendApi(`/public/coupons/validate?${params.toString()}`, { method: 'GET' });
  if (!res.ok) {
    return { valid: false, error: res.error || 'Invalid coupon code' };
  }
  return res.data;
}

/* ================================
   2. AUTHENTICATION & REGISTRATION
   ================================ */

async function apiRequestOtp(phoneNumber) {
  const cleanPhone = String(phoneNumber || '').trim();
  const res = await callBackendApi('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: cleanPhone }),
  });
  if (!res.ok) {
    return { success: false, message: res.error || 'Failed to send verification code.' };
  }
  try {
    sessionStorage.setItem('berea_otp_challenge', res.data.challengeToken || '');
  } catch (e) {}
  return {
    success: true,
    challengeToken: res.data.challengeToken,
    expiresInSeconds: res.data.expiresInSeconds,
    devOtp: res.data.devOtp,
  };
}

async function apiLoginWithPhone(phoneNumber, otp = '', challengeTokenOverride = null) {
  const cleanPhone = String(phoneNumber || '').trim();
  let challengeToken = challengeTokenOverride;
  if (!challengeToken) {
    try {
      challengeToken = sessionStorage.getItem('berea_otp_challenge') || '';
    } catch (e) {}
  }

  const res = await callBackendApi('/auth/phone-otp', {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber: cleanPhone,
      otp: String(otp || '').trim(),
      challengeToken: challengeToken || undefined,
      role: 'STUDENT',
    }),
  });

  if (!res.ok || !res.data?.accessToken) {
    return { success: false, message: res.error || 'Invalid phone number or verification code.' };
  }

  const token = res.data.accessToken;
  localStorage.setItem('berea_auth_token', token);
  const enrolled = await apiFetchStudentCourses(token);
  const profile = await apiFetchStudentProfile(token);

  const studentData = {
    id: res.data.user?.id,
    studentId: profile?.admissionNo || res.data.user?.id?.slice(0, 8)?.toUpperCase() || 'STUDENT',
    fullName: res.data.user?.fullName || profile?.fullName || 'Student',
    email: res.data.user?.email || profile?.email || '',
    phone: cleanPhone,
    role: 'Student',
    status: profile?.status || 'ACTIVE',
    token,
  };

  syncActiveAccountSession(studentData);
  return { success: true, student: studentData, courses: enrolled };
}

async function apiLoginWithPassword(identifier, password) {
  const res = await callBackendApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: String(identifier || '').trim(),
      passwordPlain: String(password || ''),
      role: 'STUDENT',
    }),
  });

  if (!res.ok || !res.data?.accessToken) {
    return { success: false, message: res.error || 'Invalid credentials.' };
  }

  const token = res.data.accessToken;
  localStorage.setItem('berea_auth_token', token);
  const enrolled = await apiFetchStudentCourses(token);
  const profile = await apiFetchStudentProfile(token);

  const studentData = {
    id: res.data.user?.id,
    studentId: profile?.admissionNo || res.data.user?.id?.slice(0, 8)?.toUpperCase() || 'STUDENT',
    fullName: res.data.user?.fullName || profile?.fullName || 'Student',
    email: res.data.user?.email || profile?.email || identifier,
    phone: profile?.phoneNumber || '',
    role: 'Student',
    status: profile?.status || 'ACTIVE',
    token,
  };

  syncActiveAccountSession(studentData);
  return { success: true, student: studentData, courses: enrolled };
}

async function apiRegisterStudent(studentInput) {
  const res = await callBackendApi('/public/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      instituteSlug: studentInput.instituteSlug || getDefaultInstituteSlug(),
      instituteId: studentInput.instituteId,
      fullName: studentInput.fullName,
      email: studentInput.email || undefined,
      phoneNumber: studentInput.phone || studentInput.phoneNumber,
      password: studentInput.password || undefined,
      church: studentInput.church || undefined,
      preferredLanguage: studentInput.preferredLanguage || studentInput.track || 'English',
    }),
  });

  if (!res.ok) {
    return { success: false, message: res.error || 'Registration failed.' };
  }

  const studentData = {
    id: res.data.user?.id,
    studentId: res.data.admissionNo || 'PENDING',
    fullName: res.data.user?.fullName || studentInput.fullName,
    email: res.data.user?.email || studentInput.email || '',
    phone: res.data.user?.phoneE164 || studentInput.phone || studentInput.phoneNumber,
    role: 'Registered Applicant',
    status: res.data.studentProfile?.status || 'APPLIED',
    token: res.data.accessToken,
  };

  syncActiveAccountSession(studentData);
  return { success: true, student: studentData, raw: res.data };
}

/* ================================
   3. ADMISSIONS & APPLICATION TRACKING
   ================================ */

async function apiSubmitApplication(applicationInput) {
  const res = await callBackendApi('/public/applications', {
    method: 'POST',
    body: JSON.stringify(applicationInput),
  });
  if (!res.ok) {
    return { success: false, message: res.error || 'Unable to submit application.' };
  }
  return { success: true, application: res.data };
}

async function apiTrackApplicationStatus(applicationNumber, phone) {
  const params = new URLSearchParams({
    applicationNumber: String(applicationNumber || '').trim(),
    phone: String(phone || '').trim(),
  });
  const res = await callBackendApi(`/public/applications/status?${params.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) {
    return { found: false, message: res.error || 'Application not found.' };
  }
  return { found: true, data: res.data };
}

/* ================================
   4. CHECKOUT ORDERS & RAZORPAY VERIFICATION
   ================================ */

async function apiCreatePublicOrder(orderInput) {
  const res = await callBackendApi('/public/orders', {
    method: 'POST',
    body: JSON.stringify(orderInput),
  });
  if (!res.ok) {
    return { success: false, message: res.error || 'Failed to create checkout order.' };
  }
  return { success: true, order: res.data };
}

async function apiVerifyRazorpayPayment(paymentPayload) {
  const res = await callBackendApi('/public/payments/verify', {
    method: 'POST',
    body: JSON.stringify(paymentPayload),
  });
  if (!res.ok) {
    return { verified: false, message: res.error || 'Payment verification failed.' };
  }
  return res.data;
}

/* ================================
   5. AUTHENTICATED STUDENT COURSES & PROFILE
   ================================ */

async function apiFetchStudentProfile(tokenOverride = null) {
  const token = tokenOverride || getAuthToken();
  if (!token) return null;
  const res = await callBackendApi('/students/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.data;
}

async function apiFetchStudentCourses(tokenOverride = null) {
  const token = tokenOverride || getAuthToken();
  if (!token) return [];
  const res = await callBackendApi('/students/courses', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const list = Array.isArray(res.data) ? res.data : res.data.courses || [];
  try {
    localStorage.setItem('berea_enrolled_courses', JSON.stringify(list));
  } catch (e) {}
  return list;
}

function apiSaveEnrollment(courses) {
  try {
    localStorage.setItem('berea_enrolled_courses', JSON.stringify(courses || []));
  } catch (e) {}
}

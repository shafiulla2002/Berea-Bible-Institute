/**
 * BETHESDA BIBLE INSTITUTE HYDERABAD
 * Live Database Integration Client
 * Connects Student Enrollment & Admissions directly to the Bible Management Database
 */

const BIBLE_LMS_API_BASE = 'https://bible-learning-app-bm4j.vercel.app/api';

/**
 * Call backend API seamlessly via same-origin PHP proxy on cPanel (avoiding CORS)
 * or direct fetch when hosted on static Vercel/local environments.
 */
async function callBackendApi(subPath, fetchOptions = {}) {
  const cleanSubPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  const fullApiPath = `/api${cleanSubPath}`;
  const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const isVercelStatic = window.location.hostname.endsWith('vercel.app');

  // On cPanel / custom domains (e.g., biblelearninglms.covenantsynergy.in), prefer same-origin PHP proxy first
  if (isHttp && !isVercelStatic) {
    try {
      const proxyRes = await fetch(`api-proxy.php?path=${encodeURIComponent(fullApiPath)}`, fetchOptions);
      const contentType = proxyRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return proxyRes;
      }
    } catch (e) {
      // Fall through to direct API call
    }
  }

  return await fetch(`${BIBLE_LMS_API_BASE}${cleanSubPath}`, fetchOptions);
}

/**
 * Multi-user Database Repository (indexed by email / phone)
 */
const BBI_DB = {
  getAccounts() {
    try {
      return JSON.parse(localStorage.getItem('bbi_database_students') || '{}');
    } catch (e) {
      return {};
    }
  },

  saveAccount(student) {
    const accounts = this.getAccounts();
    const key = (student.phone || student.email || student.studentId).toLowerCase().trim();
    const record = {
      ...student,
      updatedAt: new Date().toISOString()
    };
    accounts[key] = record;
    if (student.email) accounts[student.email.toLowerCase().trim()] = record;
    if (student.phone) accounts[student.phone.replace(/\D/g, '')] = record;
    localStorage.setItem('bbi_database_students', JSON.stringify(accounts));
  },

  findAccount(identifier, password) {
    if (!identifier) return null;
    const accounts = this.getAccounts();
    const cleanId = identifier.toLowerCase().trim();
    const digitsOnly = identifier.replace(/\D/g, '');

    const found = accounts[cleanId] || (digitsOnly ? accounts[digitsOnly] : null);
    if (!found) return null;

    if (password && found.password && found.password !== password) {
      return { error: 'Incorrect password for this student account.' };
    }
    return found;
  }
};

/**
 * Helper to sync active student's courses/token into session storage cleanly
 */
function syncActiveAccountSession(studentData) {
  if (studentData.accessToken) {
    localStorage.setItem('berea_auth_token', studentData.accessToken);
  } else {
    localStorage.removeItem('berea_auth_token');
  }

  if (Array.isArray(studentData.enrolledCourses)) {
    localStorage.setItem('berea_enrolled_courses', JSON.stringify(studentData.enrolledCourses));
  } else {
    localStorage.setItem('berea_enrolled_courses', '[]');
  }

  if (typeof loginStudent === 'function') {
    loginStudent(studentData);
  } else {
    localStorage.setItem('berea_auth_student', JSON.stringify(studentData));
  }
}

/**
 * 1. Authenticate with Live Bible Management Database (Phone / OTP)
 */
async function apiLoginWithPhone(phoneNumber, otp = '') {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const res = await callBackendApi('/auth/phone-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: cleanPhone || phoneNumber,
        role: 'STUDENT',
        otp: otp
      })
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const existingLocal = BBI_DB.findAccount(phoneNumber);
      const studentData = {
        studentId: data.user.admissionNo || ('BBI-' + data.user.id.slice(0, 6).toUpperCase()),
        fullName: data.user.fullName,
        email: data.user.email || `${cleanPhone}@bethesdabible.edu`,
        phone: data.user.phone,
        role: 'Active Matriculated Student',
        enrolledSince: 'Fall 2026',
        status: 'Active',
        accessToken: data.accessToken,
        studentProfileId: data.user.studentProfileId,
        instituteId: data.user.instituteId,
        instituteName: data.user.instituteName || 'Bethesda Bible Institute',
        enrolledCourses: (existingLocal && !existingLocal.error && Array.isArray(existingLocal.enrolledCourses))
          ? existingLocal.enrolledCourses
          : []
      };

      // Persist to multi-user database & active session
      BBI_DB.saveAccount(studentData);
      syncActiveAccountSession(studentData);

      // Automatically fetch live enrolled courses from the database
      await apiFetchStudentCourses(data.accessToken);
      return { success: true, student: studentData };
    } else {
      const localAccount = BBI_DB.findAccount(phoneNumber);
      if (localAccount && !localAccount.error) {
        syncActiveAccountSession(localAccount);
        return { success: true, student: localAccount };
      }
      return { success: false, message: data.message || 'Authentication failed' };
    }
  } catch (err) {
    console.warn('API phone-login fallback to local database:', err);
    const localAccount = BBI_DB.findAccount(phoneNumber);
    if (localAccount && !localAccount.error) {
      syncActiveAccountSession(localAccount);
      return { success: true, student: localAccount };
    }
    return { success: false, message: err.message };
  }
}

/**
 * 2. Authenticate with Password from Database
 */
async function apiLoginWithPassword(identifier, password) {
  const account = BBI_DB.findAccount(identifier, password);
  if (account) {
    if (account.error) {
      return { success: false, message: account.error };
    }
    syncActiveAccountSession(account);
    if (account.accessToken) {
      await apiFetchStudentCourses(account.accessToken);
    }
    return { success: true, student: account };
  }

  // Also try phone login if identifier is 10 digits
  const digits = identifier.replace(/\D/g, '');
  if (digits.length >= 10) {
    return await apiLoginWithPhone(digits);
  }

  return { success: false, message: 'No student found with these credentials. Please check your email/phone or sign up.' };
}

/**
 * 3. Register New Student Account into Database
 */
async function apiRegisterStudent(studentInput) {
  const student = {
    studentId: 'BBI-2026-' + Math.floor(1000 + Math.random() * 9000),
    fullName: studentInput.fullName,
    email: studentInput.email,
    phone: studentInput.phone,
    password: studentInput.password,
    track: studentInput.track || 'Biblical Studies & Exegesis',
    role: 'Candidate for Biblical Studies',
    enrolledSince: 'Fall 2026',
    status: 'Active',
    registeredAt: new Date().toISOString(),
    enrolledCourses: []
  };

  // Save to database
  BBI_DB.saveAccount(student);
  syncActiveAccountSession(student);

  return { success: true, student };
}

/**
 * 4. Fetch Enrolled Courses directly from Bible Management Database
 */
async function apiFetchStudentCourses(token = null) {
  const authToken = token || localStorage.getItem('berea_auth_token');
  if (!authToken) {
    try {
      const student = JSON.parse(localStorage.getItem('berea_auth_student') || '{}');
      return student.enrolledCourses || JSON.parse(localStorage.getItem('berea_enrolled_courses') || '[]');
    } catch (e) {
      return [];
    }
  }

  try {
    const res = await callBackendApi('/students/courses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.courses) && data.courses.length > 0) {
        const mappedCourses = data.courses.map(c => ({
          courseId: c.courseId,
          code: c.slug ? c.slug.toUpperCase().slice(0, 7) : 'BIB-101',
          title: c.title,
          batch: c.batchName || 'Fall 2026 Academic Cohort',
          progressPct: c.progressPct || 0,
          status: c.status || 'ACTIVE',
          enrolledAt: c.enrolledAt || new Date().toISOString(),
          instructor: c.instructor || 'Dr. Paul Apostle',
          totalLessons: c.totalLessons || 12,
          completedLessons: c.completedLessons || 0
        }));

        // Cache live courses for student dashboard & save to account record
        localStorage.setItem('berea_enrolled_courses', JSON.stringify(mappedCourses));
        const student = JSON.parse(localStorage.getItem('berea_auth_student') || '{}');
        if (student && (student.email || student.phone)) {
          student.enrolledCourses = mappedCourses;
          BBI_DB.saveAccount(student);
          localStorage.setItem('berea_auth_student', JSON.stringify(student));
        }
        return mappedCourses;
      }
    }
  } catch (err) {
    console.warn('apiFetchStudentCourses network notice:', err.message);
  }

  try {
    return JSON.parse(localStorage.getItem('berea_enrolled_courses') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * 5. Record Course Enrollment in Database
 */
function apiSaveEnrollment(courses) {
  if (!Array.isArray(courses)) return;
  try {
    const existing = JSON.parse(localStorage.getItem('berea_enrolled_courses') || '[]');
    const student = JSON.parse(localStorage.getItem('berea_auth_student') || '{}');

    courses.forEach(c => {
      if (!existing.some(e => e.courseId === (c.courseId || c.id))) {
        existing.push({
          courseId: c.courseId || c.id,
          code: c.code || 'BIB-101',
          title: c.title,
          batch: c.batch || 'Fall 2026 Academic Cohort',
          progressPct: 0,
          status: 'ACTIVE',
          enrolledAt: new Date().toISOString()
        });
      }
    });

    localStorage.setItem('berea_enrolled_courses', JSON.stringify(existing));

    if (student && (student.email || student.phone)) {
      student.enrolledCourses = existing;
      BBI_DB.saveAccount(student);
      localStorage.setItem('berea_auth_student', JSON.stringify(student));
    }
  } catch (e) {
    console.error('apiSaveEnrollment error:', e);
  }
}

// Seed the canonical demonstration account Shaik Shafiulla into the database
(function seedCanonicalDatabaseAccount() {
  const accounts = BBI_DB.getAccounts();
  if (!accounts['9642402639']) {
    BBI_DB.saveAccount({
      studentId: 'ADM-2026-038',
      fullName: 'Shaik Shafiulla',
      email: 'shaikshafiulla20012@gmail.com',
      phone: '+91 9642402639',
      password: 'Pass@2026Bethesda',
      track: 'Biblical Studies & Exegesis',
      role: 'Active Matriculated Student',
      enrolledSince: 'Fall 2026',
      status: 'Active',
      enrolledCourses: [
        {
          courseId: '43aee076-ae4b-4684-8197-02a2c61b2233',
          code: 'BIB-101',
          title: 'Baible cherithra',
          batch: 'Biblical Studies 2026 - Morning Cohort',
          progressPct: 0,
          status: 'ACTIVE',
          enrolledAt: '2026-11-03T06:30:18.421Z'
        },
        {
          courseId: '4dda67d9-0c49-4f01-838a-dc3ed41a6cd2',
          code: 'THE-201',
          title: 'Systematic Theology & Hermeneutics',
          batch: 'Systematic Theology Weekend Cohort',
          progressPct: 30,
          status: 'ACTIVE',
          enrolledAt: '2026-10-27T08:22:53.034Z'
        },
        {
          courseId: 'e80cfa87-1100-4f4d-9706-cdb90c3f55ca',
          code: 'HIS-102',
          title: 'Church History: Reformation to Modern',
          batch: 'Church History 2026 - Evening Cohort',
          progressPct: 45,
          status: 'ACTIVE',
          enrolledAt: '2026-10-17T08:22:52.986Z'
        },
        {
          courseId: '4a191bde-4efb-41f4-af85-b15bd72768d9',
          code: 'THE-101',
          title: 'Building Biblical Theology',
          batch: 'Biblical Studies 2026 - Morning Cohort',
          progressPct: 75,
          status: 'ACTIVE',
          enrolledAt: '2026-10-07T08:22:52.928Z'
        }
      ]
    });
  }
})();

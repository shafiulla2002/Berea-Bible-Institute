/**
 * BETHESDA BIBLE INSTITUTE — DYNAMIC PUBLIC COURSE CATALOGUE
 * Fetches live PUBLISHED courses from central NestJS API (`/api/v1/public/courses`).
 */

let PUBLIC_COURSES_CACHE = [];
let PUBLIC_COURSE_DETAIL_MAP = {};
let PUBLIC_COURSES_LOADED = false;

function formatLearningModeLabel(mode) {
  switch (mode) {
    case 'RECORDED':
      return 'Self-Paced Recorded';
    case 'LIVE':
      return 'Live Interactive Cohort';
    case 'HYBRID':
      return 'Hybrid (Live + Recorded)';
    case 'IN_PERSON':
      return 'On-Campus In-Person';
    default:
      return 'Guided Cohort Study';
  }
}

function escapeCourseHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCourseCoverSvgDataUri(title, category, code) {
  const safeTitle = String(title || 'Theological Course').slice(0, 38).replace(/[<>&"']/g, '');
  const safeCat = String(category || 'Biblical Studies').slice(0, 32).replace(/[<>&"']/g, '');
  const safeCode = String(code || 'BBI').slice(0, 18).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E1B4B"/>
        <stop offset="55%" stop-color="#3D0C17"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <circle cx="700" cy="80" r="180" fill="#C5A059" fill-opacity="0.08"/>
    <circle cx="100" cy="380" r="140" fill="#C5A059" fill-opacity="0.06"/>
    <rect x="36" y="32" width="728" height="386" rx="14" fill="none" stroke="#C5A059" stroke-opacity="0.28" stroke-width="1.5"/>
    <text x="400" y="195" text-anchor="middle" fill="#C5A059" font-family="Georgia, serif" font-size="42" font-weight="bold">✝</text>
    <text x="400" y="255" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, serif" font-size="26" font-weight="bold">${safeTitle}</text>
    <text x="400" y="295" text-anchor="middle" fill="#DFBE7B" font-family="sans-serif" font-size="15" letter-spacing="2">${safeCat.toUpperCase()}</text>
    <text x="400" y="345" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="13">${safeCode} • BETHESDA BIBLE INSTITUTE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function normalizeCourseDto(c) {
  if (!c) return null;
  const pricePaise = c.pricing === 'PAID' ? Number(c.salePrice ?? c.price ?? 0) : 0;
  const regFeePaise = Number(c.registrationFee ?? 0);
  const priceRupees = Math.round(pricePaise / 100);
  const regFeeRupees = Math.round(regFeePaise / 100);

  const leadIns = Array.isArray(c.instructors) && c.instructors.length > 0 ? c.instructors[0] : null;
  const instructorName =
    leadIns?.fullName || c.leadInstructorName || 'Bethesda Bible Faculty';
  const initials = instructorName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'BB';

  const modules = Array.isArray(c.modules) ? c.modules : [];
  const curriculum = modules.map((m) => {
    const lessonsCount = Array.isArray(m.chapters)
      ? m.chapters.reduce((sum, ch) => sum + (Array.isArray(ch.lessons) ? ch.lessons.length : 0), 0)
      : 0;
    return {
      module: m.title,
      lessons: lessonsCount || 1,
      chapters: m.chapters || [],
    };
  });

  const batches = Array.isArray(c.batches) ? c.batches : [];
  const availableBatches = batches.map((b) => {
    const startStr = b.startDate
      ? new Date(b.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Flexible Start';
    return `${b.name} (${startStr})`;
  });

  const durationText =
    c.durationLabel ||
    (c.durationHours ? `${c.durationHours} Study Hours` : `${Math.max(4, (c.moduleCount || 3) * 2)} Weeks`);

  return {
    id: c.id,
    slug: c.slug,
    code: (c.slug || c.id.slice(0, 8)).toUpperCase(),
    instituteId: c.institute?.id || '',
    instituteName: c.institute?.name || 'Bethesda Bible Institute',
    title: c.title,
    category: c.category?.name || 'Biblical Studies',
    categorySlug: c.category?.slug || '',
    level: c.level || 'BEGINNER',
    courseType: c.courseType || 'CERTIFICATE',
    learningMode: c.learningMode || 'HYBRID',
    studyMode: formatLearningModeLabel(c.learningMode),
    duration: durationText,
    durationCategory: (c.moduleCount || 0) >= 6 ? '6m' : (c.moduleCount || 0) >= 4 ? '12w' : '8w',
    credits: Math.max(1, c.moduleCount || curriculum.length || 3),
    pricing: c.pricing || 'PAID',
    requiresApproval: Boolean(c.requiresApproval),
    pricePaise,
    registrationFeePaise: regFeePaise,
    price: priceRupees,
    registrationFee: regFeeRupees,
    featured: true,
    shortDesc: (c.description || '').slice(0, 160),
    fullDesc: c.description || '',
    fallbackImage: buildCourseCoverSvgDataUri(
      c.title,
      c.category?.name || 'Biblical Studies',
      (c.slug || c.id.slice(0, 8)).toUpperCase(),
    ),
    image:
      c.coverImage && !String(c.coverImage).includes('1507842229451-7f01be8610ce')
        ? c.coverImage
        : buildCourseCoverSvgDataUri(
            c.title,
            c.category?.name || 'Biblical Studies',
            (c.slug || c.id.slice(0, 8)).toUpperCase(),
          ),
    eligibility: c.eligibility || 'Open to believers committed to structured biblical study.',
    objectives: [
      'Master foundational scripture interpretation and historical context',
      'Complete guided module assessments and faculty feedback',
      'Apply theological principles in local church and ministry service',
    ],
    curriculum:
      curriculum.length > 0
        ? curriculum
        : [{ module: `${c.title} Core Syllabus`, lessons: Math.max(1, c.lessonCount || 6) }],
    batches,
    availableBatches:
      availableBatches.length > 0 ? availableBatches : ['Rolling Admission Cohort'],
    nextBatch: availableBatches[0] || 'Rolling Admission Cohort',
    enrolledCount: c.enrolledCount || 0,
    instructor: {
      name: instructorName,
      avatar: initials,
      title: leadIns?.specialization || 'Institute Faculty',
      credentials: leadIns?.qualifications || 'Theological Studies Faculty',
      bio: leadIns?.bio || `Teaching faculty at ${c.institute?.name || 'Bethesda Bible Institute'}.`,
    },
  };
}

async function loadPublicCourses(filters = {}, forceRefresh = false) {
  if (PUBLIC_COURSES_LOADED && !forceRefresh && Object.keys(filters).length === 0) {
    return PUBLIC_COURSES_CACHE;
  }
  if (typeof apiFetchPublicCourses !== 'function') {
    return [];
  }
  const res = await apiFetchPublicCourses(filters);
  const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
  const normalized = rawList.map(normalizeCourseDto).filter(Boolean);
  if (Object.keys(filters).length === 0) {
    PUBLIC_COURSES_CACHE = normalized;
    PUBLIC_COURSES_LOADED = true;
  }
  normalized.forEach((c) => {
    if (!PUBLIC_COURSE_DETAIL_MAP[c.id]) {
      PUBLIC_COURSE_DETAIL_MAP[c.id] = c;
    }
    if (c.slug && !PUBLIC_COURSE_DETAIL_MAP[c.slug]) {
      PUBLIC_COURSE_DETAIL_MAP[c.slug] = c;
    }
  });
  return normalized;
}

async function fetchCourseDetailLive(idOrSlug) {
  if (!idOrSlug) return null;
  if (typeof apiFetchPublicCourseDetail === 'function') {
    const raw = await apiFetchPublicCourseDetail(idOrSlug);
    if (raw) {
      const normalized = normalizeCourseDto(raw);
      if (normalized) {
        PUBLIC_COURSE_DETAIL_MAP[normalized.id] = normalized;
        if (normalized.slug) PUBLIC_COURSE_DETAIL_MAP[normalized.slug] = normalized;
      }
      return normalized;
    }
  }
  return getCourseById(idOrSlug);
}

function getAllCourses() {
  return PUBLIC_COURSES_CACHE;
}

function getCourseById(id) {
  if (!id) return null;
  return (
    PUBLIC_COURSE_DETAIL_MAP[id] ||
    PUBLIC_COURSES_CACHE.find((c) => c.id === id || c.slug === id || c.code === id) ||
    null
  );
}

function getFeaturedCourses() {
  return PUBLIC_COURSES_CACHE.slice(0, 3);
}

function getCategories() {
  return [...new Set(PUBLIC_COURSES_CACHE.map((c) => c.category).filter(Boolean))];
}

function queryCourses({ search = '', category = 'ALL', level = 'ALL', mode = 'ALL', duration = 'ALL', sort = 'featured' } = {}) {
  let list = [...PUBLIC_COURSES_CACHE];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.instructor?.name || '').toLowerCase().includes(q) ||
        (c.shortDesc || '').toLowerCase().includes(q),
    );
  }

  if (category !== 'ALL') {
    const catLower = category.toLowerCase();
    list = list.filter((c) => (c.category || '').toLowerCase().includes(catLower));
  }
  if (level !== 'ALL') {
    const lvlLower = level.toLowerCase();
    list = list.filter((c) => (c.level || '').toLowerCase() === lvlLower);
  }
  if (mode !== 'ALL') {
    list = list.filter(
      (c) => c.learningMode === mode || (c.studyMode || '').toLowerCase().includes(mode.toLowerCase()),
    );
  }
  if (duration !== 'ALL') {
    list = list.filter((c) => c.durationCategory === duration);
  }

  if (sort === 'price_asc' || sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc' || sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'title_asc' || sort === 'name-asc') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}

function isCourseEnrolled(courseId) {
  try {
    if (typeof isStudentAuthenticated === 'function' && !isStudentAuthenticated()) {
      return false;
    }
    const enrolled = JSON.parse(localStorage.getItem('berea_enrolled_courses') || '[]');
    return (
      Array.isArray(enrolled) &&
      enrolled.some(
        (item) =>
          item.courseId === courseId &&
          (!item.source ||
            item.source === 'PURCHASE' ||
            item.source === 'FREE' ||
            item.source === 'SCHOLARSHIP'),
      )
    );
  } catch (e) {
    return false;
  }
}

function isCourseInCart(courseId) {
  try {
    const cart =
      typeof getCart === 'function'
        ? getCart()
        : JSON.parse(localStorage.getItem('berea_cart') || '[]');
    return Array.isArray(cart) && cart.some((item) => item.courseId === courseId);
  } catch (e) {
    return false;
  }
}

function createCourseCardHTML(course) {
  const isAuth = typeof isStudentAuthenticated === 'function' && isStudentAuthenticated();
  const enrolled = isCourseEnrolled(course.id);
  const inCart = !enrolled && isCourseInCart(course.id);
  const priceLabel =
    course.pricing === 'FREE' || course.price === 0
      ? '<span class="price-amount">Free</span>'
      : `<span class="price-amount">₹${course.price.toLocaleString('en-IN')}</span>`;

  const fallbackImg =
    course.fallbackImage ||
    buildCourseCoverSvgDataUri(course.title, course.category, course.code);

  let actionHtml = '';
  if (enrolled) {
    actionHtml = `<a href="student-dashboard.html" class="btn btn-primary btn-sm btn-view-enrolled">Manage</a>`;
  } else if (inCart) {
    actionHtml = `<a href="cart.html" class="btn btn-gold btn-sm btn-in-cart">✓ Added to Cart</a>`;
  } else {
    const btnClass = isAuth
      ? 'btn btn-primary btn-sm btn-add-cart'
      : 'btn btn-gold btn-sm btn-add-cart';
    const btnLabel = isAuth
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Sign Up to Buy`;
    actionHtml = `<button type="button" class="${btnClass}" data-id="${escapeCourseHtml(course.id)}" data-course-id="${escapeCourseHtml(course.id)}">${btnLabel}</button>`;
  }

  return `
    <article class="course-card" data-course-id="${escapeCourseHtml(course.id)}">
      <div class="course-thumb">
        <img src="${escapeCourseHtml(course.image)}" onerror="this.onerror=null;this.src='${escapeCourseHtml(fallbackImg)}'" alt="${escapeCourseHtml(course.title)}" class="course-thumb-img" loading="lazy">
        <div class="course-thumb-overlay"></div>
        <span class="course-badge-category">${escapeCourseHtml(course.category)}</span>
        <span class="course-badge-level">${escapeCourseHtml(course.level)}</span>
      </div>
      <div class="course-body">
        <div class="course-code-wrap">
          <span class="course-code">${escapeCourseHtml(course.code)}</span>
          <span class="course-duration">${escapeCourseHtml(course.duration)}</span>
        </div>
        <h3 class="course-title">
          <a href="course-details.html?id=${encodeURIComponent(course.id)}">${escapeCourseHtml(course.title)}</a>
        </h3>
        <p class="course-desc">${escapeCourseHtml(course.shortDesc)}</p>
        <div class="course-faculty">
          <div class="faculty-avatar">${escapeCourseHtml(course.instructor.avatar)}</div>
          <div class="faculty-info">
            <span class="faculty-name">${escapeCourseHtml(course.instructor.name)}</span>
            <span class="faculty-role">${escapeCourseHtml(course.studyMode)}</span>
          </div>
        </div>
      </div>
      <div class="course-footer">
        <div class="course-price-block">
          <span class="price-label">${course.pricing === 'FREE' ? 'Tuition Scholarship' : 'Tuition Fee'}</span>
          ${priceLabel}
        </div>
        <div class="course-actions">
          <a href="course-details.html?id=${encodeURIComponent(course.id)}" class="btn btn-secondary btn-sm">Details</a>
          ${actionHtml}
        </div>
      </div>
    </article>
  `;
}

/**
 * BETHESDA BIBLE INSTITUTE — DYNAMIC PUBLIC COURSE CATALOGUE
 * Fetches live PUBLISHED courses from central NestJS API (`/api/v1/public/courses`).
 */

let PUBLIC_COURSES_CACHE = [];
let PUBLIC_COURSE_DETAIL_MAP = {};
let PUBLIC_COURSES_LOADED = false;
let PUBLIC_COURSES_INFLIGHT = null;

const PUBLIC_COURSES_STORAGE_KEY = 'berea_public_courses_v1';
const PUBLIC_COURSES_TTL_MS = 60 * 1000;

function hydratePublicCoursesFromStorage() {
  if (typeof window === 'undefined' || PUBLIC_COURSES_CACHE.length > 0) return false;
  try {
    const raw = sessionStorage.getItem(PUBLIC_COURSES_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return false;
    PUBLIC_COURSES_CACHE = parsed.items;
    PUBLIC_COURSES_CACHE.forEach((c) => {
      if (c && c.id) PUBLIC_COURSE_DETAIL_MAP[c.id] = c;
      if (c && c.slug) PUBLIC_COURSE_DETAIL_MAP[c.slug] = c;
    });
    if (Date.now() - Number(parsed.ts || 0) < PUBLIC_COURSES_TTL_MS) {
      PUBLIC_COURSES_LOADED = true;
    }
    return PUBLIC_COURSES_CACHE.length > 0;
  } catch (e) {
    return false;
  }
}

hydratePublicCoursesFromStorage();

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

function buildBookCoverSvgDataUri(title, author, category) {
  const safeTitle = String(title || 'Theological Book').slice(0, 42).replace(/[<>&"']/g, '');
  const safeAuthor = String(author || 'Bethesda Bible Faculty').slice(0, 36).replace(/[<>&"']/g, '');
  const safeCat = String(category || 'Theology').slice(0, 30).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <defs>
      <linearGradient id="bookBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="50%" stop-color="#31102f"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
      </linearGradient>
    </defs>
    <rect width="600" height="850" rx="12" fill="url(#bookBg)"/>
    <rect x="0" y="0" width="36" height="850" fill="url(#spine)"/>
    <rect x="44" y="44" width="512" height="762" rx="8" fill="none" stroke="#C5A059" stroke-opacity="0.4" stroke-width="2"/>
    <rect x="52" y="52" width="496" height="746" rx="6" fill="none" stroke="#C5A059" stroke-opacity="0.2" stroke-width="1"/>
    <circle cx="300" cy="220" r="70" fill="#C5A059" fill-opacity="0.1"/>
    <text x="300" y="240" text-anchor="middle" fill="#C5A059" font-family="Georgia, serif" font-size="64" font-weight="bold">📖</text>
    <text x="300" y="380" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, serif" font-size="32" font-weight="bold">${safeTitle}</text>
    <text x="300" y="440" text-anchor="middle" fill="#DFBE7B" font-family="sans-serif" font-size="16" letter-spacing="3">${safeCat.toUpperCase()}</text>
    <line x1="200" y1="480" x2="400" y2="480" stroke="#C5A059" stroke-width="1.5" stroke-opacity="0.5"/>
    <text x="300" y="540" text-anchor="middle" fill="#E2E8F0" font-family="Georgia, serif" font-size="22" font-style="italic">By ${safeAuthor}</text>
    <text x="300" y="740" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="13" letter-spacing="2">BETHESDA BIBLE INSTITUTE PRESS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function normalizeCourseDto(c) {
  if (!c) return null;
  const isBook = c.courseType === 'BOOK';
  const pricePaise = c.pricing === 'PAID' ? Number(c.salePrice ?? c.price ?? 0) : 0;
  const regFeePaise = Number(c.registrationFee ?? 0);
  const priceRupees = Math.round(pricePaise / 100);
  const regFeeRupees = Math.round(regFeePaise / 100);

  const leadIns = Array.isArray(c.instructors) && c.instructors.length > 0 ? c.instructors[0] : null;
  const instructorName =
    leadIns?.fullName || c.leadInstructorName || (isBook ? (c.author || 'Bethesda Bible Author') : 'Bethesda Bible Faculty');
  const authorName = c.author || (isBook ? instructorName : '');
  const initials = instructorName
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || (isBook ? 'BK' : 'BB');

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

  const durationText = isBook
    ? (c.pdfPageCount ? `${c.pdfPageCount} Pages` : 'Full eBook')
    : (c.durationLabel || (c.durationHours ? `${c.durationHours} Study Hours` : `${Math.max(4, (c.moduleCount || 3) * 2)} Weeks`));

  const fallback = isBook
    ? buildBookCoverSvgDataUri(c.title, authorName, c.category?.name || 'eBook')
    : buildCourseCoverSvgDataUri(c.title, c.category?.name || 'Biblical Studies', (c.slug || c.id.slice(0, 8)).toUpperCase());

  return {
    id: c.id,
    slug: c.slug,
    code: (c.slug || c.id.slice(0, 8)).toUpperCase(),
    instituteId: c.institute?.id || '',
    instituteName: c.institute?.name || 'Bethesda Bible Institute',
    title: c.title,
    category: c.category?.name || (isBook ? 'Theological Literature' : 'Biblical Studies'),
    categorySlug: c.category?.slug || '',
    level: c.level || 'BEGINNER',
    courseType: c.courseType || 'REGULAR',
    isBook: isBook,
    author: authorName,
    pdfOriginalName: c.pdfOriginalName || '',
    pdfFileSize: c.pdfFileSize || 0,
    pdfPageCount: c.pdfPageCount || 0,
    publicationInfo: c.publicationInfo || '',
    language: c.language || 'English',
    learningMode: c.learningMode || 'ONLINE',
    studyMode: isBook ? 'Online 3D Reader' : formatLearningModeLabel(c.learningMode),
    duration: durationText,
    durationCategory: (c.moduleCount || 0) >= 6 ? '6m' : (c.moduleCount || 0) >= 4 ? '12w' : '8w',
    credits: isBook ? 1 : Math.max(1, c.moduleCount || curriculum.length || 3),
    pricing: c.pricing || 'PAID',
    requiresApproval: Boolean(c.requiresApproval),
    pricePaise,
    registrationFeePaise: regFeePaise,
    price: priceRupees,
    registrationFee: regFeeRupees,
    featured: true,
    shortDesc: (c.description || '').slice(0, 160),
    fullDesc: c.description || '',
    fallbackImage: fallback,
    image: c.coverImage && !String(c.coverImage).includes('1507842229451-7f01be8610ce') ? c.coverImage : fallback,
    eligibility: c.eligibility || 'Open to all students and readers.',
    objectives: [
      'Master foundational theological doctrine and historical understanding',
      'Engage with complete biblical and academic materials',
      'Track your reading and reference key biblical insights',
    ],
    curriculum:
      curriculum.length > 0
        ? curriculum
        : [{ module: `${c.title} Core Content`, lessons: Math.max(1, c.lessonCount || 1) }],
    batches,
    availableBatches:
      availableBatches.length > 0 ? availableBatches : ['Instant eBook Access'],
    nextBatch: availableBatches[0] || 'Instant eBook Access',
    enrolledCount: c.enrolledCount || 0,
    instructor: {
      name: authorName || instructorName,
      avatar: initials,
      title: isBook ? 'Author / Scholar' : (leadIns?.specialization || 'Institute Faculty'),
      credentials: leadIns?.qualifications || 'Theological Studies Faculty',
      bio: isBook
        ? `${authorName} — Published author and theological educator.`
        : (leadIns?.bio || `Teaching faculty at ${c.institute?.name || 'Bethesda Bible Institute'}.`),
    },
  };
}

async function loadPublicCourses(filters = {}, forceRefresh = false) {
  const isUnfiltered = Object.keys(filters).length === 0;
  if (PUBLIC_COURSES_LOADED && !forceRefresh && isUnfiltered) {
    return PUBLIC_COURSES_CACHE;
  }
  if (typeof apiFetchPublicCourses !== 'function') {
    return [];
  }
  if (isUnfiltered && !forceRefresh && PUBLIC_COURSES_INFLIGHT) {
    return PUBLIC_COURSES_INFLIGHT;
  }

  const fetchPromise = (async () => {
    const res = await apiFetchPublicCourses(filters);
    const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
    const normalized = rawList.map(normalizeCourseDto).filter(Boolean);
    if (isUnfiltered) {
      PUBLIC_COURSES_CACHE = normalized;
      PUBLIC_COURSES_LOADED = true;
      try {
        sessionStorage.setItem(
          PUBLIC_COURSES_STORAGE_KEY,
          JSON.stringify({ ts: Date.now(), items: normalized }),
        );
      } catch (e) {}
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
  })();

  if (isUnfiltered && !forceRefresh) {
    PUBLIC_COURSES_INFLIGHT = fetchPromise;
    try {
      return await fetchPromise;
    } finally {
      PUBLIC_COURSES_INFLIGHT = null;
    }
  }
  return fetchPromise;
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

function queryCourses({ search = '', category = 'ALL', level = 'ALL', mode = 'ALL', duration = 'ALL', courseType = 'ALL', sort = 'featured' } = {}) {
  let list = [...PUBLIC_COURSES_CACHE];

  if (courseType !== 'ALL') {
    if (courseType === 'BOOK') {
      list = list.filter((c) => c.courseType === 'BOOK' || c.isBook);
    } else if (courseType === 'REGULAR') {
      list = list.filter((c) => c.courseType !== 'BOOK' && !c.isBook);
    }
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.author || '').toLowerCase().includes(q) ||
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
    const books = JSON.parse(localStorage.getItem('berea_enrolled_books') || '[]');
    const inCourses = Array.isArray(enrolled) && enrolled.some(
      (item) => item.courseId === courseId && (!item.source || item.status === 'ACTIVE' || item.source === 'PURCHASE')
    );
    const inBooks = Array.isArray(books) && books.some(
      (item) => item.courseId === courseId || item.id === courseId
    );
    return inCourses || inBooks;
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
    return Array.isArray(cart) && cart.some((item) => item.courseId === courseId || item.id === courseId);
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
      ? '<span class="price-amount" style="color:#059669; font-weight:800;">Free</span>'
      : `<span class="price-amount">₹${course.price.toLocaleString('en-IN')}</span>`;

  const fallbackImg =
    course.fallbackImage ||
    buildCourseCoverSvgDataUri(course.title, course.category, course.code);

  // If this is a Book Course, render eBook marketplace card
  if (course.isBook || course.courseType === 'BOOK') {
    const detailUrl = `book-details.html?id=${encodeURIComponent(course.id)}`;
    let bookAction = '';
    if (enrolled) {
      bookAction = `<a href="book-reader.html?id=${encodeURIComponent(course.id)}" class="btn btn-gold btn-sm" style="display:inline-flex; align-items:center; gap:0.4rem; font-weight:700;">📖 Read Online</a>`;
    } else if (inCart) {
      bookAction = `<a href="cart.html" class="btn btn-gold btn-sm">✓ In Cart</a>`;
    } else {
      const btnClass = isAuth ? 'btn btn-primary btn-sm btn-add-cart' : 'btn btn-gold btn-sm btn-add-cart';
      const btnLabel = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart`;
      bookAction = `<button type="button" class="${btnClass}" data-id="${escapeCourseHtml(course.id)}" data-course-id="${escapeCourseHtml(course.id)}">${btnLabel}</button>`;
    }

    return `
      <article class="course-card book-course-card" data-course-id="${escapeCourseHtml(course.id)}" style="display:flex; flex-direction:column; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden; background:#FFFFFF; box-shadow:0 4px 16px rgba(15,23,42,0.06); transition:transform 0.25s, box-shadow 0.25s;">
        <div class="course-thumb book-thumb" style="position:relative; background:linear-gradient(135deg, #1E1B4B 0%, #31102F 100%); padding:1.5rem 1rem 1rem; text-align:center; height:240px; display:flex; align-items:center; justify-content:center;">
          <img src="${escapeCourseHtml(course.image)}" onerror="this.onerror=null;this.src='${escapeCourseHtml(fallbackImg)}'" alt="${escapeCourseHtml(course.title)}" style="height:205px; width:auto; max-width:150px; object-fit:cover; border-radius:6px; box-shadow:0 12px 28px rgba(0,0,0,0.5); transform:perspective(700px) rotateY(-8deg); transition:transform 0.3s;" loading="lazy">
          <span style="position:absolute; top:12px; left:12px; background:linear-gradient(135deg, #C5A059, #DFBE7B); color:#1A050B; font-weight:800; font-size:0.7rem; padding:0.25rem 0.65rem; border-radius:6px; letter-spacing:0.04em; text-transform:uppercase; box-shadow:0 2px 8px rgba(0,0,0,0.25);">
            📖 eBook Course
          </span>
          <span style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); color:#FFF; font-weight:600; font-size:0.7rem; padding:0.25rem 0.55rem; border-radius:6px;">
            ${escapeCourseHtml(course.category)}
          </span>
        </div>
        <div class="course-body" style="padding:1.25rem; flex:1; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem; color:#64748B; margin-bottom:0.4rem;">
            <span>By <strong style="color:#1E293B;">${escapeCourseHtml(course.author || course.instructor.name)}</strong></span>
            <span style="font-weight:600; color:#3B82F6;">${course.pdfPageCount ? `${course.pdfPageCount} pages` : 'Complete Book'}</span>
          </div>
          <h3 class="course-title" style="font-size:1.05rem; font-weight:700; color:#0F172A; margin:0 0 0.5rem; line-height:1.35;">
            <a href="${detailUrl}" style="color:inherit; text-decoration:none;">${escapeCourseHtml(course.title)}</a>
          </h3>
          <p class="course-desc" style="font-size:0.83rem; color:#475569; line-height:1.5; margin-bottom:1rem; flex:1; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
            ${escapeCourseHtml(course.shortDesc)}
          </p>
          <div style="font-size:0.75rem; color:#64748B; display:flex; gap:0.5rem; align-items:center; padding-top:0.5rem; border-top:1px dashed #E2E8F0;">
            <span style="color:#D97706; font-weight:600;">✨ Realistic 3D Reader</span>
            <span>•</span>
            <span>${escapeCourseHtml(course.language || 'English')}</span>
          </div>
        </div>
        <div class="course-footer" style="padding:1rem 1.25rem; background:#F8FAFC; border-top:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center;">
          <div class="course-price-block">
            <span class="price-label" style="display:block; font-size:0.68rem; color:#64748B; text-transform:uppercase; font-weight:700;">Price</span>
            ${priceLabel}
          </div>
          <div class="course-actions" style="display:flex; gap:0.5rem;">
            <a href="${detailUrl}" class="btn btn-secondary btn-sm">Details</a>
            ${bookAction}
          </div>
        </div>
      </article>
    `;
  }

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

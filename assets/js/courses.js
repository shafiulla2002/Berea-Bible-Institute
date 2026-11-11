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
    image:
      c.coverImage ||
      'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=800&q=80',
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
    list = list.filter((c) => c.category === category);
  }
  if (level !== 'ALL') {
    list = list.filter((c) => c.level === level);
  }
  if (mode !== 'ALL') {
    list = list.filter(
      (c) => c.learningMode === mode || (c.studyMode || '').toLowerCase().includes(mode.toLowerCase()),
    );
  }
  if (duration !== 'ALL') {
    list = list.filter((c) => c.durationCategory === duration);
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'title_asc') {
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
    return Array.isArray(enrolled) && enrolled.some((item) => item.courseId === courseId);
  } catch (e) {
    return false;
  }
}

function createCourseCardHTML(course) {
  const enrolled = isCourseEnrolled(course.id);
  const priceLabel =
    course.pricing === 'FREE' || course.price === 0
      ? '<span class="price-amount">Free</span>'
      : `<span class="price-amount">₹${course.price.toLocaleString('en-IN')}</span>`;

  return `
    <article class="course-card">
      <div class="course-image-box">
        <img src="${escapeCourseHtml(course.image)}" alt="${escapeCourseHtml(course.title)}" class="course-image" loading="lazy">
        <span class="course-category-tag">${escapeCourseHtml(course.category)}</span>
        <span class="course-level-tag">${escapeCourseHtml(course.level)}</span>
      </div>
      <div class="course-card-body">
        <div class="course-meta-row">
          <span class="course-code">${escapeCourseHtml(course.code)}</span>
          <span class="course-duration">${escapeCourseHtml(course.duration)}</span>
        </div>
        <h3 class="course-title">
          <a href="course-details.html?id=${encodeURIComponent(course.id)}">${escapeCourseHtml(course.title)}</a>
        </h3>
        <p class="course-desc">${escapeCourseHtml(course.shortDesc)}</p>
        <div class="course-instructor">
          <div class="instructor-avatar">${escapeCourseHtml(course.instructor.avatar)}</div>
          <div>
            <div class="instructor-name">${escapeCourseHtml(course.instructor.name)}</div>
            <div class="instructor-title">${escapeCourseHtml(course.studyMode)}</div>
          </div>
        </div>
      </div>
      <div class="course-card-footer">
        <div class="course-price">
          <span class="price-label">${course.pricing === 'FREE' ? 'Tuition Scholarship' : 'Tuition Fee'}</span>
          ${priceLabel}
        </div>
        <div class="course-actions">
          <a href="course-details.html?id=${encodeURIComponent(course.id)}" class="btn btn-secondary btn-sm">Details</a>
          ${
            enrolled
              ? `<a href="student-dashboard.html" class="btn btn-primary btn-sm">Enrolled ✓</a>`
              : `<button type="button" class="btn btn-gold btn-sm btn-add-cart" data-course-id="${escapeCourseHtml(course.id)}">
                   Add to Cart
                 </button>`
          }
        </div>
      </div>
    </article>
  `;
}

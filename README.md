# Berea Bible Institute & Theological Seminary
## Complete Student Enrollment & Course Purchase UI/UX Prototype

**Phase 1: Frontend User Experience Prototype**  
**Tech Stack**: HTML5, CSS3 (Custom Academic Design System), Vanilla JavaScript (Zero External Frameworks)  
**Target Audience**: Prospective Bible Institute Students, Pastors, and Ministry Candidates  

---

### 1. Project Overview & Design Identity

This standalone prototype implements the complete, production-ready frontend experience for student enrollment and course purchase at a premium Bible Institute:

- **Institutional Identity**: Berea Bible Institute & Theological Seminary (*Veritas et Fides* — "Truth and Faith").
- **Palette**: Deep Burgundy (`#3D0C17` / `#7A1931`), Subtle Academic Gold (`#C5A059`), Warm Cream (`#FBF9F5` / `#F4EFEA`), and Crisp White.
- **Typography**: Playfair Display (historical academic serif headings) & Plus Jakarta Sans (clean, highly readable body typography).
- **Design Inspiration**: Stanford Continuing Studies course catalogue and multi-step checkout workflow, adapted to an authentic theological seminary identity.
- **Strict Boundary**: Purely static HTML/CSS/JS frontend. **Zero backend, zero database, zero real payment processing, zero impact on existing NestJS LMS.**

---

### 2. Complete File Directory

```
student-enrollment-ui/
├── index.html                   # Page 1: Home Page (Hero, Programs, Faculty, FAQ)
├── courses.html                 # Page 2: Course Catalogue & Dynamic Filter Sidebar
├── course-details.html          # Page 3: Course Details & Syllabus Breakdowns
├── registration.html            # Page 4: Student Registration Form & Document Upload
├── cart.html                    # Page 5: Shopping Cart & Scholarship Coupon Engine
├── checkout.html                # Page 6: Multi-Step Checkout (Steps 1–7)
├── order-review.html            # Page 7: Pre-Payment Order Review & Verification
├── payment-result.html          # Page 8: Demonstration Payment Results (Success/Pending/Failed)
├── student-login.html           # Page 9: Student Portal Login (Mobile + OTP / Password)
├── student-dashboard.html       # Page 10: Enrolled Courses & Learning Hub
├── assets/
│   ├── css/
│   │   ├── style.css            # Complete CSS Design System & Components
│   │   └── responsive.css       # Mobile & Tablet Breakpoint Optimization
│   └── js/
│       ├── app.js               # Global Shell, Cart Count Badge & Toast Notifications
│       ├── courses.js           # 12 Sample Bible Courses Dataset & Query Logic
│       ├── cart.js              # Cart Storage, Math Calculations & Promo Codes
│       ├── registration.js      # Form Validation & Instant Document Previews
│       └── checkout.js          # Multi-Step Stepper & Demo Payment Simulation
└── README.md                    # Documentation & Prototype Walkthrough Guide
```

---

### 3. Quick Start & Local Preview

You can open the prototype directly in any browser:

#### Option A: Direct File Opening
Double-click `student-enrollment-ui/index.html` in your file explorer or open:
`file:///c:/Users/SHAFIULLA/OneDrive/Desktop/BIBLE-Management/student-enrollment-ui/index.html`

#### Option B: Local Static HTTP Server
Run from the repository root:
```bash
npx serve student-enrollment-ui -p 3000
```
Then visit `http://localhost:3000` in your web browser.

---

### 4. Interactive Student Journey & Features

1. **Home Page (`index.html`)**:
   - Institutional banner, crest, hero with academic trust metrics.
   - Dynamic featured courses cards with tuition, instructor, duration, and direct "Add to Cart" or "Details" buttons.
   - Degree tracks (Certificate, Diploma, Classical Languages).
   - Testimonials, FAQ accordion, and multi-column academic footer.

2. **Course Catalogue (`courses.html`)**:
   - Real-time search across title, course code (e.g., `BIB-101`, `THE-101`), and instructor name.
   - Live filters: Curriculum discipline, academic level, instruction format, and cohort duration.
   - Sorting options: Featured, Recently Added, Tuition (Low to High / High to Low), and Alphabetical (A–Z).

3. **Course Details (`course-details.html?id=course-bib-101`)**:
   - Full course overview, theological rationale, and 5 learning objectives.
   - Modular curriculum syllabi with lesson counters.
   - Faculty biography, credentials, and avatar.
   - Sticky enrollment card with cohort date selector, "Enroll Now" (fast-checkout), and "Add to Cart".

4. **Student Registration (`registration.html`)**:
   - Four structured sections: Personal Identity, Contact Details, Educational & Ministry Background, and Document/Photo Attachments.
   - Live client validation with required field indicators.
   - Photo upload preview and academic transcript attachment preview.
   - Saves draft to `localStorage` automatically.

5. **Shopping Cart (`cart.html`)**:
   - Itemized course list with cohort schedule, tuition, and registration fee.
   - Instant course removal with recalculation.
   - Promo code scholarship engine:
     - `BIBLE2026`: 20% tuition scholarship grant.
     - `GRACE50`: 50% ministry worker subsidy.
     - `WELCOME15`: $15 first-time credit.

6. **Multi-Step Checkout (`checkout.html`)**:
   - 7 sequential steps:
     - **Step 1**: Personal Information (prefilled from registration draft).
     - **Step 2**: Course Selection & Cohort Schedule confirmation.
     - **Step 3**: Discounts and Enrollment Credits.
     - **Step 4**: Institutional Policy Acceptance (Honor Code, Statement of Faith, Refund Policy).
     - **Step 5**: How Did You Hear About Us? (Referral survey).
     - **Step 6**: Comprehensive Order Review with step edit shortcuts.
     - **Step 7**: Simulated Demonstration Payment (Card / NetBanking / Voucher).
   - Sticky Order Summary sidebar on desktop; responsive collapsible drawer on mobile.

7. **Order Review (`order-review.html`)**:
   - Dedicated pre-payment application review showing candidate profile, chosen courses, accepted policies, and fee breakdown.

8. **Payment Result (`payment-result.html`)**:
   - Official enrollment confirmation with reference number, student name, and date.
   - Printable official receipt format (`window.print()` friendly).
   - Demonstration outcome switcher: review **Success**, **Pending**, and **Failed** states with a single click.

9. **Student Login (`student-login.html`)**:
   - Dual authentication tabs: **Mobile & 6-Digit OTP** (with resend timer) or **Email & Password**.
   - Direct link to new student registration.

10. **Student Enrolled Courses Portal (`student-dashboard.html`)**:
    - Matriculated student dashboard displaying active enrolled cohorts, progress bars, attendance rates, upcoming live classes, and "Continue Learning" action triggers.

---

### 5. Safety & System Isolation Confirmation

- This prototype lives entirely inside `student-enrollment-ui/`.
- No modification was made to `apps/api` (NestJS backend), `packages/database`, Prisma schema, or PostgreSQL.
- No real payment or credential harvesting is implemented.


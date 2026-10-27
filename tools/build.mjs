/**
 * Asha Jyothi — static SEO build
 *
 * Reads the course catalogue from js/data.js and writes:
 *   1. courses/<id>.html   one crawlable page per course
 *   2. index.html          static course cards + course ItemList JSON-LD (between BUILD markers)
 *   3. sitemap.xml
 *
 * Run after editing js/data.js:   node tools/build.mjs
 * No dependencies. The site still works without running it; this only keeps
 * the search-engine-visible copies in sync with data.js.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.ashajyothi.org.in';
const ORG_ID = `${SITE}/#organization`;
const TODAY = new Date().toISOString().slice(0, 10);

const CAMPUSES = [
  { name: 'Alwal Campus', area: 'Alwal, Secunderabad', phone: '8019680291',
    address: 'Plot No 2-2-130/14, Near Street Michael School, Dwarakapuri Colony, Kompally Road, Alwal, Hyderabad 500010' },
  { name: 'Medchal Campus', area: 'Athvelly, Medchal', phone: '7780346642',
    address: 'Athvelly, Medchal, Telangana 501401 (Near Shantha Biologics)' },
  { name: 'Ramanthapur Campus', area: 'Ramanthapur, near Wadiaram', phone: '9949809263',
    address: 'Opposite Ithika Shaantham Meadows, Near Hamsa Hostel, Ramanthapur, Wadiaram, Telangana 502255' }
];

/* ---------- Load data.js exactly as the browser does ---------- */

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8'), sandbox);
const COURSES = sandbox.window.COURSES_DATA;
const esc = sandbox.window.escapeHTML;

const coursePath = (c) => `courses/${c.id}.html`;
const courseUrl = (c) => `${SITE}/${coursePath(c)}`;
const pageTitle = (c) => `${c.name} Course in Hyderabad`;
const jsonLd = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`;

/* ---------- Course card (mirror of renderCourses() in js/catalogue.js) ---------- */

function courseCard(course) {
  return `
        <article class="course-card" data-course-id="${esc(course.id)}">
          <div class="card-media">
            <img src="${esc(course.image)}"
                 alt="${esc(course.name)} practical vocational training"
                 width="400"
                 height="240"
                 loading="lazy"
                 class="card-img">
            <span class="card-badge">${esc(course.category)}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title"><a href="${coursePath(course)}" class="card-title-link">${esc(course.name)}</a></h3>
            <p class="card-description">${esc(course.shortDescription)}</p>
            <div class="card-meta">
              <span class="meta-tag">
                <i class="fa-regular fa-clock" style="font-size:13px; color:var(--color-navy); margin-right:3px"></i>
                ${esc(course.duration)}
              </span>
              <span class="meta-tag meta-badge">
                <i class="fa-solid fa-award" style="font-size:12px; color:var(--color-red); margin-right:3px"></i>
                ${esc(course.badge || 'Certified')}
              </span>
            </div>
          </div>
          <div class="card-footer">
            <button type="button"
                    class="btn btn-outline btn-sm js-view-details"
                    data-course-id="${esc(course.id)}"
                    aria-haspopup="dialog">
              View Details
            </button>
            <button type="button"
                    class="btn btn-primary btn-sm js-enquire-course"
                    data-course-id="${esc(course.id)}">
              Enquire
            </button>
          </div>
        </article>`;
}

/* ---------- Course page ---------- */

function courseFaqs(c) {
  return [
    { q: `Who can join the ${c.name} course?`,
      a: `${c.eligibility}.` },
    { q: `How long is the ${c.name} course?`,
      a: `${c.duration}. Classes are hands-on, with most of the time spent practising in the lab.` },
    { q: `What is the fee for the ${c.name} course?`,
      a: 'The fee is subsidized. Asha Jyothi is a non-profit training centre, so fees are kept low for every student. Call your nearest campus for the current fee and batch timings.' },
    { q: `What jobs can I get after the ${c.name} course?`,
      a: `${c.careers.join('; ')}.` },
    { q: `Where can I join the ${c.name} course?`,
      a: `Asha Jyothi runs classes at three campuses: Alwal (Secunderabad, 80196 80291), Medchal (77803 46642) and Ramanthapur (99498 09263). Call the campus nearest you to check when the next batch starts.` }
  ];
}

const CHECK_SVG = `<svg class="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D62828" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

function header() {
  return `
  <header class="site-header" role="banner">
    <div class="container header-container">
      <a href="../index.html" class="brand-link" aria-label="Asha Jyothi Home">
        <img src="../assets/logo/asha-jyothi-logo.png"
             alt="Asha Jyothi Employable Skill Training Centre Logo"
             width="280" height="56"
             class="brand-logo-img">
      </a>

      <button type="button" class="nav-toggle" aria-controls="primary-nav-menu" aria-expanded="false" aria-label="Toggle navigation menu">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>

      <nav id="primary-nav-menu" class="nav-menu" role="navigation" aria-label="Main Navigation">
        <ul class="nav-list">
          <li><a href="../index.html#home"          class="nav-link"><i class="fa-solid fa-house nav-link-icon" aria-hidden="true"></i><span>Home</span></a></li>
          <li><a href="../index.html#courses"       class="nav-link is-active"><i class="fa-solid fa-graduation-cap nav-link-icon" aria-hidden="true"></i><span>Courses</span></a></li>
          <li><a href="../programs.html"            class="nav-link"><i class="fa-solid fa-children nav-link-icon" aria-hidden="true"></i><span>Programs for Kids</span></a></li>
          <li><a href="../index.html#history"       class="nav-link"><i class="fa-solid fa-book-open nav-link-icon" aria-hidden="true"></i><span>Our Story</span></a></li>
          <li><a href="../index.html#faq"           class="nav-link"><i class="fa-solid fa-circle-question nav-link-icon" aria-hidden="true"></i><span>FAQ</span></a></li>
          <li><a href="../index.html#locations"     class="nav-link"><i class="fa-solid fa-location-dot nav-link-icon" aria-hidden="true"></i><span>Locations</span></a></li>
          <li><a href="../index.html#contact"       class="nav-link"><i class="fa-solid fa-phone nav-link-icon" aria-hidden="true"></i><span>Contact</span></a></li>
        </ul>
        <div class="header-cta">
          <a href="../index.html#enquiry" class="btn btn-primary btn-sm btn-block-mobile">
            <i class="fa-solid fa-paper-plane" style="font-size:13px; margin-right:4px"></i> Enquire Now
          </a>
        </div>
        <div class="mobile-nav-helpline">
          <span class="mobile-helpline-label">Admissions Hotline:</span>
          <a href="tel:8019680291" class="mobile-helpline-phone"><i class="fa-solid fa-phone-volume"></i> 80196 80291</a>
        </div>
      </nav>
    </div>
  </header>`;
}

function footer() {
  const popular = COURSES.filter((c) => POPULAR_IDS.includes(c.id));
  return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">

        <div>
          <div class="footer-brand-title">ASHA JYOTHI</div>
          <div class="footer-brand-subtitle">Employable Skill Training Centre</div>
          <p class="footer-desc">
            Since 2007, Asha Jyothi has trained 16,800+ youth and women in practical, job-oriented skills. Subsidized courses at 3 campuses in Hyderabad and Telangana.
          </p>
          <p class="footer-desc">
            <strong style="color:#e2e8f0;">Recognition:</strong> Recognized by the Intermediate Board of Telangana.
          </p>
        </div>

        <div>
          <h4 class="footer-heading">Quick Navigation</h4>
          <ul class="footer-links-list">
            <li><a href="../index.html#home"      class="footer-link">Home</a></li>
            <li><a href="../index.html#courses"   class="footer-link">Course Catalogue</a></li>
            <li><a href="../programs.html"        class="footer-link">Programs for Kids</a></li>
            <li><a href="../index.html#faq"       class="footer-link">FAQ</a></li>
            <li><a href="../index.html#locations" class="footer-link">Campuses</a></li>
            <li><a href="../index.html#enquiry"   class="footer-link">Admission Enquiry</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Popular Courses</h4>
          <ul class="footer-links-list">
${popular.map((c) => `            <li><a href="${c.id}.html" class="footer-link">${esc(c.name)}</a></li>`).join('\n')}
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Campus Contact</h4>
          <div class="footer-campus-info">
${CAMPUSES.map((cp) => `            <div class="footer-campus-block">
              <span class="footer-campus-name">${cp.name}:</span><br>
              <a href="tel:${cp.phone}" class="footer-campus-num">+91 ${cp.phone.slice(0, 5)} ${cp.phone.slice(5)}</a>
            </div>`).join('\n')}
            <div class="footer-campus-block">
              <span class="footer-campus-name">Email:</span><br>
              <a href="mailto:info@ashajyothi.org.in" class="footer-campus-num">info@ashajyothi.org.in</a>
            </div>
          </div>
        </div>

      </div>

      <div class="footer-bottom">
        <div>&copy; <span id="current-year">2026</span> Asha Jyothi Employable Skill Training Centre. All rights reserved.</div>
        <div>Vocational Skills for Real Opportunities &bull; Recognized by Intermediate Board of Telangana</div>
      </div>
    </div>
  </footer>`;
}

// Shown in every course page footer and the home page footer
const POPULAR_IDS = ['medical-nursing-assistant', 'medical-lab-phlebotomy', 'tally-data-entry', 'electrical-electronics', 'beautician-basic', 'spoken-english-l2'];

function coursePage(c) {
  const title = pageTitle(c);
  const metaDescription = `${c.shortDescription} Subsidized ${c.name} course at Asha Jyothi, Hyderabad. ${c.duration}. Eligibility: ${c.eligibility}.`;
  const faqs = courseFaqs(c);
  const related = COURSES.filter((o) => o.category === c.category && o.id !== c.id);
  const enquireHref = `../index.html?course=${encodeURIComponent(c.id)}#enquiry`;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${courseUrl(c)}#course`,
        name: `${c.name} Course`,
        description: c.fullDescription,
        url: courseUrl(c),
        image: `${SITE}/${c.image}`,
        coursePrerequisites: c.eligibility,
        teaches: c.keyTopics,
        educationalCredentialAwarded: 'Certificate of completion',
        provider: { '@type': 'EducationalOrganization', '@id': ORG_ID, name: 'Asha Jyothi Employable Skill Training Centre', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE}/#courses` },
          { '@type': 'ListItem', position: 3, name: c.name, item: courseUrl(c) }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }
    ]
  };

  return `<!DOCTYPE html>
<!-- Generated by tools/build.mjs from js/data.js. Do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | Asha Jyothi</title>
  <meta name="description" content="${esc(metaDescription)}">
  <meta name="theme-color" content="#10194F">
  <link rel="canonical" href="${courseUrl(c)}">

  <link rel="icon" href="../favicon.ico" sizes="any">
  <link rel="icon" href="../assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Asha Jyothi Employable Skill Training Centre">
  <meta property="og:locale" content="en_IN">
  <meta property="og:url" content="${courseUrl(c)}">
  <meta property="og:title" content="${esc(title)} | Asha Jyothi">
  <meta property="og:description" content="${esc(c.shortDescription)}">
  <meta property="og:image" content="${SITE}/assets/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="../css/style.css">

  ${jsonLd(ld)}
</head>
<body id="top">

  <a href="#main-content" class="skip-link">Skip to main content</a>
${header()}

  <main id="main-content">

    <section class="cp-hero" aria-labelledby="course-heading">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="../index.html">Home</a></li>
            <li><a href="../index.html#courses">Courses</a></li>
            <li aria-current="page">${esc(c.name)}</li>
          </ol>
        </nav>

        <div class="cp-hero-grid">
          <div>
            <span class="section-eyebrow">${esc(c.category)}</span>
            <h1 id="course-heading" class="cp-title">${esc(c.name)} Course <span class="highlight-red">in Hyderabad</span></h1>
            <p class="hero-description">${esc(c.shortDescription)}</p>

            <dl class="cp-facts">
              <div><dt>Duration</dt><dd>${esc(c.duration)}</dd></div>
              <div><dt>Eligibility</dt><dd>${esc(c.eligibility)}</dd></div>
              <div><dt>Fee</dt><dd>Subsidized (non-profit)</dd></div>
              <div><dt>Training</dt><dd>Hands-on practical labs</dd></div>
            </dl>

            <div class="hero-actions">
              <a href="${enquireHref}" class="btn btn-primary btn-lg">Enquire for This Course</a>
              <a href="tel:8019680291" class="btn btn-outline btn-lg"><i class="fa-solid fa-phone" style="margin-right:6px"></i>Call 80196 80291</a>
            </div>
          </div>

          <img src="../${esc(c.image)}"
               alt="${esc(c.name)} practical training at Asha Jyothi"
               width="600" height="400"
               fetchpriority="high"
               class="cp-hero-img">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container cp-layout">

        <div class="cp-main">
          <h2 class="cp-heading">About the ${esc(c.name)} Course</h2>
          <p class="cp-text">${esc(c.fullDescription)}</p>

          <h2 class="cp-heading">What You Will Learn</h2>
          <ul class="modal-topics-list">
${c.keyTopics.map((t) => `            <li>${CHECK_SVG}<span>${esc(t)}</span></li>`).join('\n')}
          </ul>

          <h2 class="cp-heading">Jobs After This Course</h2>
          <ul class="modal-topics-list">
${c.careers.map((t) => `            <li><i class="fa-solid fa-briefcase cp-list-icon" aria-hidden="true"></i><span>${esc(t)}</span></li>`).join('\n')}
          </ul>

          <h2 class="cp-heading">Frequently Asked Questions</h2>
          <div class="faq-list">
${faqs.map((f) => `            <details class="faq-item">
              <summary class="faq-question">${esc(f.q)}</summary>
              <p class="faq-answer">${esc(f.a)}</p>
            </details>`).join('\n')}
          </div>
        </div>

        <aside class="cp-aside">
          <div class="cp-card">
            <h2 class="cp-card-title">Where to Study</h2>
            <ul class="cp-campus-list">
${CAMPUSES.map((cp) => `              <li>
                <strong>${cp.name}</strong>
                <span>${esc(cp.address)}</span>
                <a href="tel:${cp.phone}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${cp.phone}</a>
              </li>`).join('\n')}
            </ul>
            <a href="${enquireHref}" class="btn btn-primary btn-block">Send an Enquiry</a>
          </div>

          ${related.length ? `<div class="cp-card">
            <h2 class="cp-card-title">Related Courses</h2>
            <ul class="cp-related-list">
${related.map((o) => `              <li><a href="${o.id}.html">${esc(o.name)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></li>`).join('\n')}
            </ul>
          </div>` : ''}
        </aside>

      </div>
    </section>

  </main>
${footer()}

  <button type="button" id="back-to-top" class="back-to-top" aria-label="Back to top of page">
    <i class="fa-solid fa-chevron-up"></i>
  </button>

  <script src="../js/navigation.js" defer></script>
  <script src="../js/app.js" defer></script>
</body>
</html>
`;
}

/* ---------- Write everything ---------- */

function replaceBetween(src, name, content) {
  const re = new RegExp(`(<!-- BUILD:${name} -->)[\\s\\S]*?(\\s*<!-- /BUILD:${name} -->)`);
  if (!re.test(src)) throw new Error(`Marker BUILD:${name} not found in index.html`);
  return src.replace(re, (m, open, close) => `${open}${content}${close}`);
}

fs.mkdirSync(path.join(ROOT, 'courses'), { recursive: true });
for (const c of COURSES) {
  fs.writeFileSync(path.join(ROOT, coursePath(c)), coursePage(c));
}

const indexFile = path.join(ROOT, 'index.html');
let index = fs.readFileSync(indexFile, 'utf8');
index = replaceBetween(index, 'course-cards', COURSES.map(courseCard).join(''));
index = replaceBetween(index, 'course-list-ld', '\n  ' + jsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Job-oriented skill courses at Asha Jyothi, Hyderabad',
  itemListElement: COURSES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: courseUrl(c), name: `${c.name} Course` }))
}));
index = replaceBetween(index, 'popular-courses', '\n' + COURSES
  .filter((c) => POPULAR_IDS.includes(c.id))
  .map((c) => `            <li><a href="${coursePath(c)}" class="footer-link">${esc(c.name)}</a></li>`)
  .join('\n'));
fs.writeFileSync(indexFile, index);

const urls = [`${SITE}/`, `${SITE}/programs.html`, ...COURSES.map(courseUrl)];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${COURSES.length} course pages, updated index.html and sitemap.xml (${urls.length} URLs).`);

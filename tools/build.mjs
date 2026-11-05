/**
 * Asha Jyothi — static SEO build
 *
 * Reads the course catalogue from js/data.js (and the Telugu text in js/data.te.js) and writes:
 *   1. courses/<id>.html      one crawlable page per course (English)
 *   2. te/courses/<id>.html   the same pages in Telugu
 *   3. index.html, te/index.html   static course cards + course ItemList JSON-LD (between BUILD markers)
 *   4. sitemap.xml
 *
 * Run after editing js/data.js or js/data.te.js:   node tools/build.mjs
 * No dependencies. The site still works without running it; this only keeps
 * the search-engine-visible copies in sync with the data files.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.ashajyothi.org.in';
const ORG_ID = `${SITE}/#organization`;
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- Load the data files exactly as the browser does ---------- */

function loadData(files) {
  const sandbox = vm.createContext({ window: {} });
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox);
  }
  return sandbox.window;
}

const DATA_EN = loadData(['js/data.js']);
const DATA_TE = loadData(['js/data.js', 'js/data.te.js']);
const esc = DATA_EN.escapeHTML;

const jsonLd = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`;

// Shown in every course page footer and the home page footer
const POPULAR_IDS = ['medical-nursing-assistant', 'medical-lab-phlebotomy', 'tally-data-entry', 'electrical-electronics', 'beautician-basic', 'spoken-english-l2'];

const CHECK_SVG = `<svg class="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D62828" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

/* ---------- Per-language text ---------- */

const LANG = {
  en: {
    code: 'en',
    hreflang: 'en-IN',
    ogLocale: 'en_IN',
    dir: '',                       // folder under the site root
    courses: DATA_EN.COURSES_DATA,
    fonts: 'family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400',
    siteName: 'Asha Jyothi Employable Skill Training Centre',
    brand: 'Asha Jyothi',
    switchTo: { lang: 'te', label: 'తెలుగు', aria: 'ఈ పేజీని తెలుగులో చూడండి' },
    skipLink: 'Skip to main content',
    homeAria: 'Asha Jyothi Home',
    logoAlt: 'Asha Jyothi Employable Skill Training Centre Logo',
    navToggle: 'Toggle navigation menu',
    navAria: 'Main Navigation',
    nav: { home: 'Home', courses: 'Courses', kids: 'Programs for Kids', story: 'Our Story', faq: 'FAQ', locations: 'Locations', contact: 'Contact' },
    enquireNow: 'Enquire Now',
    hotline: 'Admissions Hotline:',
    backToTop: 'Back to top of page',
    campuses: [
      { name: 'Alwal Campus', phone: '8019680291',
        address: 'Plot No 2-2-130/14, Near Street Michael School, Dwarakapuri Colony, Kompally Road, Alwal, Hyderabad 500010' },
      { name: 'Medchal Campus', phone: '7780346642',
        address: 'Athvelly, Medchal, Telangana 501401 (Near Shantha Biologics)' },
      { name: 'Chegunta Campus', phone: '9949809263',
        address: 'Opposite Ithika Shaantham Meadows, Near Hamsa Hostel, Ramanthapur, Wadiaram, Telangana 502255' }
    ],
    footer: {
      title: 'ASHA JYOTHI',
      subtitle: 'Employable Skill Training Centre',
      desc: 'Since 2007, Asha Jyothi has trained 16,800+ youth and women in practical, job-oriented skills. Subsidized courses at 3 campuses in Hyderabad and Telangana.',
      recognitionLabel: 'Recognition:',
      recognition: 'Recognized by the Intermediate Board of Telangana.',
      quickNav: 'Quick Navigation',
      catalogue: 'Course Catalogue',
      campusesLink: 'Campuses',
      enquiry: 'Admission Enquiry',
      popular: 'Popular Courses',
      contact: 'Campus Contact',
      email: 'Email',
      rights: 'Asha Jyothi Employable Skill Training Centre. All rights reserved.',
      tagline: 'Vocational Skills for Real Opportunities &bull; Recognized by Intermediate Board of Telangana'
    },
    card: {
      imgAlt: (c) => `${c.name} practical vocational training`,
      viewDetails: 'View Details',
      enquire: 'Enquire',
      certified: 'Certified'
    },
    itemListName: 'Job-oriented skill courses at Asha Jyothi, Hyderabad',
    page: {
      title: (c) => `${c.name} Course in Hyderabad | Asha Jyothi`,
      h1: (c) => `${esc(c.name)} Course <span class="highlight-red">in Hyderabad</span>`,
      // Hand-written per course in data.js: search engines cut descriptions over 160 characters
      metaDescription: (c) => c.metaDescription,
      courseName: (c) => `${c.name} Course`,
      credential: 'Certificate of completion',
      breadcrumbHome: 'Home',
      breadcrumbCourses: 'Courses',
      factDuration: 'Duration',
      factEligibility: 'Eligibility',
      factFee: 'Fee',
      factFeeValue: 'Subsidized (non-profit)',
      factTraining: 'Training',
      factTrainingValue: 'Hands-on practical labs',
      enquireCourse: 'Enquire for This Course',
      call: 'Call',
      heroImgAlt: (c) => `${c.name} practical training at Asha Jyothi`,
      about: (c) => `About the ${esc(c.name)} Course`,
      learn: 'What You Will Learn',
      jobs: 'Jobs After This Course',
      faqHeading: 'Frequently Asked Questions',
      whereToStudy: 'Where to Study',
      sendEnquiry: 'Send an Enquiry',
      related: 'Related Courses',
      faqs: (c) => [
        { q: `Who can join the ${c.name} course?`,
          a: `${c.eligibility}.` },
        { q: `How long is the ${c.name} course?`,
          a: `${c.duration}. Classes are hands-on, with most of the time spent practising in the lab.` },
        { q: `What is the fee for the ${c.name} course?`,
          a: 'The fee is subsidized. Asha Jyothi is a non-profit training centre, so fees are kept low for every student. Call your nearest campus for the current fee and batch timings.' },
        { q: `What jobs can I get after the ${c.name} course?`,
          a: `${c.careers.join('; ')}.` },
        { q: `Where can I join the ${c.name} course?`,
          a: `Asha Jyothi runs classes at three campuses: Alwal (Secunderabad, 80196 80291), Medchal (77803 46642) and Chegunta (99498 09263). Call the campus nearest you to check when the next batch starts.` }
      ]
    }
  },

  te: {
    code: 'te',
    hreflang: 'te-IN',
    ogLocale: 'te_IN',
    dir: 'te/',
    courses: DATA_TE.COURSES_DATA,
    fonts: 'family=Noto+Sans+Telugu:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400',
    siteName: 'ఆశా జ్యోతి ఉద్యోగ నైపుణ్య శిక్షణ కేంద్రం',
    brand: 'ఆశా జ్యోతి',
    switchTo: { lang: 'en', label: 'English', aria: 'View this page in English' },
    skipLink: 'ప్రధాన విషయానికి వెళ్లండి',
    homeAria: 'ఆశా జ్యోతి హోమ్',
    logoAlt: 'ఆశా జ్యోతి ఉద్యోగ నైపుణ్య శిక్షణ కేంద్రం లోగో',
    navToggle: 'మెనూ తెరవండి',
    navAria: 'ప్రధాన మెనూ',
    nav: { home: 'హోమ్', courses: 'కోర్సులు', kids: 'పిల్లల ప్రోగ్రామ్స్', story: 'మా కథ', faq: 'సందేహాలు', locations: 'క్యాంపస్‌లు', contact: 'సంప్రదించండి' },
    enquireNow: 'ఎంక్వైరీ చేయండి',
    hotline: 'అడ్మిషన్స్ హెల్ప్‌లైన్:',
    backToTop: 'పేజీ పైకి వెళ్లండి',
    campuses: [
      { name: 'అల్వాల్ క్యాంపస్', phone: '8019680291',
        address: 'ప్లాట్ నం. 2-2-130/14, సెయింట్ మైకేల్ స్కూల్ దగ్గర, ద్వారకాపురి కాలనీ, కొంపల్లి రోడ్, అల్వాల్, హైదరాబాద్ 500010' },
      { name: 'మేడ్చల్ క్యాంపస్', phone: '7780346642',
        address: 'అత్వెల్లి, మేడ్చల్, తెలంగాణ 501401 (శాంతా బయోలాజిక్స్ దగ్గర)' },
      { name: 'చేగుంట క్యాంపస్', phone: '9949809263',
        address: 'ఇతిక శాంతం మెడోస్ ఎదురుగా, హంస హాస్టల్ దగ్గర, రామంతాపూర్, వడియారం, తెలంగాణ 502255' }
    ],
    footer: {
      title: 'ఆశా జ్యోతి',
      subtitle: 'ఉద్యోగ నైపుణ్య శిక్షణ కేంద్రం',
      desc: '2007 నుంచి ఆశా జ్యోతి 16,800+ మంది యువతకు, మహిళలకు ఉద్యోగానికి ఉపయోగపడే ప్రాక్టికల్ నైపుణ్యాల్లో శిక్షణ ఇచ్చింది. హైదరాబాద్, తెలంగాణలోని 3 క్యాంపస్‌లలో సబ్సిడీ ఫీజుతో కోర్సులు.',
      recognitionLabel: 'గుర్తింపు:',
      recognition: 'తెలంగాణ ఇంటర్మీడియట్ బోర్డు గుర్తింపు పొందిన సంస్థ.',
      quickNav: 'త్వరిత లింకులు',
      catalogue: 'కోర్సుల జాబితా',
      campusesLink: 'క్యాంపస్‌లు',
      enquiry: 'అడ్మిషన్ ఎంక్వైరీ',
      popular: 'ప్రముఖ కోర్సులు',
      contact: 'క్యాంపస్ ఫోన్ నంబర్లు',
      email: 'ఈమెయిల్',
      rights: 'ఆశా జ్యోతి ఉద్యోగ నైపుణ్య శిక్షణ కేంద్రం. సర్వ హక్కులు ప్రత్యేకించబడినవి.',
      tagline: 'నిజమైన అవకాశాల కోసం వృత్తి నైపుణ్యాలు &bull; తెలంగాణ ఇంటర్మీడియట్ బోర్డు గుర్తింపు'
    },
    card: {
      imgAlt: (c) => `${c.name} ప్రాక్టికల్ శిక్షణ`,
      viewDetails: 'వివరాలు చూడండి',
      enquire: 'ఎంక్వైరీ',
      certified: 'సర్టిఫైడ్'
    },
    itemListName: 'ఆశా జ్యోతి, హైదరాబాద్‌లో ఉద్యోగ ఆధారిత నైపుణ్య కోర్సులు',
    page: {
      title: (c) => `${c.name} కోర్సు హైదరాబాద్‌లో – ${c.nameEn} | ఆశా జ్యోతి`,
      h1: (c) => `${esc(c.name)} కోర్సు <span class="highlight-red">హైదరాబాద్‌లో</span>`,
      metaDescription: (c) => c.metaDescription,
      courseName: (c) => `${c.name} కోర్సు`,
      credential: 'కోర్సు పూర్తి సర్టిఫికెట్',
      breadcrumbHome: 'హోమ్',
      breadcrumbCourses: 'కోర్సులు',
      factDuration: 'వ్యవధి',
      factEligibility: 'అర్హత',
      factFee: 'ఫీజు',
      factFeeValue: 'సబ్సిడీ (లాభాపేక్ష లేని సంస్థ)',
      factTraining: 'శిక్షణ',
      factTrainingValue: 'ప్రాక్టికల్ ల్యాబ్ శిక్షణ',
      enquireCourse: 'ఈ కోర్సు కోసం ఎంక్వైరీ చేయండి',
      call: 'కాల్ చేయండి',
      heroImgAlt: (c) => `ఆశా జ్యోతిలో ${c.name} ప్రాక్టికల్ శిక్షణ`,
      about: (c) => `${esc(c.name)} కోర్సు గురించి`,
      learn: 'మీరు ఏం నేర్చుకుంటారు',
      jobs: 'ఈ కోర్సు తర్వాత ఉద్యోగాలు',
      faqHeading: 'తరచుగా అడిగే ప్రశ్నలు',
      whereToStudy: 'ఎక్కడ చదవవచ్చు',
      sendEnquiry: 'ఎంక్వైరీ పంపండి',
      related: 'సంబంధిత కోర్సులు',
      faqs: (c) => [
        { q: `${c.name} కోర్సులో ఎవరు చేరవచ్చు?`,
          a: `${c.eligibility}.` },
        { q: `${c.name} కోర్సు ఎంత కాలం?`,
          a: `${c.duration}. తరగతులు ప్రాక్టికల్‌గా ఉంటాయి, ఎక్కువ సమయం ల్యాబ్‌లో సాధనకే.` },
        { q: `${c.name} కోర్సు ఫీజు ఎంత?`,
          a: 'ఫీజు సబ్సిడీతో ఉంటుంది. ఆశా జ్యోతి లాభాపేక్ష లేని శిక్షణ కేంద్రం, కాబట్టి ప్రతి విద్యార్థికీ అందుబాటులో ఉండేలా ఫీజు తక్కువగా ఉంచుతాం. ప్రస్తుత ఫీజు, బ్యాచ్ సమయాల కోసం మీకు దగ్గరలోని క్యాంపస్‌కు కాల్ చేయండి.' },
        { q: `${c.name} కోర్సు తర్వాత ఏ ఉద్యోగాలు వస్తాయి?`,
          a: `${c.careers.join('; ')}.` },
        { q: `${c.name} కోర్సు ఎక్కడ చేయవచ్చు?`,
          a: 'ఆశా జ్యోతికి మూడు క్యాంపస్‌లు ఉన్నాయి: అల్వాల్ (సికింద్రాబాద్, 80196 80291), మేడ్చల్ (77803 46642), చేగుంట (99498 09263). తదుపరి బ్యాచ్ ఎప్పుడు మొదలవుతుందో తెలుసుకోవడానికి మీకు దగ్గరలోని క్యాంపస్‌కు కాల్ చేయండి.' }
      ]
    }
  }
};

/* ---------- Paths & shared bits ---------- */

const coursePath = (c) => `courses/${c.id}.html`;
const courseUrl = (L, c) => `${SITE}/${L.dir}${coursePath(c)}`;
const homeUrl = (L) => `${SITE}/${L.dir}`;

function alternateLinks(enUrl, teUrl) {
  return `<link rel="alternate" hreflang="en-IN" href="${enUrl}">
  <link rel="alternate" hreflang="te-IN" href="${teUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">`;
}

function langSwitch(L, href) {
  const to = L.switchTo;
  return `<a href="${href}" class="lang-switch" lang="${to.lang}" hreflang="${to.lang}" aria-label="${to.aria}"><i class="fa-solid fa-language" aria-hidden="true"></i><span>${to.label}</span></a>`;
}

/* ---------- Course card (mirror of renderCourses() in js/catalogue.js) ---------- */

function courseCard(L, course) {
  return `
        <article class="course-card" data-course-id="${esc(course.id)}">
          <div class="card-media">
            <img src="${L.dir ? '../' : ''}${esc(course.image)}"
                 alt="${esc(L.card.imgAlt(course))}"
                 width="400"
                 height="240"
                 loading="lazy"
                 class="card-img">
            <span class="card-badge">${esc(course.categoryLabel || course.category)}</span>
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
                ${esc(course.badge || L.card.certified)}
              </span>
            </div>
          </div>
          <div class="card-footer">
            <button type="button"
                    class="btn btn-outline btn-sm js-view-details"
                    data-course-id="${esc(course.id)}"
                    aria-haspopup="dialog">
              ${L.card.viewDetails}
            </button>
            <button type="button"
                    class="btn btn-primary btn-sm js-enquire-course"
                    data-course-id="${esc(course.id)}">
              ${L.card.enquire}
            </button>
          </div>
        </article>`;
}

/* ---------- Course page ---------- */

function header(L, root, switchHref) {
  return `
  <header class="site-header" role="banner">
    <div class="container header-container">
      <a href="../index.html" class="brand-link" aria-label="${L.homeAria}">
        <img src="${root}assets/logo/asha-jyothi-logo.png"
             alt="${L.logoAlt}"
             width="280" height="56"
             class="brand-logo-img">
      </a>

      ${langSwitch(L, switchHref)}

      <button type="button" class="nav-toggle" aria-controls="primary-nav-menu" aria-expanded="false" aria-label="${L.navToggle}">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>

      <nav id="primary-nav-menu" class="nav-menu" role="navigation" aria-label="${L.navAria}">
        <ul class="nav-list">
          <li><a href="../index.html#home"          class="nav-link"><i class="fa-solid fa-house nav-link-icon" aria-hidden="true"></i><span>${L.nav.home}</span></a></li>
          <li><a href="../index.html#courses"       class="nav-link is-active"><i class="fa-solid fa-graduation-cap nav-link-icon" aria-hidden="true"></i><span>${L.nav.courses}</span></a></li>
          <li><a href="${root}programs.html"            class="nav-link"><i class="fa-solid fa-children nav-link-icon" aria-hidden="true"></i><span>${L.nav.kids}</span></a></li>
          <li><a href="../index.html#history"       class="nav-link"><i class="fa-solid fa-book-open nav-link-icon" aria-hidden="true"></i><span>${L.nav.story}</span></a></li>
          <li><a href="../index.html#faq"           class="nav-link"><i class="fa-solid fa-circle-question nav-link-icon" aria-hidden="true"></i><span>${L.nav.faq}</span></a></li>
          <li><a href="../index.html#locations"     class="nav-link"><i class="fa-solid fa-location-dot nav-link-icon" aria-hidden="true"></i><span>${L.nav.locations}</span></a></li>
          <li><a href="../index.html#contact"       class="nav-link"><i class="fa-solid fa-phone nav-link-icon" aria-hidden="true"></i><span>${L.nav.contact}</span></a></li>
        </ul>
        <div class="header-cta">
          <a href="../index.html#enquiry" class="btn btn-primary btn-sm btn-block-mobile">
            <i class="fa-solid fa-paper-plane" style="font-size:13px; margin-right:4px"></i> ${L.enquireNow}
          </a>
        </div>
        <div class="mobile-nav-helpline">
          <span class="mobile-helpline-label">${L.hotline}</span>
          <a href="tel:8019680291" class="mobile-helpline-phone"><i class="fa-solid fa-phone-volume"></i> 80196 80291</a>
        </div>
      </nav>
    </div>
  </header>`;
}

function footer(L, root) {
  const F = L.footer;
  const popular = L.courses.filter((c) => POPULAR_IDS.includes(c.id));
  return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">

        <div>
          <div class="footer-brand-title">${F.title}</div>
          <div class="footer-brand-subtitle">${F.subtitle}</div>
          <p class="footer-desc">
            ${F.desc}
          </p>
          <p class="footer-desc">
            <strong style="color:#e2e8f0;">${F.recognitionLabel}</strong> ${F.recognition}
          </p>
        </div>

        <div>
          <h4 class="footer-heading">${F.quickNav}</h4>
          <ul class="footer-links-list">
            <li><a href="../index.html#home"      class="footer-link">${L.nav.home}</a></li>
            <li><a href="../index.html#courses"   class="footer-link">${F.catalogue}</a></li>
            <li><a href="${root}programs.html"        class="footer-link">${L.nav.kids}</a></li>
            <li><a href="../index.html#faq"       class="footer-link">${L.nav.faq}</a></li>
            <li><a href="../index.html#locations" class="footer-link">${F.campusesLink}</a></li>
            <li><a href="../index.html#enquiry"   class="footer-link">${F.enquiry}</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">${F.popular}</h4>
          <ul class="footer-links-list">
${popular.map((c) => `            <li><a href="${c.id}.html" class="footer-link">${esc(c.name)}</a></li>`).join('\n')}
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">${F.contact}</h4>
          <div class="footer-campus-info">
${L.campuses.map((cp) => `            <div class="footer-campus-block">
              <span class="footer-campus-name">${cp.name}:</span><br>
              <a href="tel:${cp.phone}" class="footer-campus-num">+91 ${cp.phone.slice(0, 5)} ${cp.phone.slice(5)}</a>
            </div>`).join('\n')}
            <div class="footer-campus-block">
              <span class="footer-campus-name">${F.email}:</span><br>
              <a href="mailto:info@ashajyothi.org.in" class="footer-campus-num">info@ashajyothi.org.in</a>
            </div>
          </div>
        </div>

      </div>

      <div class="footer-bottom">
        <div>&copy; <span id="current-year">2026</span> ${F.rights}</div>
        <div>${F.tagline}</div>
      </div>
    </div>
  </footer>`;
}

function coursePage(L, c) {
  const P = L.page;
  const root = L.dir ? '../../' : '../';       // from the course page back to the site root
  const switchHref = L.dir ? `../../${coursePath(c)}` : `../te/${coursePath(c)}`;
  const title = P.title(c);
  const faqs = P.faqs(c);
  const related = L.courses.filter((o) => o.category === c.category && o.id !== c.id);
  const enquireHref = `../index.html?course=${encodeURIComponent(c.id)}#enquiry`;
  const url = courseUrl(L, c);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${url}#course`,
        name: P.courseName(c),
        description: c.fullDescription,
        url,
        inLanguage: L.code,
        image: `${SITE}/${c.image}`,
        coursePrerequisites: c.eligibility,
        teaches: c.keyTopics,
        educationalCredentialAwarded: P.credential,
        provider: { '@type': 'EducationalOrganization', '@id': ORG_ID, name: 'Asha Jyothi Employable Skill Training Centre', url: `${SITE}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: P.breadcrumbHome, item: homeUrl(L) },
          { '@type': 'ListItem', position: 2, name: P.breadcrumbCourses, item: `${homeUrl(L)}#courses` },
          { '@type': 'ListItem', position: 3, name: c.name, item: url }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }
    ]
  };

  return `<!DOCTYPE html>
<!-- Generated by tools/build.mjs from js/data.js${L.dir ? ' and js/data.te.js' : ''}. Do not edit by hand. -->
<html lang="${L.code}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(P.metaDescription(c))}">
  <meta name="theme-color" content="#10194F">
  <link rel="canonical" href="${url}">
  ${alternateLinks(courseUrl(LANG.en, c), courseUrl(LANG.te, c))}

  <link rel="icon" href="${root}favicon.ico" sizes="any">
  <link rel="icon" href="${root}assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${root}assets/icons/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${L.siteName}">
  <meta property="og:locale" content="${L.ogLocale}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(c.shortDescription)}">
  <meta property="og:image" content="${SITE}/assets/images/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${L.fonts}&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="${root}css/style.css">

  ${jsonLd(ld)}
</head>
<body id="top">

  <a href="#main-content" class="skip-link">${L.skipLink}</a>
${header(L, root, switchHref)}

  <main id="main-content">

    <section class="cp-hero" aria-labelledby="course-heading">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><a href="../index.html">${P.breadcrumbHome}</a></li>
            <li><a href="../index.html#courses">${P.breadcrumbCourses}</a></li>
            <li aria-current="page">${esc(c.name)}</li>
          </ol>
        </nav>

        <div class="cp-hero-grid">
          <div>
            <span class="section-eyebrow">${esc(c.categoryLabel || c.category)}</span>
            <h1 id="course-heading" class="cp-title">${P.h1(c)}</h1>
            <p class="hero-description">${esc(c.shortDescription)}</p>

            <dl class="cp-facts">
              <div><dt>${P.factDuration}</dt><dd>${esc(c.duration)}</dd></div>
              <div><dt>${P.factEligibility}</dt><dd>${esc(c.eligibility)}</dd></div>
              <div><dt>${P.factFee}</dt><dd>${P.factFeeValue}</dd></div>
              <div><dt>${P.factTraining}</dt><dd>${P.factTrainingValue}</dd></div>
            </dl>

            <div class="hero-actions">
              <a href="${enquireHref}" class="btn btn-primary btn-lg">${P.enquireCourse}</a>
              <a href="tel:8019680291" class="btn btn-outline btn-lg"><i class="fa-solid fa-phone" style="margin-right:6px"></i>${P.call} 80196 80291</a>
            </div>
          </div>

          <img src="${root}${esc(c.image)}"
               alt="${esc(P.heroImgAlt(c))}"
               width="600" height="400"
               fetchpriority="high"
               class="cp-hero-img">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container cp-layout">

        <div class="cp-main">
          <h2 class="cp-heading">${P.about(c)}</h2>
          <p class="cp-text">${esc(c.fullDescription)}</p>

          <h2 class="cp-heading">${P.learn}</h2>
          <ul class="modal-topics-list">
${c.keyTopics.map((t) => `            <li>${CHECK_SVG}<span>${esc(t)}</span></li>`).join('\n')}
          </ul>

          <h2 class="cp-heading">${P.jobs}</h2>
          <ul class="modal-topics-list">
${c.careers.map((t) => `            <li><i class="fa-solid fa-briefcase cp-list-icon" aria-hidden="true"></i><span>${esc(t)}</span></li>`).join('\n')}
          </ul>

          <h2 class="cp-heading">${P.faqHeading}</h2>
          <div class="faq-list">
${faqs.map((f) => `            <details class="faq-item">
              <summary class="faq-question">${esc(f.q)}</summary>
              <p class="faq-answer">${esc(f.a)}</p>
            </details>`).join('\n')}
          </div>
        </div>

        <aside class="cp-aside">
          <div class="cp-card">
            <h2 class="cp-card-title">${P.whereToStudy}</h2>
            <ul class="cp-campus-list">
${L.campuses.map((cp) => `              <li>
                <strong>${cp.name}</strong>
                <span>${esc(cp.address)}</span>
                <a href="tel:${cp.phone}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${cp.phone}</a>
              </li>`).join('\n')}
            </ul>
            <a href="${enquireHref}" class="btn btn-primary btn-block">${P.sendEnquiry}</a>
          </div>

          ${related.length ? `<div class="cp-card">
            <h2 class="cp-card-title">${P.related}</h2>
            <ul class="cp-related-list">
${related.map((o) => `              <li><a href="${o.id}.html">${esc(o.name)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></li>`).join('\n')}
            </ul>
          </div>` : ''}
        </aside>

      </div>
    </section>

  </main>
${footer(L, root)}

  <button type="button" id="back-to-top" class="back-to-top" aria-label="${L.backToTop}">
    <i class="fa-solid fa-chevron-up"></i>
  </button>

  <script src="${root}js/navigation.js" defer></script>
  <script src="${root}js/app.js" defer></script>
</body>
</html>
`;
}

/* ---------- Write everything ---------- */

function replaceBetween(src, file, name, content) {
  const re = new RegExp(`(<!-- BUILD:${name} -->)[\\s\\S]*?(\\s*<!-- /BUILD:${name} -->)`);
  if (!re.test(src)) throw new Error(`Marker BUILD:${name} not found in ${file}`);
  return src.replace(re, (_match, open, close) => `${open}${content}${close}`);
}

const urls = [];

for (const L of Object.values(LANG)) {
  fs.mkdirSync(path.join(ROOT, L.dir, 'courses'), { recursive: true });
  for (const c of L.courses) {
    fs.writeFileSync(path.join(ROOT, L.dir, coursePath(c)), coursePage(L, c));
  }

  const indexFile = path.join(L.dir, 'index.html');
  let index = fs.readFileSync(path.join(ROOT, indexFile), 'utf8');
  index = replaceBetween(index, indexFile, 'course-cards', L.courses.map((c) => courseCard(L, c)).join(''));
  index = replaceBetween(index, indexFile, 'course-list-ld', '\n  ' + jsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: L.itemListName,
    itemListElement: L.courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: courseUrl(L, c), name: L.page.courseName(c) }))
  }));
  index = replaceBetween(index, indexFile, 'popular-courses', '\n' + L.courses
    .filter((c) => POPULAR_IDS.includes(c.id))
    .map((c) => `            <li><a href="${coursePath(c)}" class="footer-link">${esc(c.name)}</a></li>`)
    .join('\n'));
  fs.writeFileSync(path.join(ROOT, indexFile), index);

  urls.push(homeUrl(L));
  if (L.code === 'en') urls.push(`${SITE}/programs.html`);
  urls.push(...L.courses.map((c) => courseUrl(L, c)));
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${Object.values(LANG).map((L) => `${L.courses.length} ${L.code} course pages`).join(' + ')}, updated both home pages and sitemap.xml (${urls.length} URLs).`);

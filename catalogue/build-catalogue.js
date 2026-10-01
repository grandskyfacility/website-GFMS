/**
 * GrandSky Facility & Management Services LLP — Company Catalogue
 * Generates a print-ready, client-facing A4 PDF (10 pages).
 *
 * To regenerate after editing content or contact details:
 *     npm i --no-save pdfkit
 *     node catalogue/build-catalogue.js
 *
 * Fonts in catalogue/fonts/ are the SIL Open Font Licence versions of
 * Cormorant Garamond and DM Sans, subset from Google Fonts. The brand
 * logo is read from images/logo.png; logo-white.png is the same mark
 * rendered in solid white for the dark cover pages.
 *
 * The build ends with a layout audit that fails loudly if any text is
 * drawn outside the printable area.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const F = (n) => path.join(__dirname, 'fonts', n);
const OUT = path.join(__dirname, 'GrandSky-Company-Catalogue.pdf');

/* ------------------------------------------------------------------ theme */
const C = {
  navy: '#1A2D5A',
  navyDark: '#111E3D',
  navyLight: '#233672',
  sky: '#2E7FC1',
  teal: '#3AAA8F',
  green: '#7AB648',
  white: '#FFFFFF',
  offWhite: '#F4F7FB',
  lightGray: '#E8EEF6',
  body: '#3D4F6E',
  muted: '#6B7FA0',
  whiteDim: '#C9D6EA',
};

const A4 = { w: 595.28, h: 841.89 };
const M = 54;                       // page margin
const CW = A4.w - M * 2;            // content width

const LOGO = path.join(__dirname, '..', 'images', 'logo.png');
const LOGO_WHITE = path.join(__dirname, 'logo-white.png');

/* ---------------------------------------------------------------- content */
const COMPANY = 'GrandSky Facility & Management Services LLP';
const WEBSITE = 'grandskyfacility.com';

const STATS = [
  { n: '200+', l: 'Facilities managed' },
  { n: '8', l: 'Service verticals' },
  { n: '500+', l: 'Professionals on roster' },
  { n: '24/7', l: 'Emergency support' },
  { n: '98%', l: 'Client retention' },
  { n: '1 hr', l: 'Emergency response' },
];

const SERVICES = [
  {
    t: 'Security Guarding', c: C.navy,
    d: 'Professional on-site security with trained, licensed guards providing round-the-clock protection for your facility — trained in conflict resolution, first aid and emergency response.',
    f: ['24/7 on-site security personnel', 'Trained and licensed security guards', 'Rapid incident response protocols', 'Visitor management and access control', 'Regular patrolling and reporting'],
  },
  {
    t: 'Manpower Services', c: C.sky,
    d: 'Trained, background-verified manpower deployed, supervised and paid for by us — housekeeping, technicians, electricians, pantry staff and front-desk teams matched to your headcount needs.',
    f: ['Skilled, semi-skilled and unskilled staffing', 'Background verification and police checks', 'Statutory compliance (PF, ESI, minimum wages)', 'Payroll, attendance and shift management', 'On-site supervision and quick replacements'],
  },
  {
    t: 'Surveillance & Security Systems', c: C.teal,
    d: 'Advanced CCTV, access control and real-time monitoring providing complete visibility for your premises. We design, install and maintain surveillance systems tailored to your layout and risk profile.',
    f: ['HD CCTV installation and monitoring', 'Access control (biometric, card)', 'Remote monitoring and alerts', 'Intrusion detection systems', 'Video analytics and reporting'],
  },
  {
    t: 'Battery & UPS Solutions', c: C.sky,
    d: 'Reliable power backup ensuring 99.9% uptime for critical operations. We supply, install and maintain UPS systems and battery banks sized to your actual load requirements.',
    f: ['UPS installation and commissioning', 'Battery bank design and supply', 'AMC and preventive maintenance', 'Emergency battery replacement', 'Load testing and health reports'],
  },
  {
    t: 'Air Conditioning Maintenance', c: C.green,
    d: 'Professional HVAC installation, servicing and repair with 365-day availability across split ACs, central air systems, chillers and VRF — for every facility type we manage.',
    f: ['AC installation and commissioning', 'Preventive and corrective maintenance', 'Chiller and VRF system servicing', 'Gas charging and leak detection', 'Energy efficiency optimisation'],
  },
  {
    t: 'MEP Maintenance', c: C.navy,
    d: 'Comprehensive mechanical, electrical and plumbing maintenance that keeps buildings running seamlessly. Our certified engineers handle every MEP discipline under one accountable roof.',
    f: ['Electrical systems maintenance', 'Plumbing and drainage services', 'Fire fighting systems', 'Lifts and escalators', 'Scheduled and emergency repairs'],
  },
  {
    t: 'Vendor Management', c: C.teal,
    d: 'Strategic vendor coordination and contract management that reduces cost, protects quality and simplifies your supply chain — including onboarding, performance tracking and compliance.',
    f: ['Vendor sourcing and onboarding', 'Contract negotiation and management', 'Performance monitoring and KPIs', 'Compliance and documentation', 'Cost optimisation strategies'],
  },
  {
    t: 'Solar Power Solutions', c: C.green,
    d: 'Clean energy installation and maintenance delivering 40–60% lower energy costs, from rooftop to ground-mounted, on-grid, off-grid and hybrid configurations.',
    f: ['Rooftop and ground-mounted solar', 'On-grid, off-grid and hybrid systems', 'Net metering and subsidy assistance', 'Solar panel cleaning and AMC', 'Energy generation monitoring'],
  },
];

const SECTORS = [
  'Corporate Offices', 'Hospitals & Healthcare', 'Industrial Plants', 'Educational Institutions',
  'Commercial Complexes', 'Residential Societies', 'Hotels & Hospitality', 'Warehouses & Logistics',
];

const WHY = [
  ['Proven track record', '5+ years managing diverse facilities across multiple industries with consistently high satisfaction.'],
  ['24/7 emergency support', 'Round-the-clock dedicated support with certified professionals and a one-hour response target.'],
  ['Advanced technology', 'Real-time monitoring, data analytics and smart systems that keep your facility running smoothly.'],
  ['Integrated solutions', 'Seamless coordination across every facility function from a single, accountable partner.'],
  ['Sustainability focus', 'Eco-friendly practices and renewable energy that reduce your carbon footprint and costs.'],
  ['Scalable and flexible', 'Solutions that scale from a single building to enterprise-wide, adapting as you grow.'],
];

const COMMITMENTS = [
  ['One accountable partner', 'A single contract and a single point of contact across every vertical.'],
  ['1-hour emergency response', 'Standby teams and spare inventory on call 24/7, 365 days a year.'],
  ['Transparent reporting', 'Scheduled audits and clear monthly performance reports with real KPIs.'],
  ['Vetted, licensed and insured', 'Every team member is background-checked, trained and covered.'],
  ['Fixed, itemised pricing', 'Clear scope and pricing agreed upfront — never a surprise add-on.'],
  ['Free site survey first', 'On-site assessment and a tailored proposal, with no obligation.'],
];

const PROCESS = [
  ['01', 'Site Survey & Consultation', 'We visit your facility, assess your requirements and challenges, and define what success looks like for you.'],
  ['02', 'Tailored Plan & Proposal', 'You receive a custom scope, service package and transparent quote designed to your scale and budget.'],
  ['03', 'Deployment & Mobilisation', 'Our trained teams, systems and reporting go live quickly and safely, with a smooth handover from day one.'],
  ['04', 'Monitor & Report', 'Continuous monitoring, scheduled audits and clear performance reporting keep you ahead of problems.'],
];

const CONTACT = {
  phones: ['+91 98100 31191', '+91 99100 31191'],
  emails: ['customer@grandskyfacility.com', 'grandskyfacility@gmail.com'],
  office: 'E516 Greater Kailash 2 Block East,\nGreater Kailash, New Delhi 110048',
  registered: '53-A, S/F Block-A, Keshoram Park,\nBindapur, New Delhi, Delhi 110059',
};

/* ---------------------------------------------------------------- helpers */
const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  bufferPages: true,
  info: {
    Title: 'GrandSky — Company Catalogue',
    Author: COMPANY,
    Subject: 'Integrated Facility Management Services',
    Keywords: 'facility management, security, manpower, MEP, solar, UPS, New Delhi',
    Creator: 'GrandSky Facility & Management Services LLP',
  },
});

doc.registerFont('Head', F('CormorantGaramond-SemiBold.ttf'));
doc.registerFont('HeadBold', F('CormorantGaramond-Bold.ttf'));
doc.registerFont('Body', F('DMSans-Regular.ttf'));
doc.registerFont('BodyMed', F('DMSans-Medium.ttf'));
doc.registerFont('BodyBold', F('DMSans-Bold.ttf'));

/* Layout audit: every draw is checked against the printable area so we never
   ship a PDF with text running off the page. */
const WARNINGS = [];
let currentPageLabel = 'cover';
function audit(kind, x, w, startY, endY) {
  const page = Math.max(doc.page ? doc.page.number : 1, 1);
  if (x < -0.5 || x + w > A4.w + 0.5) {
    WARNINGS.push(`p${page} [${currentPageLabel}] ${kind}: x ${x.toFixed(0)}..${(x + w).toFixed(0)} exceeds 0..${A4.w.toFixed(0)}`);
  }
  if (endY != null && endY > A4.h - 6) {
    WARNINGS.push(`p${page} [${currentPageLabel}] ${kind}: ends y=${endY.toFixed(0)} past page height ${A4.h.toFixed(0)} (text: ${String(kind).slice(0, 40)})`);
  }
  if (startY != null && startY > A4.h - 6) {
    WARNINGS.push(`p${page} [${currentPageLabel}] ${kind}: starts y=${startY.toFixed(0)} past bottom`);
  }
}

/** Draw a text block at an absolute position; returns the y below it. */
function t(str, o) {
  doc.font(o.font || 'Body')
    .fontSize(o.size || 9.5)
    .fillColor(o.color || C.body);
  doc.text(str, o.x, o.y, {
    width: o.w,
    align: o.align || 'left',
    lineGap: o.lh != null ? o.lh : 3,
    characterSpacing: o.cs || 0,
  });
  audit('text "' + String(str).slice(0, 24) + '"', o.x, o.w, o.y, doc.y);
  return doc.y;
}

/** Small uppercase section kicker. */
function kicker(str, x, y, color) {
  return t(str.toUpperCase(), { font: 'BodyBold', size: 8, color: color || C.teal, x, y, w: CW, lh: 0, cs: 1.9 });
}

/** Page title block. Returns the y below it. */
function pageTitle(kick, title, sub, accent) {
  const a = accent || C.teal;
  doc.roundedRect(M, 62, 26, 3, 1.5).fill(a);
  let y = t(kick.toUpperCase(), { font: 'BodyBold', size: 8, color: a, x: M, y: 74, w: CW, lh: 0, cs: 1.9 });
  y = t(title, { font: 'HeadBold', size: 30, color: C.navy, x: M, y: y + 6, w: CW, lh: 0 });
  if (sub) y = t(sub, { font: 'Body', size: 10, color: C.muted, x: M, y: y + 9, w: Math.min(CW, 400), lh: 4 });
  return y + 26;
}

/** Running header + footer for interior pages. */
function chrome(label, pageNo, accent) {
  const a = accent || C.teal;
  doc.image(LOGO, M, 40, { height: 20 });
  t('GrandSky', { font: 'HeadBold', size: 12, color: C.navy, x: M + 44, y: 43, w: 120, lh: 0 });
  t(label.toUpperCase(), { font: 'BodyBold', size: 7.5, color: C.muted, x: M, y: 46, w: CW - 120, align: 'right', lh: 0, cs: 1.6 });

  doc.moveTo(M, A4.h - 46).lineTo(A4.w - M, A4.h - 46).lineWidth(0.6).strokeColor(C.lightGray).stroke();
  t(WEBSITE, { font: 'BodyMed', size: 8, color: C.muted, x: M, y: A4.h - 36, w: 200, lh: 0 });
  t(COMPANY, { font: 'Body', size: 7.5, color: C.muted, x: M + 100, y: A4.h - 36, w: CW - 140, align: 'right', lh: 0 });
  doc.roundedRect(A4.w - M - 18, A4.h - 38, 18, 14, 3).fill(a);
  doc.font('BodyBold').fontSize(7.5).fillColor(C.white)
    .text(String(pageNo), A4.w - M - 18, A4.h - 35, { width: 18, align: 'center', lineGap: 0 });
}

function contentPage(label, pageNo, accent) {
  doc.addPage();
  currentPageLabel = label + ' p' + pageNo;
  doc.rect(0, 0, A4.w, A4.h).fill(C.white);
  chrome(label, pageNo, accent);
}

/** Check-list bullet used across service/commitment blocks. */
function bullet(str, x, y, w, color) {
  doc.circle(x + 2.5, y + 6, 2.2).fill(color || C.teal);
  return t(str, { font: 'Body', size: 9, color: C.body, x: x + 13, y, w: w - 13, lh: 2.6 });
}

/* ------------------------------------------------------------------ page 1 */
function cover() {
  // PDFKit creates page 1 on construction - draw on it rather than adding a
  // blank page in front of the cover.
  doc.rect(0, 0, A4.w, A4.h).fill(C.navy);

  // soft brand orbs for depth
  doc.opacity(0.5).fillColor(C.teal).circle(A4.w - 40, 90, 250).fill();
  doc.opacity(0.35).fillColor(C.sky).circle(60, A4.h - 40, 230).fill();
  doc.opacity(0.22).fillColor(C.green).circle(A4.w - 180, A4.h - 150, 170).fill();
  doc.opacity(1);

  doc.image(LOGO_WHITE, M, 62, { height: 34 });
  t('GRANDSKY', { font: 'HeadBold', size: 17, color: C.white, x: M + 62, y: 66, w: 200, lh: 0, cs: 1.2 });
  t('FACILITY & MANAGEMENT SERVICES LLP', { font: 'BodyBold', size: 6.6, color: C.whiteDim, x: M + 62, y: 85, w: 240, lh: 0, cs: 1.3 });

  // right-aligned meta
  t('COMPANY CATALOGUE', { font: 'BodyBold', size: 7.5, color: C.white, x: M, y: 72, w: CW, align: 'right', lh: 0, cs: 2.2 });
  t('2026', { font: 'Body', size: 7.5, color: C.whiteDim, x: M, y: 84, w: CW, align: 'right', lh: 0, cs: 1.4 });

  doc.moveTo(M, 175).lineTo(A4.w - M, 175).lineWidth(0.8).strokeColor('#2F4A7C').stroke();

  t('INTEGRATED FACILITY MANAGEMENT', { font: 'BodyBold', size: 8.5, color: C.teal, x: M, y: 205, w: CW, lh: 0, cs: 2.4 });
  let y = t('Facilities that run flawlessly, every single day.',
    { font: 'HeadBold', size: 40, color: C.white, x: M, y: 222, w: CW - 20, lh: -2 });
  y = t('Security, manpower, surveillance, MEP, power and solar — delivered by a single, accountable partner that has kept 200+ facilities across India safe, efficient and fully operational since 2021.',
    { font: 'Body', size: 11, color: C.whiteDim, x: M, y: y + 14, w: 372, lh: 5 });

  // stat strip — 3 columns x 2 rows
  const sy = 446;
  const cw = CW / 3;
  STATS.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * cw;
    const yy = sy + row * 68;
    doc.font('HeadBold').fontSize(25).fillColor(C.teal).text(s.n, x, yy, { width: cw - 14, lineGap: 0 });
    t(s.l, { font: 'Body', size: 8.2, color: C.whiteDim, x, y: yy + 28, w: cw - 14, lh: 2 });
  });
  doc.moveTo(M, sy + 142).lineTo(A4.w - M, sy + 142).lineWidth(0.8).strokeColor('#2F4A7C').stroke();

  // contact bar
  const cy = A4.h - 150;
  t('GET IN TOUCH', { font: 'BodyBold', size: 7.5, color: C.teal, x: M, y: cy, w: CW, lh: 0, cs: 2 });
  t(CONTACT.phones.join('   ·   '), { font: 'BodyBold', size: 13, color: C.white, x: M, y: cy + 14, w: CW, lh: 0 });
  t(CONTACT.emails.join('   ·   '), { font: 'Body', size: 9, color: C.whiteDim, x: M, y: cy + 36, w: CW, lh: 0 });
  t(CONTACT.office.replace(/\n/g, ', '), { font: 'Body', size: 9, color: C.whiteDim, x: M, y: cy + 54, w: CW, lh: 0 });

  doc.roundedRect(M, A4.h - 74, CW, 28, 6).fill('#16294F');
  t('WWW.GRANDSKYFACILITY.COM', { font: 'BodyBold', size: 8.5, color: C.white, x: M, y: A4.h - 64, w: CW, align: 'center', lh: 0, cs: 2 });
}

/* ------------------------------------------------------------------ page 2 */
function about() {
  contentPage('About Us', 2, C.teal);
  let y = pageTitle('Who We Are', 'Transforming Facility Management Since 2021',
    null, C.teal);

  const colW = 300;
  let ly = y;
  ly = t('GrandSky Facility & Management Services LLP is a leading provider of integrated facility management solutions dedicated to transforming how organisations operate their buildings and infrastructure.',
    { font: 'Body', size: 10, color: C.body, x: M, y: ly, w: colW, lh: 4.5 });
  ly = t('With 5+ years of industry experience we have become the trusted partner for 200+ facilities across diverse sectors — from commercial complexes and hospitals to industrial plants and educational institutions.',
    { font: 'Body', size: 10, color: C.body, x: M, y: ly + 12, w: colW, lh: 4.5 });
  ly = t('We combine technical expertise, professional staff and cutting-edge systems to deliver solutions that optimise efficiency, reduce operational cost and improve the experience of everyone who uses your facility.',
    { font: 'Body', size: 10, color: C.body, x: M, y: ly + 12, w: colW, lh: 4.5 });

  // highlight list
  const hx = M + colW + 30;
  const hw = CW - colW - 30;
  doc.roundedRect(hx, y, hw, 196, 10).fill(C.offWhite);
  let hy = t('AT A GLANCE', { font: 'BodyBold', size: 7.5, color: C.teal, x: hx + 20, y: y + 20, w: hw - 40, lh: 0, cs: 1.9 });
  [
    ['Founded', '2021, New Delhi'],
    ['Facilities managed', '200+ across India'],
    ['Service verticals', '8 integrated services'],
    ['Team', '500+ trained professionals'],
    ['Coverage', 'Delhi NCR & pan-India'],
  ].forEach((r) => {
    doc.moveTo(hx + 20, hy - 3).lineTo(hx + hw - 20, hy - 3).lineWidth(0.5).strokeColor(C.lightGray).stroke();
    hy += 8;
    t(r[0], { font: 'Body', size: 8.5, color: C.muted, x: hx + 20, y: hy, w: hw - 40, lh: 0 });
    t(r[1], { font: 'BodyBold', size: 9, color: C.navy, x: hx + 20, y: hy, w: hw - 40, align: 'right', lh: 0 });
    hy += 20;
  });

  // mission / vision / values
  const my = Math.max(ly, y + 196) + 34;
  t('OUR FOUNDATION', { font: 'BodyBold', size: 8, color: C.teal, x: M, y: my, w: CW, lh: 0, cs: 1.9 });

  const boxes = [
    [C.navy, 'Our Mission', 'To deliver integrated, sustainable and scalable facility management solutions that optimise operational performance and create exceptional value for our clients.'],
    [C.teal, 'Our Vision', 'To be the most trusted and innovative facility management partner in India, recognised for excellence, reliability and transformative solutions.'],
    [C.green, 'Our Values', 'Excellence, sustainability, partnership and integrity guide every decision we make — built on honest communication and consistent delivery.'],
  ];
  const bw = (CW - 24) / 3;
  boxes.forEach((b, i) => {
    const x = M + i * (bw + 12);
    const by = my + 16;
    doc.roundedRect(x, by, bw, 148, 10).fill(C.offWhite);
    doc.roundedRect(x, by, bw, 3, 1.5).fill(b[0]);
    doc.font('HeadBold').fontSize(15).fillColor(C.navy).text(b[1], x + 18, by + 20, { width: bw - 36, lineGap: 0 });
    t(b[2], { font: 'Body', size: 8.8, color: C.body, x: x + 18, y: by + 46, w: bw - 36, lh: 3.4 });
  });
}

/* ------------------------------------------------------------------ page 3 */
function servicesOverview() {
  contentPage('Services', 3, C.sky);
  let y = pageTitle('What We Offer', 'Eight Services, One Accountable Partner',
    'Engage a single service or combine several verticals under one contract. Either way, you get one point of contact who owns the outcome.', C.sky);

  const cw = (CW - 16) / 2;
  const ch = 112;
  SERVICES.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 16);
    const cy = y + row * (ch + 12);

    doc.roundedRect(x, cy, cw, ch, 10).fill(C.white);
    doc.roundedRect(x, cy, cw, ch, 10).lineWidth(0.8).strokeColor(C.lightGray).stroke();
    doc.roundedRect(x, cy, cw, 3, 1.5).fill(s.c);

    doc.roundedRect(x + 20, cy + 22, 24, 24, 6).fill(s.c);
    doc.font('BodyBold').fontSize(9).fillColor(C.white)
      .text(String(i + 1).padStart(2, '0'), x + 20, cy + 29, { width: 24, align: 'center', lineGap: 0 });

    t(s.t, { font: 'HeadBold', size: 14.5, color: C.navy, x: x + 54, y: cy + 26, w: cw - 74, lh: 0 });
    t(s.d.split('.')[0] + '.', { font: 'Body', size: 8.6, color: C.muted, x: x + 20, y: cy + 58, w: cw - 40, lh: 3.2 });
  });

  const ny = y + 4 * (ch + 12) + 12;
  doc.roundedRect(M, ny, CW, 44, 8).fill(C.offWhite);
  doc.roundedRect(M, ny, 3, 44, 1.5).fill(C.sky);
  t('Every engagement begins with a free site survey and a tailored, itemised proposal — with no obligation to proceed.',
    { font: 'BodyMed', size: 9, color: C.navy, x: M + 20, y: ny + 17, w: CW - 40, lh: 0 });
}

/* ------------------------------------------------------- pages 4-7 detail */
function serviceDetail(slice, pageNo, accent) {
  contentPage('Services', pageNo, accent);
  let y = pageTitle('Service Detail', slice.map((s) => s.t).join(' & '), null, accent);

  slice.forEach((s) => {
    const blockH = 232;
    doc.roundedRect(M, y, CW, blockH, 10).fill(C.offWhite);
    doc.roundedRect(M, y, 4, blockH, 2).fill(s.c);

    const pad = 26;
    const leftW = 215;
    let ty = y + 26;
    doc.font('HeadBold').fontSize(20).fillColor(C.navy).text(s.t, M + pad, ty, { width: leftW, lineGap: -1 });
    ty = doc.y + 10;
    ty = t(s.d, { font: 'Body', size: 9.2, color: C.body, x: M + pad, y: ty, w: leftW, lh: 3.8 });

    const rx = M + pad + leftW + 24;
    const rw = CW - pad - leftW - 24 - pad;
    let ry = y + 28;
    t('WHAT WE COVER', { font: 'BodyBold', size: 7.2, color: s.c, x: rx, y: ry, w: rw, lh: 0, cs: 1.8 });
    ry += 14;
    s.f.forEach((f) => { ry = bullet(f, rx, ry, rw, s.c) + 9; });

    y += blockH + 18;
  });
}

/* ------------------------------------------------------------------ page 8 */
function sectorsAndWhy() {
  contentPage('Sectors & Strengths', 8, C.green);
  let y = pageTitle('Who We Serve', 'Trusted Across the Facilities That Keep India Running',
    null, C.green);

  // sector chips
  const chipH = 30;
  const perRow = 2;
  const cw = (CW - 12) / perRow;
  SECTORS.forEach((s, i) => {
    const col = i % perRow, row = Math.floor(i / perRow);
    const x = M + col * (cw + 12);
    const cy = y + row * (chipH + 10);
    doc.roundedRect(x, cy, cw, chipH, 15).fill(C.offWhite);
    doc.roundedRect(x, cy, cw, chipH, 15).lineWidth(0.7).strokeColor(C.lightGray).stroke();
    doc.circle(x + 20, cy + chipH / 2, 4).fill([C.teal, C.sky, C.green][i % 3]);
    t(s, { font: 'BodyMed', size: 9.5, color: C.navy, x: x + 34, y: cy + 9, w: cw - 48, lh: 0 });
  });

  y += 4 * (chipH + 10) + 30;

  t('WHY PARTNER WITH US', { font: 'BodyBold', size: 8, color: C.green, x: M, y, w: CW, lh: 0, cs: 1.9 });
  y += 18;

  const bw = (CW - 16) / 2;
  const bh = 96;
  WHY.forEach((w, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (bw + 16);
    const by = y + row * (bh + 12);
    doc.roundedRect(x, by, bw, bh, 9).fill(C.white);
    doc.roundedRect(x, by, bw, bh, 9).lineWidth(0.8).strokeColor(C.lightGray).stroke();
    doc.roundedRect(x + 18, by + 20, 3, 18, 1.5).fill([C.navy, C.sky, C.teal][i % 3]);
    t(w[0], { font: 'BodyBold', size: 10.5, color: C.navy, x: x + 32, y: by + 19, w: bw - 50, lh: 0 });
    t(w[1], { font: 'Body', size: 8.6, color: C.muted, x: x + 32, y: by + 40, w: bw - 50, lh: 3.2 });
  });
}

/* ------------------------------------------------------------------ page 9 */
function commitmentsAndProcess() {
  contentPage('Commitments & Process', 9, C.navy);
  let y = pageTitle('How We Work', 'What You Can Hold Us To',
    'Facility management is a trust business. These are the standards written into your agreement — not just our brochure.', C.navy);

  const cw = (CW - 16) / 2;
  const ch = 74;
  COMMITMENTS.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 16);
    const cy = y + row * (ch + 10);
    doc.roundedRect(x, cy, cw, ch, 9).fill(C.white);
    doc.roundedRect(x, cy, cw, ch, 9).lineWidth(0.8).strokeColor(C.lightGray).stroke();
    doc.circle(x + 26, cy + 26, 10).fill(C.navy);
    doc.circle(x + 26, cy + 26, 10).lineWidth(1.2).strokeColor(C.teal).stroke();
    // drawn checkmark (DM Sans has no glyph for U+2713)
    doc.moveTo(x + 21.5, cy + 26)
      .lineTo(x + 24.8, cy + 29.4)
      .lineTo(x + 31, cy + 22.4)
      .lineWidth(1.5).lineCap('round').lineJoin('round').strokeColor(C.white).stroke();
    t(c[0], { font: 'BodyBold', size: 10, color: C.navy, x: x + 46, y: cy + 16, w: cw - 64, lh: 0 });
    t(c[1], { font: 'Body', size: 8.5, color: C.muted, x: x + 46, y: cy + 33, w: cw - 64, lh: 3 });
  });

  y += 3 * (ch + 10) + 26;
  doc.moveTo(M, y).lineTo(A4.w - M, y).lineWidth(0.6).strokeColor(C.lightGray).stroke();
  y += 22;

  t('ONBOARDED IN FOUR STEPS', { font: 'BodyBold', size: 8, color: C.navy, x: M, y, w: CW, lh: 0, cs: 1.9 });
  y += 20;

  const pw = (CW - 36) / 4;
  PROCESS.forEach((p, i) => {
    const x = M + i * (pw + 12);
    doc.roundedRect(x, y, pw, 150, 9).fill(C.offWhite);
    doc.roundedRect(x, y, pw, 3, 1.5).fill([C.navy, C.sky, C.teal, C.green][i]);
    doc.font('HeadBold').fontSize(22).fillColor(C.lightGray).text(p[0], x + 16, y + 14, { width: pw - 32, lineGap: 0 });
    t(p[1], { font: 'BodyBold', size: 10, color: C.navy, x: x + 16, y: y + 46, w: pw - 32, lh: 2 });
    t(p[2], { font: 'Body', size: 8.3, color: C.muted, x: x + 16, y: y + 74, w: pw - 32, lh: 3 });
  });
}

/* ----------------------------------------------------------------- page 10 */
function backCover() {
  doc.addPage();
  doc.rect(0, 0, A4.w, A4.h).fill(C.navy);
  doc.opacity(0.45).fillColor(C.sky).circle(A4.w - 60, 130, 230).fill();
  doc.opacity(0.35).fillColor(C.teal).circle(70, A4.h - 120, 200).fill();
  doc.opacity(1);

  doc.image(LOGO_WHITE, M, 92, { height: 40 });
  doc.roundedRect(M, 178, 30, 3, 1.5).fill(C.teal);

  let y = t('Ready to transform your facility?',
    { font: 'HeadBold', size: 34, color: C.white, x: M, y: 200, w: CW - 30, lh: -1 });
  y = t('Get a free site assessment and a tailored proposal. Our team responds to every enquiry within 24–48 hours — and to emergencies within the hour.',
    { font: 'Body', size: 10.5, color: C.whiteDim, x: M, y: y + 12, w: 340, lh: 5 });

  // contact columns
  const cols = [
    ['CALL US', CONTACT.phones],
    ['EMAIL US', CONTACT.emails],
    ['OFFICE', [CONTACT.office.replace(/\n/g, ', ')]],
    ['REGISTERED OFFICE', [CONTACT.registered.replace(/\n/g, ', ')]],
  ];
  const cy = y + 44;
  cols.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * ((CW - 20) / 2 + 20);
    const yy = cy + row * 92;
    t(c[0], { font: 'BodyBold', size: 7.2, color: C.teal, x, y: yy, w: (CW - 20) / 2, lh: 0, cs: 1.8 });
    let ty = yy + 14;
    c[1].forEach((line) => {
      ty = t(line, { font: 'BodyMed', size: 9.5, color: C.white, x, y: ty, w: (CW - 20) / 2, lh: 4 }) + 2;
    });
  });

  doc.roundedRect(M, A4.h - 132, CW, 52, 8).fill('#16294F');
  t('WWW.GRANDSKYFACILITY.COM', { font: 'BodyBold', size: 11, color: C.white, x: M, y: A4.h - 116, w: CW, align: 'center', lh: 0, cs: 2.2 });
  t('© 2026 GrandSky Facility & Management Services LLP. All rights reserved.',
    { font: 'Body', size: 7.5, color: C.muted, x: M, y: A4.h - 99, w: CW, align: 'center', lh: 0 });
}

/* -------------------------------------------------------------- assemble */
cover();
about();
servicesOverview();
serviceDetail(SERVICES.slice(0, 2), 4, C.navy);
serviceDetail(SERVICES.slice(2, 4), 5, C.teal);
serviceDetail(SERVICES.slice(4, 6), 6, C.green);
serviceDetail(SERVICES.slice(6, 8), 7, C.sky);
sectorsAndWhy();
commitmentsAndProcess();
backCover();

const range = doc.bufferedPageRange();

const stream = fs.createWriteStream(OUT);
doc.pipe(stream);
doc.end();
stream.on('finish', () => {
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`Catalogue written: ${OUT} (${range.count} pages, ${kb} KB)`);
  if (WARNINGS.length) {
    console.log(`\nLAYOUT WARNINGS (${WARNINGS.length}):`);
    [...new Set(WARNINGS)].forEach((w) => console.log('  ! ' + w));
  } else {
    console.log('Layout audit: clean - nothing runs off the page.');
  }
});

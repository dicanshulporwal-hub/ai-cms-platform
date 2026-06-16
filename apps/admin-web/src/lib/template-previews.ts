/**
 * Static preview HTML for each dummy template.
 * Keyed by template slug for reliable lookup.
 */
export const TEMPLATE_PREVIEWS: Record<string, string> = {
  'government-portal': `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#1a202c">
      <header style="background:linear-gradient(135deg,#1e3a5f,#2c5282);color:#fff;padding:0">
        <div style="display:flex;align-items:center;gap:16px;padding:14px 32px;border-bottom:1px solid rgba(255,255,255,0.1)">
          <div style="width:44px;height:44px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🏛️</div>
          <div style="flex:1">
            <h1 style="margin:0;font-size:18px;font-weight:700;letter-spacing:-0.3px">Government Department Portal</h1>
            <p style="margin:2px 0 0;font-size:12px;opacity:0.75">Ministry of Digital Services &amp; e-Governance</p>
          </div>
          <div style="display:flex;gap:8px">
            <span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer">🔍 Search</span>
            <span style="background:rgba(255,255,255,0.15);padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer">A+ A A-</span>
          </div>
        </div>
        <nav style="padding:0 32px;display:flex;gap:0;background:rgba(0,0,0,0.15)">
          <a style="color:#fff;text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid #63b3ed">Home</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">About Us</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Services</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Documents</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">RTI</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Contact</a>
        </nav>
      </header>
      <main style="padding:0;background:#f7fafc">
        <section style="background:linear-gradient(135deg,#ebf8ff,#bee3f8);padding:48px 32px">
          <div style="max-width:800px">
            <h2 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#1a365d">Welcome to the Official Portal</h2>
            <p style="margin:0 0 24px;color:#2d3748;font-size:15px;line-height:1.6">Access government services, download official documents, and stay updated with the latest circulars and notifications.</p>
            <div style="display:flex;gap:12px">
              <span style="background:#2b6cb0;color:#fff;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">Explore Services</span>
              <span style="background:#fff;color:#2b6cb0;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:600;border:1px solid #2b6cb0;cursor:pointer">View Documents</span>
            </div>
          </div>
        </section>
        <section style="padding:40px 32px;max-width:1100px;margin:0 auto">
          <h3 style="margin:0 0 24px;font-size:18px;font-weight:600;color:#1a365d">Quick Access Services</h3>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
            <div style="background:#fff;border:1px solid #e2e8f0;padding:24px 16px;border-radius:10px;text-align:center;transition:box-shadow 0.2s"><div style="font-size:28px;margin-bottom:10px">📋</div><p style="margin:0;font-size:13px;font-weight:600;color:#2d3748">Certificates</p><p style="margin:4px 0 0;font-size:11px;color:#718096">Apply Online</p></div>
            <div style="background:#fff;border:1px solid #e2e8f0;padding:24px 16px;border-radius:10px;text-align:center"><div style="font-size:28px;margin-bottom:10px">📄</div><p style="margin:0;font-size:13px;font-weight:600;color:#2d3748">Circulars</p><p style="margin:4px 0 0;font-size:11px;color:#718096">Latest Updates</p></div>
            <div style="background:#fff;border:1px solid #e2e8f0;padding:24px 16px;border-radius:10px;text-align:center"><div style="font-size:28px;margin-bottom:10px">📞</div><p style="margin:0;font-size:13px;font-weight:600;color:#2d3748">Helpdesk</p><p style="margin:4px 0 0;font-size:11px;color:#718096">Get Support</p></div>
            <div style="background:#fff;border:1px solid #e2e8f0;padding:24px 16px;border-radius:10px;text-align:center"><div style="font-size:28px;margin-bottom:10px">📊</div><p style="margin:0;font-size:13px;font-weight:600;color:#2d3748">Reports</p><p style="margin:4px 0 0;font-size:11px;color:#718096">Annual Data</p></div>
          </div>
        </section>
        <section style="padding:32px;background:#fff;border-top:1px solid #e2e8f0">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:32px">
            <div><h4 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a365d">📢 Latest Announcements</h4><div style="space-y:8px"><div style="padding:10px 0;border-bottom:1px solid #edf2f7"><p style="margin:0;font-size:13px;color:#2d3748">New digital services portal launched for citizens</p><span style="font-size:11px;color:#a0aec0">28 May 2025</span></div><div style="padding:10px 0;border-bottom:1px solid #edf2f7"><p style="margin:0;font-size:13px;color:#2d3748">Updated guidelines for RTI applications</p><span style="font-size:11px;color:#a0aec0">25 May 2025</span></div></div></div>
            <div><h4 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a365d">📅 Upcoming Events</h4><div><div style="padding:10px 0;border-bottom:1px solid #edf2f7"><p style="margin:0;font-size:13px;color:#2d3748">National Digital Literacy Week</p><span style="font-size:11px;color:#a0aec0">5-11 June 2025</span></div><div style="padding:10px 0;border-bottom:1px solid #edf2f7"><p style="margin:0;font-size:13px;color:#2d3748">Public Consultation on Data Policy</p><span style="font-size:11px;color:#a0aec0">15 June 2025</span></div></div></div>
          </div>
        </section>
      </main>
      <footer style="background:#1a365d;color:#cbd5e0;padding:32px;font-size:12px">
        <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
          <div><p style="font-weight:600;color:#fff;margin:0 0 8px">Contact</p><p style="margin:0;line-height:1.8">Shastri Bhawan, New Delhi<br/>helpdesk@gov.in<br/>1800-111-555</p></div>
          <div><p style="font-weight:600;color:#fff;margin:0 0 8px">Quick Links</p><p style="margin:0;line-height:1.8">RTI Online | Grievances<br/>Tenders | Careers</p></div>
          <div><p style="font-weight:600;color:#fff;margin:0 0 8px">Policies</p><p style="margin:0;line-height:1.8">Privacy Policy<br/>Terms of Use<br/>Accessibility Statement</p></div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;padding-top:16px;text-align:center">© 2025 Government of India. All rights reserved. | Designed as per GIGW Guidelines</div>
      </footer>
    </div>`,

  'corporate-business': `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111827">
      <header style="background:#fff;padding:16px 40px;display:flex;align-items:center;border-bottom:1px solid #f3f4f6">
        <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">Acme<span style="color:#2563eb">Corp</span></h1>
        <nav style="margin-left:auto;display:flex;gap:28px;align-items:center">
          <a style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">About</a>
          <a style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Services</a>
          <a style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Case Studies</a>
          <a style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Team</a>
          <span style="background:#2563eb;color:#fff;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Contact Us</span>
        </nav>
      </header>
      <main>
        <section style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#60a5fa 100%);padding:80px 40px;text-align:center;color:#fff;position:relative;overflow:hidden">
          <div style="position:relative;z-index:1">
            <p style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;font-weight:600">Digital Transformation Partners</p>
            <h2 style="margin:0 0 20px;font-size:42px;font-weight:800;line-height:1.2;letter-spacing:-1px">Innovate. Transform.<br/>Grow.</h2>
            <p style="margin:0 0 32px;font-size:17px;opacity:0.9;max-width:550px;margin-left:auto;margin-right:auto;line-height:1.6">We help forward-thinking businesses achieve their digital transformation goals with cutting-edge technology solutions.</p>
            <div style="display:flex;gap:12px;justify-content:center">
              <span style="background:#fff;color:#1e40af;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer">Get Started</span>
              <span style="background:rgba(255,255,255,0.15);color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.3);cursor:pointer">Watch Demo →</span>
            </div>
          </div>
        </section>
        <section style="padding:64px 40px;max-width:1100px;margin:0 auto">
          <p style="text-align:center;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#2563eb;font-weight:600">What We Do</p>
          <h3 style="text-align:center;margin:0 0 40px;font-size:28px;font-weight:700">Our Services</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
            <div style="padding:32px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;transition:all 0.2s">
              <div style="width:48px;height:48px;background:#dbeafe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px">🚀</div>
              <h4 style="margin:0 0 8px;font-size:16px;font-weight:700">Strategy & Consulting</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6">Data-driven strategies that align technology with your business objectives for measurable growth.</p>
            </div>
            <div style="padding:32px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0">
              <div style="width:48px;height:48px;background:#e0e7ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px">💡</div>
              <h4 style="margin:0 0 8px;font-size:16px;font-weight:700">Product Development</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6">End-to-end product development from ideation to launch with modern tech stacks.</p>
            </div>
            <div style="padding:32px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0">
              <div style="width:48px;height:48px;background:#fef3c7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px">📈</div>
              <h4 style="margin:0 0 8px;font-size:16px;font-weight:700">Growth & Scale</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6">Scalable infrastructure and growth frameworks to take your business to the next level.</p>
            </div>
          </div>
        </section>
        <section style="padding:48px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center">
            <div><p style="margin:0;font-size:32px;font-weight:800;color:#2563eb">150+</p><p style="margin:4px 0 0;font-size:13px;color:#6b7280">Projects Delivered</p></div>
            <div><p style="margin:0;font-size:32px;font-weight:800;color:#2563eb">50+</p><p style="margin:4px 0 0;font-size:13px;color:#6b7280">Enterprise Clients</p></div>
            <div><p style="margin:0;font-size:32px;font-weight:800;color:#2563eb">99%</p><p style="margin:4px 0 0;font-size:13px;color:#6b7280">Client Satisfaction</p></div>
            <div><p style="margin:0;font-size:32px;font-weight:800;color:#2563eb">24/7</p><p style="margin:4px 0 0;font-size:13px;color:#6b7280">Support Available</p></div>
          </div>
        </section>
      </main>
      <footer style="background:#0f172a;color:#94a3b8;padding:40px;font-size:12px">
        <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center">
          <div><p style="margin:0;font-size:16px;font-weight:700;color:#fff">Acme<span style="color:#60a5fa">Corp</span></p><p style="margin:4px 0 0">Transforming businesses since 2015</p></div>
          <div style="display:flex;gap:24px"><a style="color:#94a3b8;text-decoration:none;font-size:13px">Privacy</a><a style="color:#94a3b8;text-decoration:none;font-size:13px">Terms</a><a style="color:#94a3b8;text-decoration:none;font-size:13px">Careers</a></div>
        </div>
        <div style="max-width:1100px;margin:16px auto 0;padding-top:16px;border-top:1px solid #1e293b;text-align:center">© 2025 AcmeCorp Inc. All rights reserved.</div>
      </footer>
    </div>`,

  'blog-magazine': `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#111827">
      <header style="padding:20px 40px;border-bottom:3px solid #111;display:flex;align-items:center">
        <div>
          <h1 style="margin:0;font-size:32px;font-weight:900;letter-spacing:-1.5px;line-height:1">The Daily Digest</h1>
          <p style="margin:4px 0 0;font-size:11px;color:#6b7280;font-family:system-ui;text-transform:uppercase;letter-spacing:1.5px">Independent Journalism Since 2020</p>
        </div>
        <nav style="margin-left:auto;display:flex;gap:24px;align-items:center">
          <a style="color:#111;text-decoration:none;font-size:13px;font-family:system-ui;font-weight:500">Technology</a>
          <a style="color:#111;text-decoration:none;font-size:13px;font-family:system-ui;font-weight:500">Culture</a>
          <a style="color:#111;text-decoration:none;font-size:13px;font-family:system-ui;font-weight:500">Science</a>
          <a style="color:#111;text-decoration:none;font-size:13px;font-family:system-ui;font-weight:500">Opinion</a>
          <a style="color:#111;text-decoration:none;font-size:13px;font-family:system-ui;font-weight:500">Subscribe</a>
          <span style="background:#111;color:#fff;padding:7px 16px;border-radius:6px;font-size:12px;font-family:system-ui;font-weight:600;cursor:pointer">Sign In</span>
        </nav>
      </header>
      <main style="padding:40px;max-width:1000px;margin:0 auto">
        <article style="margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #e5e7eb">
          <div style="display:flex;gap:32px;align-items:flex-start">
            <div style="flex:1">
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#dc2626;font-family:system-ui;font-weight:700">Featured Story</span>
              <h2 style="margin:10px 0 12px;font-size:32px;line-height:1.25;font-weight:700;letter-spacing:-0.5px">The Future of AI in Content Creation and Digital Publishing</h2>
              <p style="color:#4b5563;line-height:1.8;margin:0 0 16px;font-size:16px">Exploring how artificial intelligence is fundamentally reshaping the way we create, curate, and consume digital content in the modern era. From automated writing assistants to personalized content delivery...</p>
              <div style="display:flex;align-items:center;gap:12px;font-family:system-ui">
                <div style="width:32px;height:32px;background:#e5e7eb;border-radius:50%"></div>
                <span style="font-size:13px;font-weight:600;color:#374151">Sarah Mitchell</span>
                <span style="font-size:12px;color:#9ca3af">May 28, 2025 · 8 min read</span>
              </div>
            </div>
            <div style="width:280px;height:180px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:10px;flex-shrink:0"></div>
          </div>
        </article>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:28px">
          <article style="border:1px solid #e5e7eb;padding:24px;border-radius:10px">
            <div style="height:120px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:8px;margin-bottom:16px"></div>
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#2563eb;font-family:system-ui;font-weight:700">Technology</span>
            <h3 style="margin:8px 0;font-size:18px;line-height:1.3;font-weight:700">Web Development Trends Shaping 2025</h3>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 12px">The latest frameworks, tools, and paradigms that are defining modern web development...</p>
            <span style="font-size:11px;color:#9ca3af;font-family:system-ui">May 26, 2025 · 5 min read</span>
          </article>
          <article style="border:1px solid #e5e7eb;padding:24px;border-radius:10px">
            <div style="height:120px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:8px;margin-bottom:16px"></div>
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#059669;font-family:system-ui;font-weight:700">Science</span>
            <h3 style="margin:8px 0;font-size:18px;line-height:1.3;font-weight:700">Quantum Computing: A New Era Begins</h3>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 12px">Breakthrough discoveries are pushing the boundaries of what's computationally possible...</p>
            <span style="font-size:11px;color:#9ca3af;font-family:system-ui">May 24, 2025 · 6 min read</span>
          </article>
        </div>
      </main>
      <footer style="border-top:3px solid #111;padding:32px 40px;font-family:system-ui">
        <div style="max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center">
          <div><p style="margin:0;font-size:18px;font-weight:900;font-family:Georgia;letter-spacing:-0.5px">The Daily Digest</p><p style="margin:4px 0 0;font-size:12px;color:#6b7280">Quality journalism, delivered daily.</p></div>
          <div style="display:flex;gap:20px"><a style="color:#6b7280;text-decoration:none;font-size:13px">About</a><a style="color:#6b7280;text-decoration:none;font-size:13px">Contact</a><a style="color:#6b7280;text-decoration:none;font-size:13px">Privacy</a><a style="color:#6b7280;text-decoration:none;font-size:13px">RSS</a></div>
        </div>
        <p style="max-width:1000px;margin:16px auto 0;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">© 2025 The Daily Digest. All rights reserved.</p>
      </footer>
    </div>`,

  'landing-page-pro': `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111827">
      <header style="padding:14px 40px;display:flex;align-items:center;background:#fff;border-bottom:1px solid #f3f4f6">
        <h1 style="margin:0;font-size:20px;font-weight:800;color:#7c3aed;letter-spacing:-0.5px">⚡ LaunchPad</h1>
        <nav style="margin-left:auto;display:flex;gap:24px;align-items:center">
          <a style="color:#6b7280;text-decoration:none;font-size:13px;font-weight:500">Features</a>
          <a style="color:#6b7280;text-decoration:none;font-size:13px;font-weight:500">Pricing</a>
          <a style="color:#6b7280;text-decoration:none;font-size:13px;font-weight:500">Testimonials</a>
          <a style="color:#6b7280;text-decoration:none;font-size:13px;font-weight:500">Docs</a>
          <span style="background:#7c3aed;color:#fff;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Start Free →</span>
        </nav>
      </header>
      <main>
        <section style="padding:100px 40px 80px;text-align:center;background:linear-gradient(180deg,#faf5ff 0%,#f5f3ff 40%,#fff 100%);position:relative">
          <div style="display:inline-block;background:#f3e8ff;color:#7c3aed;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:20px">🎉 Now in Public Beta — Try it free</div>
          <h2 style="margin:0 0 20px;font-size:48px;font-weight:900;line-height:1.1;letter-spacing:-1.5px;color:#111827">Build Something<br/><span style="background:linear-gradient(135deg,#7c3aed,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Amazing</span></h2>
          <p style="margin:0 0 36px;color:#6b7280;font-size:18px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.6">The all-in-one platform to launch your next big idea. Fast, beautiful, and optimized for conversions from day one.</p>
          <div style="display:flex;gap:12px;justify-content:center">
            <span style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 4px 14px rgba(124,58,237,0.3)">Start Free Trial</span>
            <span style="background:#fff;color:#374151;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid #e5e7eb;cursor:pointer">Watch Demo ▶</span>
          </div>
          <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">No credit card required · Free for 14 days · Cancel anytime</p>
        </section>
        <section style="padding:64px 40px;max-width:1000px;margin:0 auto">
          <p style="text-align:center;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7c3aed;font-weight:700">Features</p>
          <h3 style="text-align:center;margin:0 0 48px;font-size:28px;font-weight:800;letter-spacing:-0.5px">Everything you need to launch</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
            <div style="padding:28px;border-radius:14px;background:#faf5ff;border:1px solid #e9d5ff;text-align:center">
              <div style="width:52px;height:52px;background:#ede9fe;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px">⚡</div>
              <h4 style="margin:0 0 8px;font-size:15px;font-weight:700">Lightning Fast</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5">Sub-second load times with edge deployment and smart caching.</p>
            </div>
            <div style="padding:28px;border-radius:14px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center">
              <div style="width:52px;height:52px;background:#dcfce7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px">🎨</div>
              <h4 style="margin:0 0 8px;font-size:15px;font-weight:700">Beautiful Design</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5">Pixel-perfect responsive layouts that look great on every device.</p>
            </div>
            <div style="padding:28px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;text-align:center">
              <div style="width:52px;height:52px;background:#dbeafe;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px">📊</div>
              <h4 style="margin:0 0 8px;font-size:15px;font-weight:700">Analytics Built-in</h4>
              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5">Track conversions, engagement, and user behavior in real-time.</p>
            </div>
          </div>
        </section>
        <section style="padding:48px 40px;background:#faf5ff;border-top:1px solid #ede9fe;border-bottom:1px solid #ede9fe">
          <div style="max-width:700px;margin:0 auto;text-align:center">
            <p style="font-size:18px;font-style:italic;color:#374151;line-height:1.7;margin:0 0 16px">"LaunchPad helped us go from idea to launch in just 2 weeks. The conversion rate doubled compared to our old site."</p>
            <div style="display:flex;align-items:center;justify-content:center;gap:10px"><div style="width:36px;height:36px;background:#e9d5ff;border-radius:50%"></div><div style="text-align:left"><p style="margin:0;font-size:13px;font-weight:600">Alex Chen</p><p style="margin:0;font-size:11px;color:#6b7280">CEO, TechStart Inc.</p></div></div>
          </div>
        </section>
      </main>
      <footer style="background:#0f172a;color:#94a3b8;padding:32px 40px;font-size:12px;text-align:center">
        <p style="margin:0;font-size:15px;font-weight:700;color:#fff">⚡ LaunchPad</p>
        <p style="margin:8px 0 0">© 2025 LaunchPad. All rights reserved. Built with ❤️ for makers.</p>
      </footer>
    </div>`,

  'education-portal': `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111827">
      <header style="background:linear-gradient(135deg,#064e3b,#065f46);color:#fff;padding:0">
        <div style="display:flex;align-items:center;gap:14px;padding:14px 32px">
          <div style="font-size:32px">🎓</div>
          <div style="flex:1">
            <h1 style="margin:0;font-size:19px;font-weight:700">EduLearn Academy</h1>
            <p style="margin:2px 0 0;font-size:11px;opacity:0.75">Excellence in Education · Est. 1985</p>
          </div>
          <div style="display:flex;gap:8px">
            <span style="background:rgba(255,255,255,0.15);padding:7px 16px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer">Student Portal</span>
            <span style="background:#10b981;padding:7px 16px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">Apply Now</span>
          </div>
        </div>
        <nav style="padding:0 32px;display:flex;gap:0;background:rgba(0,0,0,0.2)">
          <a style="color:#fff;text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid #34d399">Home</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Programs</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Faculty</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Admissions</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Research</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Library</a>
          <a style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:13px;padding:10px 18px;border-bottom:2px solid transparent">Campus Life</a>
        </nav>
      </header>
      <main style="background:#f9fafb">
        <section style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:56px 32px">
          <div style="max-width:700px">
            <h2 style="margin:0 0 14px;color:#064e3b;font-size:32px;font-weight:800;line-height:1.2;letter-spacing:-0.5px">Empowering Minds,<br/>Shaping Futures</h2>
            <p style="color:#374151;margin:0 0 24px;font-size:16px;line-height:1.6">Discover world-class programs designed for the leaders of tomorrow. Join 15,000+ students across 50+ disciplines.</p>
            <div style="display:flex;gap:12px">
              <span style="background:#064e3b;color:#fff;padding:11px 24px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer">Explore Programs</span>
              <span style="background:#fff;color:#064e3b;padding:11px 24px;border-radius:8px;font-weight:600;font-size:13px;border:1px solid #064e3b;cursor:pointer">Virtual Tour</span>
            </div>
          </div>
        </section>
        <section style="padding:48px 32px;max-width:1100px;margin:0 auto">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
            <h3 style="margin:0;font-size:20px;font-weight:700;color:#111827">Popular Programs</h3>
            <a style="color:#059669;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer">View All Programs →</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);padding:28px;text-align:center;font-size:36px">💻</div>
              <div style="padding:16px">
                <h4 style="margin:0 0 4px;font-size:14px;font-weight:700">Computer Science</h4>
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px">B.Tech · 4 Years · Full Time</p>
                <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:#059669;font-weight:600">98% Placement</span><span style="font-size:11px;color:#9ca3af">120 Seats</span></div>
              </div>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);padding:28px;text-align:center;font-size:36px">📐</div>
              <div style="padding:16px">
                <h4 style="margin:0 0 4px;font-size:14px;font-weight:700">Mathematics</h4>
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px">M.Sc · 2 Years · Full Time</p>
                <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:#059669;font-weight:600">Research Focus</span><span style="font-size:11px;color:#9ca3af">60 Seats</span></div>
              </div>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);padding:28px;text-align:center;font-size:36px">🧬</div>
              <div style="padding:16px">
                <h4 style="margin:0 0 4px;font-size:14px;font-weight:700">Biotechnology</h4>
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px">B.Sc · 3 Years · Full Time</p>
                <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:#059669;font-weight:600">Lab Intensive</span><span style="font-size:11px;color:#9ca3af">80 Seats</span></div>
              </div>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#e0e7ff,#c7d2fe);padding:28px;text-align:center;font-size:36px">🎨</div>
              <div style="padding:16px">
                <h4 style="margin:0 0 4px;font-size:14px;font-weight:700">Design & Arts</h4>
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px">BFA · 4 Years · Full Time</p>
                <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:#059669;font-weight:600">Portfolio Based</span><span style="font-size:11px;color:#9ca3af">40 Seats</span></div>
              </div>
            </div>
          </div>
        </section>
        <section style="padding:40px 32px;background:#fff;border-top:1px solid #e5e7eb">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
            <div><p style="margin:0;font-size:28px;font-weight:800;color:#064e3b">15,000+</p><p style="margin:4px 0 0;font-size:12px;color:#6b7280">Students Enrolled</p></div>
            <div><p style="margin:0;font-size:28px;font-weight:800;color:#064e3b">500+</p><p style="margin:4px 0 0;font-size:12px;color:#6b7280">Faculty Members</p></div>
            <div><p style="margin:0;font-size:28px;font-weight:800;color:#064e3b">50+</p><p style="margin:4px 0 0;font-size:12px;color:#6b7280">Programs Offered</p></div>
            <div><p style="margin:0;font-size:28px;font-weight:800;color:#064e3b">A++</p><p style="margin:4px 0 0;font-size:12px;color:#6b7280">NAAC Accreditation</p></div>
          </div>
        </section>
      </main>
      <footer style="background:#064e3b;color:#a7f3d0;padding:32px;font-size:12px">
        <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
          <div><p style="font-weight:700;color:#fff;margin:0 0 8px;font-size:14px">🎓 EduLearn Academy</p><p style="margin:0;line-height:1.8;color:#6ee7b7">University Road, Knowledge City<br/>admissions@edulearn.ac.in<br/>+91 1800-200-300</p></div>
          <div><p style="font-weight:600;color:#fff;margin:0 0 8px">Quick Links</p><p style="margin:0;line-height:1.8;color:#6ee7b7">Admissions | Scholarships<br/>Placements | Alumni<br/>Research | Publications</p></div>
          <div><p style="font-weight:600;color:#fff;margin:0 0 8px">Resources</p><p style="margin:0;line-height:1.8;color:#6ee7b7">Academic Calendar<br/>Examination Portal<br/>Anti-Ragging Cell</p></div>
        </div>
        <div style="max-width:1100px;margin:20px auto 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.15);text-align:center;color:#6ee7b7">© 2025 EduLearn Academy. All rights reserved. | NAAC A++ Accredited</div>
      </footer>
    </div>`,

  'government-design-system': `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#f4f7fb">
      <div style="background:#2c5282;color:#fff;padding:5px 24px;font-size:11px;display:flex;justify-content:space-between;align-items:center">
        <span style="opacity:.75">Skip to main content | Screen Reader Access</span>
        <span style="display:flex;gap:10px;align-items:center"><span style="opacity:.7">A- A A+</span><span style="opacity:.7">◑</span><span style="opacity:.7">🌐 Language</span></span>
      </div>
      <header style="background:#1a3d7c;color:#fff;padding:12px 24px;display:flex;align-items:center;gap:12px">
        <div style="width:42px;height:42px;background:rgba(255,255,255,.15);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🏛</div>
        <div style="flex:1">
          <p style="margin:0;font-size:17px;font-weight:700">Government of India</p>
          <p style="margin:2px 0 0;font-size:11px;opacity:.75">Ministry / Department Name</p>
        </div>
        <div style="display:flex;align-items:center;background:rgba(255,255,255,.12);border-radius:5px;overflow:hidden">
          <span style="padding:6px 10px;font-size:11px;opacity:.7">🔍 Search portal...</span>
        </div>
      </header>
      <nav style="background:#2c5282;color:#fff;padding:0 24px;display:flex;gap:0;font-size:12px">
        <span style="padding:9px 14px;border-bottom:2px solid #2b7ee0;cursor:pointer">Home</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">About</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Services</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Schemes</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Tenders</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Newsroom</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Documents</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">RTI</span>
        <span style="padding:9px 14px;border-bottom:2px solid transparent;opacity:.8;cursor:pointer">Contact</span>
      </nav>
      <main style="max-width:1200px;margin:0 auto;padding:20px 20px">
        <section style="background:linear-gradient(135deg,#1a3d7c,#2b7ee0);color:#fff;border-radius:6px;padding:32px;margin-bottom:18px">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7">CITIZEN SERVICES PORTAL</p>
          <h2 style="margin:0 0 10px;font-size:22px;font-weight:700;line-height:1.3">Accessible, transparent, and citizen-first government services</h2>
          <p style="margin:0 0 16px;font-size:12px;opacity:.85;max-width:500px">Discover schemes, tenders, RTI, documents, and department contacts for all ministries and departments.</p>
          <div style="display:flex;gap:10px">
            <span style="background:#fff;color:#1a3d7c;padding:8px 18px;border-radius:5px;font-weight:600;font-size:12px;cursor:pointer">Explore Services</span>
            <span style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.35);padding:8px 18px;border-radius:5px;font-weight:600;font-size:12px;cursor:pointer">View Documents</span>
          </div>
        </section>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:18px">
          ${['🏛 Schemes','📋 Tenders','📄 Documents','📞 Contacts','📝 Grievance'].map(l=>`<div style="background:#fff;border:1px solid #d2daea;border-top:3px solid #1a3d7c;border-radius:5px;padding:12px 10px;text-align:center;font-size:11px;font-weight:600;color:#1a1a2e;cursor:pointer">${l}</div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:18px">
          <div style="background:#fff;border:1px solid #d2daea;border-radius:5px;padding:14px">
            <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1a3d7c">📢 Announcements</h3>
            ${['Cabinet approves rural development scheme','NITI Aayog digital infrastructure report published','Solar energy tender: Last date extended'].map(t=>`<div style="padding:6px 0;border-bottom:1px solid #eef2f8;font-size:11px;color:#4a5568">${t}</div>`).join('')}
            <a style="display:block;margin-top:8px;font-size:11px;font-weight:600;color:#1a3d7c;text-decoration:none;cursor:pointer">View all →</a>
          </div>
          <div style="background:#fff;border:1px solid #d2daea;border-radius:5px;padding:14px">
            <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1a3d7c">📊 Key Statistics</h3>
            ${[['1,200+','Schemes'],['450','Open Tenders'],['8,000+','Documents']].map(([v,l])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eef2f8"><span style="font-size:10px;color:#4a5568">${l}</span><span style="font-size:14px;font-weight:700;color:#1a3d7c">${v}</span></div>`).join('')}
          </div>
        </div>
        <div style="background:#fff;border:1px solid #d2daea;border-radius:5px;padding:14px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <h3 style="margin:0;font-size:13px;font-weight:700;color:#1a3d7c">🗞️ Newsroom</h3>
            <a style="font-size:11px;font-weight:600;color:#1a3d7c;text-decoration:none;cursor:pointer">View all →</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${['Press release: Budget allocation for rural schemes','Media coverage: Digital India initiative milestones','Photo gallery: Swachh Bharat campaign drives'].map(t=>`<div style="border:1px solid #d2daea;border-radius:5px;padding:10px"><div style="height:50px;background:#e8eef8;border-radius:3px;margin-bottom:7px"></div><p style="margin:0;font-size:11px;font-weight:500;color:#1a1a2e;line-clamp:2">${t}</p></div>`).join('')}
          </div>
        </div>
      </main>
      <footer style="background:#2c5282;color:rgba(255,255,255,.8);padding:16px 24px;margin-top:4px">
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;font-size:10px;max-width:1200px;margin:0 auto 8px">
          ${['Website Policies','Accessibility Statement','Sitemap','Help','Feedback','Contact Us','Terms of Use'].map(l=>`<span style="cursor:pointer;text-decoration:underline;opacity:.7">${l}</span>`).join('')}
        </div>
        <p style="margin:0;font-size:10px;opacity:.55;max-width:1200px;margin:0 auto">© 2026 Government of India · GIGW-readiness aligned · UX4G-compatible layout · Design System v1.0</p>
      </footer>
    </div>`,
};

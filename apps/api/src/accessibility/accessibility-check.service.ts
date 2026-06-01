import { Injectable } from '@nestjs/common';

export interface CheckResult {
  checkKey: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PASS' | 'WARNING' | 'FAIL';
  title: string;
  description: string;
  recommendation: string;
  targetSelector?: string;
  targetField?: string;
}

@Injectable()
export class AccessibilityCheckService {

  checkTemplateHtml(html: string): CheckResult[] {
    const results: CheckResult[] = [];

    // === ACCESSIBILITY CHECKS ===
    results.push(this.checkSkipLink(html));
    results.push(this.checkSemanticHeader(html));
    results.push(this.checkSemanticNav(html));
    results.push(this.checkSemanticMain(html));
    results.push(this.checkSemanticFooter(html));
    results.push(this.checkSingleH1(html));
    results.push(this.checkHeadingOrder(html));
    results.push(this.checkImagesAltText(html));
    results.push(this.checkLangAttribute(html));
    results.push(this.checkViewportMeta(html));
    results.push(this.checkEmptyHeadings(html));
    results.push(this.checkEmptyLinks(html));
    results.push(this.checkFormLabels(html));

    // === UX4G/GIGW READINESS CHECKS ===
    results.push(this.checkContactLink(html));
    results.push(this.checkFeedbackLink(html));
    results.push(this.checkHelpLink(html));
    results.push(this.checkSitemapLink(html));
    results.push(this.checkPolicyLinks(html));
    results.push(this.checkAccessibilityStatement(html));
    results.push(this.checkFooterOwnership(html));

    // === SEO CHECKS ===
    results.push(this.checkMetaTitle(html));
    results.push(this.checkMetaDescription(html));

    // === TEMPLATE SAFETY ===
    results.push(this.checkNoInlineScripts(html));
    results.push(this.checkNoEventHandlers(html));

    return results;
  }

  checkPageContent(page: { title: string; content: string | null; metaTitle: string | null; metaDescription: string | null; featuredImage: string | null }): CheckResult[] {
    const results: CheckResult[] = [];
    const content = page.content || '';

    results.push({
      checkKey: 'page.has_title', category: 'Content', severity: 'HIGH',
      status: page.title?.trim() ? 'PASS' : 'FAIL',
      title: 'Page has title', description: 'Every page must have a title.', recommendation: 'Add a meaningful title to the page.',
    });

    results.push({
      checkKey: 'page.has_content', category: 'Content', severity: 'MEDIUM',
      status: content.trim().length > 50 ? 'PASS' : content.trim() ? 'WARNING' : 'FAIL',
      title: 'Page has content', description: 'Pages should have meaningful content.', recommendation: 'Add substantive content to the page.',
    });

    results.push({
      checkKey: 'page.has_meta_title', category: 'SEO', severity: 'MEDIUM',
      status: page.metaTitle?.trim() ? 'PASS' : 'WARNING',
      title: 'Meta title exists', description: 'Meta title helps with SEO.', recommendation: 'Add a meta title (50-60 characters).',
    });

    results.push({
      checkKey: 'page.has_meta_description', category: 'SEO', severity: 'MEDIUM',
      status: page.metaDescription?.trim() ? 'PASS' : 'WARNING',
      title: 'Meta description exists', description: 'Meta description helps with SEO.', recommendation: 'Add a meta description (120-160 characters).',
    });

    // Check images in content for alt text
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgMatches.filter(img => !img.match(/alt=["'][^"']+["']/i));
    results.push({
      checkKey: 'page.images_have_alt', category: 'Accessibility', severity: 'HIGH',
      status: imgMatches.length === 0 ? 'PASS' : imgsWithoutAlt.length === 0 ? 'PASS' : 'FAIL',
      title: 'Content images have alt text', description: `${imgsWithoutAlt.length} image(s) missing alt text.`, recommendation: 'Add descriptive alt text to all images.',
    });

    // Check heading structure in content
    const headings = content.match(/<h[1-6][^>]*>/gi) || [];
    const hasH1InContent = headings.some(h => h.startsWith('<h1'));
    if (hasH1InContent) {
      results.push({
        checkKey: 'page.no_h1_in_content', category: 'Accessibility', severity: 'MEDIUM',
        status: 'WARNING',
        title: 'H1 in page content', description: 'Page content should not contain H1 (page title is H1).', recommendation: 'Use H2-H6 for content headings.',
      });
    }

    return results;
  }

  // === Individual check methods ===

  private checkSkipLink(html: string): CheckResult {
    const has = /skip[- ]?to[- ]?(main|content)/i.test(html) || /class=["'][^"']*skip/i.test(html);
    return { checkKey: 'a11y.skip_link', category: 'Accessibility', severity: 'HIGH', status: has ? 'PASS' : 'FAIL', title: 'Skip-to-content link', description: 'A skip-to-content link must be the first focusable element.', recommendation: 'Add <a href="#main-content" class="skip-link">Skip to main content</a> as the first element in body.' };
  }

  private checkSemanticHeader(html: string): CheckResult {
    return { checkKey: 'a11y.semantic_header', category: 'Accessibility', severity: 'HIGH', status: /<header[\s>]/i.test(html) ? 'PASS' : 'FAIL', title: 'Semantic <header> element', description: 'Page should use semantic <header> element.', recommendation: 'Wrap the site header in a <header> element.' };
  }

  private checkSemanticNav(html: string): CheckResult {
    return { checkKey: 'a11y.semantic_nav', category: 'Accessibility', severity: 'HIGH', status: /<nav[\s>]/i.test(html) ? 'PASS' : 'FAIL', title: 'Semantic <nav> element', description: 'Page should use semantic <nav> element.', recommendation: 'Wrap navigation in a <nav> element with aria-label.' };
  }

  private checkSemanticMain(html: string): CheckResult {
    return { checkKey: 'a11y.semantic_main', category: 'Accessibility', severity: 'HIGH', status: /<main[\s>]/i.test(html) ? 'PASS' : 'FAIL', title: 'Semantic <main> element', description: 'Page should use semantic <main> element.', recommendation: 'Wrap main content in a <main id="main-content"> element.' };
  }

  private checkSemanticFooter(html: string): CheckResult {
    return { checkKey: 'a11y.semantic_footer', category: 'Accessibility', severity: 'MEDIUM', status: /<footer[\s>]/i.test(html) ? 'PASS' : 'FAIL', title: 'Semantic <footer> element', description: 'Page should use semantic <footer> element.', recommendation: 'Wrap the site footer in a <footer> element.' };
  }

  private checkSingleH1(html: string): CheckResult {
    const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
    return { checkKey: 'a11y.single_h1', category: 'Accessibility', severity: 'MEDIUM', status: h1Count === 1 ? 'PASS' : h1Count === 0 ? 'FAIL' : 'WARNING', title: 'Single H1 heading', description: `Found ${h1Count} H1 heading(s). Page should have exactly one.`, recommendation: 'Ensure each page has exactly one H1 heading.' };
  }

  private checkHeadingOrder(html: string): CheckResult {
    const headings = html.match(/<h([1-6])[\s>]/gi) || [];
    const levels = headings.map(h => parseInt(h.match(/\d/)![0]));
    let ordered = true;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) { ordered = false; break; }
    }
    return { checkKey: 'a11y.heading_order', category: 'Accessibility', severity: 'MEDIUM', status: levels.length === 0 ? 'WARNING' : ordered ? 'PASS' : 'WARNING', title: 'Logical heading order', description: 'Headings should follow a logical order (H1 > H2 > H3).', recommendation: 'Do not skip heading levels (e.g., H1 directly to H3).' };
  }

  private checkImagesAltText(html: string): CheckResult {
    const imgs = html.match(/<img[^>]*>/gi) || [];
    const missing = imgs.filter(img => !img.match(/alt=["'][^"']*["']/i));
    return { checkKey: 'a11y.images_alt', category: 'Accessibility', severity: 'HIGH', status: imgs.length === 0 ? 'PASS' : missing.length === 0 ? 'PASS' : 'FAIL', title: 'Images have alt text', description: `${missing.length} of ${imgs.length} image(s) missing alt attribute.`, recommendation: 'Add descriptive alt text to all <img> elements.' };
  }

  private checkLangAttribute(html: string): CheckResult {
    return { checkKey: 'a11y.lang_attribute', category: 'Accessibility', severity: 'HIGH', status: /<html[^>]*lang=["'][a-z]/i.test(html) ? 'PASS' : 'FAIL', title: 'Language attribute', description: 'HTML element must have a lang attribute.', recommendation: 'Add lang="en" (or appropriate language) to the <html> element.' };
  }

  private checkViewportMeta(html: string): CheckResult {
    return { checkKey: 'a11y.viewport_meta', category: 'Accessibility', severity: 'HIGH', status: /meta[^>]*viewport/i.test(html) ? 'PASS' : 'FAIL', title: 'Responsive viewport meta', description: 'Page must have a responsive viewport meta tag.', recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.' };
  }

  private checkEmptyHeadings(html: string): CheckResult {
    const emptyH = (html.match(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi) || []).length;
    return { checkKey: 'a11y.empty_headings', category: 'Accessibility', severity: 'MEDIUM', status: emptyH === 0 ? 'PASS' : 'FAIL', title: 'No empty headings', description: `${emptyH} empty heading(s) found.`, recommendation: 'Remove or add content to empty heading elements.' };
  }

  private checkEmptyLinks(html: string): CheckResult {
    const emptyLinks = (html.match(/<a[^>]*>\s*<\/a>/gi) || []).length;
    return { checkKey: 'a11y.empty_links', category: 'Accessibility', severity: 'MEDIUM', status: emptyLinks === 0 ? 'PASS' : 'WARNING', title: 'No empty links', description: `${emptyLinks} empty link(s) found.`, recommendation: 'Add meaningful text or aria-label to all links.' };
  }

  private checkFormLabels(html: string): CheckResult {
    const inputs = (html.match(/<input[^>]*>/gi) || []).filter(i => !/type=["'](hidden|submit|button)["']/i.test(i));
    const labels = (html.match(/<label[^>]*>/gi) || []).length;
    return { checkKey: 'a11y.form_labels', category: 'Accessibility', severity: 'HIGH', status: inputs.length === 0 ? 'PASS' : labels >= inputs.length ? 'PASS' : 'WARNING', title: 'Form inputs have labels', description: `${inputs.length} input(s), ${labels} label(s) found.`, recommendation: 'Ensure every form input has an associated <label>.' };
  }

  private checkContactLink(html: string): CheckResult {
    return { checkKey: 'gigw.contact_link', category: 'GIGW Readiness', severity: 'MEDIUM', status: /contact/i.test(html) ? 'PASS' : 'FAIL', title: 'Contact link exists', description: 'GIGW requires a contact/feedback link.', recommendation: 'Add a Contact Us link in the footer or navigation.' };
  }

  private checkFeedbackLink(html: string): CheckResult {
    return { checkKey: 'gigw.feedback_link', category: 'GIGW Readiness', severity: 'LOW', status: /feedback/i.test(html) ? 'PASS' : 'WARNING', title: 'Feedback link exists', description: 'GIGW recommends a feedback mechanism.', recommendation: 'Add a Feedback link or form.' };
  }

  private checkHelpLink(html: string): CheckResult {
    return { checkKey: 'gigw.help_link', category: 'GIGW Readiness', severity: 'LOW', status: /help/i.test(html) ? 'PASS' : 'WARNING', title: 'Help link exists', description: 'GIGW recommends a help section.', recommendation: 'Add a Help link in navigation or footer.' };
  }

  private checkSitemapLink(html: string): CheckResult {
    return { checkKey: 'gigw.sitemap_link', category: 'GIGW Readiness', severity: 'LOW', status: /sitemap/i.test(html) ? 'PASS' : 'WARNING', title: 'Sitemap link exists', description: 'GIGW recommends a sitemap link.', recommendation: 'Add a Sitemap link in the footer.' };
  }

  private checkPolicyLinks(html: string): CheckResult {
    const hasPrivacy = /privacy/i.test(html);
    const hasTerms = /terms/i.test(html);
    return { checkKey: 'gigw.policy_links', category: 'GIGW Readiness', severity: 'MEDIUM', status: hasPrivacy && hasTerms ? 'PASS' : hasPrivacy || hasTerms ? 'WARNING' : 'FAIL', title: 'Policy links exist', description: 'Website should have Privacy Policy and Terms of Use links.', recommendation: 'Add Privacy Policy and Terms of Use links in the footer.' };
  }

  private checkAccessibilityStatement(html: string): CheckResult {
    return { checkKey: 'gigw.accessibility_statement', category: 'GIGW Readiness', severity: 'MEDIUM', status: /accessibility[- ]?statement/i.test(html) || /accessibility.*policy/i.test(html) ? 'PASS' : 'FAIL', title: 'Accessibility statement', description: 'GIGW requires an accessibility statement page.', recommendation: 'Create and link to an Accessibility Statement page.' };
  }

  private checkFooterOwnership(html: string): CheckResult {
    const hasCopyright = /©|&copy;|copyright/i.test(html);
    return { checkKey: 'gigw.footer_ownership', category: 'GIGW Readiness', severity: 'LOW', status: hasCopyright ? 'PASS' : 'WARNING', title: 'Footer ownership info', description: 'Footer should contain ownership/copyright information.', recommendation: 'Add copyright and ownership details to the footer.' };
  }

  private checkMetaTitle(html: string): CheckResult {
    return { checkKey: 'seo.meta_title', category: 'SEO', severity: 'MEDIUM', status: /<title[^>]*>[^<]+<\/title>/i.test(html) ? 'PASS' : 'FAIL', title: 'Meta title exists', description: 'Page must have a <title> tag.', recommendation: 'Add a descriptive <title> tag (50-60 characters).' };
  }

  private checkMetaDescription(html: string): CheckResult {
    return { checkKey: 'seo.meta_description', category: 'SEO', severity: 'MEDIUM', status: /meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html) ? 'PASS' : 'FAIL', title: 'Meta description exists', description: 'Page should have a meta description.', recommendation: 'Add <meta name="description" content="..."> (120-160 characters).' };
  }

  private checkNoInlineScripts(html: string): CheckResult {
    const scripts = (html.match(/<script\b/gi) || []).length;
    return { checkKey: 'safety.no_inline_scripts', category: 'Template Safety', severity: 'HIGH', status: scripts === 0 ? 'PASS' : 'WARNING', title: 'No inline scripts', description: `${scripts} script tag(s) found.`, recommendation: 'Remove inline scripts for security. Use external JS if needed.' };
  }

  private checkNoEventHandlers(html: string): CheckResult {
    const handlers = (html.match(/\son\w+\s*=/gi) || []).length;
    return { checkKey: 'safety.no_event_handlers', category: 'Template Safety', severity: 'HIGH', status: handlers === 0 ? 'PASS' : 'FAIL', title: 'No inline event handlers', description: `${handlers} inline event handler(s) found.`, recommendation: 'Remove onclick, onload, etc. Use external JS event listeners.' };
  }

  calculateScore(results: CheckResult[]): number {
    if (results.length === 0) return 0;
    const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    let totalWeight = 0;
    let earnedWeight = 0;
    for (const r of results) {
      const w = weights[r.severity];
      totalWeight += w;
      if (r.status === 'PASS') earnedWeight += w;
      else if (r.status === 'WARNING') earnedWeight += w * 0.5;
    }
    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  }
}

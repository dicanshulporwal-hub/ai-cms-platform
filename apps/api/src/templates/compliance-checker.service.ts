import { Injectable } from '@nestjs/common';

export interface ComplianceCheckResult {
  checkKey: string;
  checkTitle: string;
  checkCategory: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_CHECKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  recommendation: string;
}

export interface ComplianceReport {
  overallStatus: 'PASS' | 'WARNING' | 'FAIL';
  score: number;
  criticalFailures: number;
  warnings: number;
  checks: ComplianceCheckResult[];
  disclaimer: string;
}

@Injectable()
export class ComplianceCheckerService {
  runChecks(configJson: Record<string, unknown>, htmlContent?: string): ComplianceReport {
    const checks: ComplianceCheckResult[] = [];

    // Government Identity checks
    checks.push(this.checkHeaderRegion(configJson));
    checks.push(this.checkGovernmentBranding(configJson));
    checks.push(this.checkFooterRegion(configJson));

    // Accessibility checks
    checks.push(this.checkSkipToContent(htmlContent));
    checks.push(this.checkSemanticHtml(htmlContent));
    checks.push(this.checkLangAttribute(htmlContent));
    checks.push(this.checkHeadingHierarchy(htmlContent));
    checks.push(this.checkKeyboardNavigation(configJson));

    // Usability checks
    checks.push(this.checkNavigation(configJson));
    checks.push(this.checkBreadcrumbs(configJson));

    // Mobile checks
    checks.push(this.checkViewportMeta(htmlContent));
    checks.push(this.checkResponsiveCss(configJson));

    // Footer policy checks
    checks.push(this.checkFooterPolicyLinks(configJson, htmlContent));
    checks.push(this.checkAccessibilityStatement(configJson, htmlContent));

    // Security checks
    checks.push(this.checkUnsafeScripts(htmlContent));
    checks.push(this.checkUnsafeSvg(htmlContent));

    const criticalFailures = checks.filter((c) => c.status === 'FAIL' && c.severity === 'CRITICAL').length;
    const warnings = checks.filter((c) => c.status === 'WARNING').length;
    const passes = checks.filter((c) => c.status === 'PASS').length;
    const score = Math.round((passes / checks.length) * 100);

    const overallStatus = criticalFailures > 0 ? 'FAIL' : warnings > 2 ? 'WARNING' : 'PASS';

    return {
      overallStatus,
      score,
      criticalFailures,
      warnings,
      checks,
      disclaimer: 'This is an automated readiness check and not official GIGW certification.',
    };
  }

  private checkHeaderRegion(config: Record<string, unknown>): ComplianceCheckResult {
    const regions = (config?.regions as string[]) ?? [];
    return {
      checkKey: 'gov_identity.header_region',
      checkTitle: 'Header Region Exists',
      checkCategory: 'Government Identity',
      status: regions.includes('header') ? 'PASS' : 'FAIL',
      severity: 'HIGH',
      message: regions.includes('header') ? 'Header region is defined.' : 'Header region is missing.',
      recommendation: 'Define a header region for government branding.',
    };
  }

  private checkGovernmentBranding(config: Record<string, unknown>): ComplianceCheckResult {
    const hints = config?.complianceHints as Record<string, unknown> | undefined;
    return {
      checkKey: 'gov_identity.branding_support',
      checkTitle: 'Government Branding Placeholder',
      checkCategory: 'Government Identity',
      status: hints?.gigwReady ? 'PASS' : 'WARNING',
      severity: 'MEDIUM',
      message: hints?.gigwReady ? 'Template declares GIGW readiness.' : 'No GIGW readiness declaration.',
      recommendation: 'Add complianceHints.gigwReady to template.json.',
    };
  }

  private checkFooterRegion(config: Record<string, unknown>): ComplianceCheckResult {
    const regions = (config?.regions as string[]) ?? [];
    return {
      checkKey: 'gov_identity.footer_region',
      checkTitle: 'Footer Region Exists',
      checkCategory: 'Government Identity',
      status: regions.includes('footer') ? 'PASS' : 'FAIL',
      severity: 'HIGH',
      message: regions.includes('footer') ? 'Footer region is defined.' : 'Footer region is missing.',
      recommendation: 'Define a footer region for policy links and contact info.',
    };
  }

  private checkSkipToContent(html?: string): ComplianceCheckResult {
    const hasSkip = html ? /skip.?to.?(main|content)/i.test(html) : false;
    return {
      checkKey: 'accessibility.skip_to_content',
      checkTitle: 'Skip to Content Link',
      checkCategory: 'Accessibility',
      status: hasSkip ? 'PASS' : 'WARNING',
      severity: 'HIGH',
      message: hasSkip ? 'Skip-to-content link found.' : 'No skip-to-content link detected.',
      recommendation: 'Add a skip-to-content link as the first focusable element.',
    };
  }

  private checkSemanticHtml(html?: string): ComplianceCheckResult {
    const hasSemantics = html ? /<(header|main|footer|nav|article|section)/i.test(html) : false;
    return {
      checkKey: 'accessibility.semantic_html',
      checkTitle: 'Semantic HTML Elements',
      checkCategory: 'Accessibility',
      status: hasSemantics ? 'PASS' : 'FAIL',
      severity: 'HIGH',
      message: hasSemantics ? 'Semantic HTML elements found.' : 'No semantic HTML elements detected.',
      recommendation: 'Use <header>, <main>, <footer>, <nav>, <article>, <section> elements.',
    };
  }

  private checkLangAttribute(html?: string): ComplianceCheckResult {
    const hasLang = html ? /<html[^>]*lang=/i.test(html) : false;
    return {
      checkKey: 'accessibility.lang_attribute',
      checkTitle: 'Language Attribute',
      checkCategory: 'Accessibility',
      status: hasLang ? 'PASS' : 'WARNING',
      severity: 'MEDIUM',
      message: hasLang ? 'Lang attribute found on <html>.' : 'No lang attribute on <html>.',
      recommendation: 'Add lang="en" (or appropriate language) to the <html> element.',
    };
  }

  private checkHeadingHierarchy(html?: string): ComplianceCheckResult {
    const hasH1 = html ? /<h1/i.test(html) : false;
    return {
      checkKey: 'accessibility.heading_hierarchy',
      checkTitle: 'Heading Hierarchy',
      checkCategory: 'Accessibility',
      status: hasH1 ? 'PASS' : 'WARNING',
      severity: 'MEDIUM',
      message: hasH1 ? 'H1 heading found.' : 'No H1 heading detected.',
      recommendation: 'Ensure proper heading hierarchy starting with H1.',
    };
  }

  private checkKeyboardNavigation(config: Record<string, unknown>): ComplianceCheckResult {
    const supports = config?.supports as Record<string, unknown> | undefined;
    return {
      checkKey: 'accessibility.keyboard_navigation',
      checkTitle: 'Keyboard Navigation Support',
      checkCategory: 'Accessibility',
      status: supports?.accessibilityControls ? 'PASS' : 'WARNING',
      severity: 'HIGH',
      message: supports?.accessibilityControls ? 'Accessibility controls declared.' : 'No accessibility controls declared.',
      recommendation: 'Add supports.accessibilityControls to template.json.',
    };
  }

  private checkNavigation(config: Record<string, unknown>): ComplianceCheckResult {
    const supports = config?.supports as Record<string, unknown> | undefined;
    return {
      checkKey: 'usability.navigation',
      checkTitle: 'Navigation Support',
      checkCategory: 'Usability',
      status: supports?.navigation ? 'PASS' : 'WARNING',
      severity: 'MEDIUM',
      message: supports?.navigation ? 'Navigation support declared.' : 'No navigation support declared.',
      recommendation: 'Add supports.navigation to template.json.',
    };
  }

  private checkBreadcrumbs(config: Record<string, unknown>): ComplianceCheckResult {
    const regions = (config?.regions as string[]) ?? [];
    return {
      checkKey: 'usability.breadcrumbs',
      checkTitle: 'Breadcrumb Support',
      checkCategory: 'Usability',
      status: regions.includes('breadcrumb') ? 'PASS' : 'WARNING',
      severity: 'LOW',
      message: 'Breadcrumb region check.',
      recommendation: 'Consider adding breadcrumb navigation for better usability.',
    };
  }

  private checkViewportMeta(html?: string): ComplianceCheckResult {
    const hasViewport = html ? /viewport/i.test(html) : false;
    return {
      checkKey: 'mobile.viewport_meta',
      checkTitle: 'Viewport Meta Tag',
      checkCategory: 'Mobile Responsiveness',
      status: hasViewport ? 'PASS' : 'FAIL',
      severity: 'CRITICAL',
      message: hasViewport ? 'Viewport meta tag found.' : 'No viewport meta tag.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    };
  }

  private checkResponsiveCss(config: Record<string, unknown>): ComplianceCheckResult {
    const hints = config?.complianceHints as Record<string, unknown> | undefined;
    return {
      checkKey: 'mobile.responsive_css',
      checkTitle: 'Responsive CSS',
      checkCategory: 'Mobile Responsiveness',
      status: hints?.ux4gAligned ? 'PASS' : 'WARNING',
      severity: 'HIGH',
      message: hints?.ux4gAligned ? 'UX4G alignment declared.' : 'No UX4G alignment declared.',
      recommendation: 'Ensure responsive CSS with mobile-first approach.',
    };
  }

  private checkFooterPolicyLinks(config: Record<string, unknown>, html?: string): ComplianceCheckResult {
    const policyTerms = ['contact', 'policy', 'help', 'feedback', 'sitemap'];
    const found = html ? policyTerms.filter((t) => html.toLowerCase().includes(t)).length : 0;
    return {
      checkKey: 'footer.policy_links',
      checkTitle: 'Footer Policy Links',
      checkCategory: 'Footer & Policy Links',
      status: found >= 3 ? 'PASS' : found >= 1 ? 'WARNING' : 'FAIL',
      severity: 'HIGH',
      message: `${found}/${policyTerms.length} policy link placeholders found.`,
      recommendation: 'Include Contact Us, Website Policies, Help, Feedback, and Sitemap links.',
    };
  }

  private checkAccessibilityStatement(config: Record<string, unknown>, html?: string): ComplianceCheckResult {
    const hasStatement = html ? /accessibility/i.test(html) : false;
    return {
      checkKey: 'footer.accessibility_statement',
      checkTitle: 'Accessibility Statement Placeholder',
      checkCategory: 'Footer & Policy Links',
      status: hasStatement ? 'PASS' : 'WARNING',
      severity: 'MEDIUM',
      message: hasStatement ? 'Accessibility statement reference found.' : 'No accessibility statement reference.',
      recommendation: 'Add an Accessibility Statement link in the footer.',
    };
  }

  private checkUnsafeScripts(html?: string): ComplianceCheckResult {
    const hasUnsafe = html ? /<script[^>]*src\s*=\s*["']http/i.test(html) || /eval\s*\(/i.test(html) : false;
    return {
      checkKey: 'security.unsafe_scripts',
      checkTitle: 'Unsafe External Scripts',
      checkCategory: 'Security',
      status: hasUnsafe ? 'FAIL' : 'PASS',
      severity: 'CRITICAL',
      message: hasUnsafe ? 'Potentially unsafe external scripts detected.' : 'No unsafe external scripts.',
      recommendation: 'Remove external script references and eval() calls.',
    };
  }

  private checkUnsafeSvg(html?: string): ComplianceCheckResult {
    const hasUnsafeSvg = html ? /<svg[^>]*>[\s\S]*?<script/i.test(html) : false;
    return {
      checkKey: 'security.unsafe_svg',
      checkTitle: 'Unsafe SVG Content',
      checkCategory: 'Security',
      status: hasUnsafeSvg ? 'FAIL' : 'PASS',
      severity: 'CRITICAL',
      message: hasUnsafeSvg ? 'SVG with embedded scripts detected.' : 'No unsafe SVG content.',
      recommendation: 'Remove script elements from SVG files.',
    };
  }
}

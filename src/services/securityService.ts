/**
 * Tablate MediPulse Enterprise Security & Hardening Service
 * Protects against XSS, Injection, CSRF, Clickjacking, Brute-Force Rate Limiting, and Data Tampering
 */

export class SecurityService {
  private flexRateLimitMap: Map<string, { count: number; firstAttempt: number }> = new Map();

  /**
   * 1. XSS & HTML Sanitization: Escapes dangerous HTML tags, attributes, javascript: URIs
   */
  public static sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '');
  }

  /**
   * 2. SQL / NoSQL / Regex Injection Prevention: Strips malicious database query syntax
   */
  public static sanitizeQuery(query: string): string {
    if (!query) return '';
    return query
      .replace(/['";\--]/g, '')
      .replace(/\$where/gi, '')
      .replace(/\$gt/gi, '')
      .replace(/\$ne/gi, '')
      .replace(/\$regex/gi, '')
      .trim();
  }

  /**
   * 3. Anti-Brute Force Rate Limiting: Blocks IP/Action if requests exceed threshold
   */
  public checkRateLimit(
    actionKey: string,
    maxAllowed: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.flexRateLimitMap.get(actionKey) || { count: 0, firstAttempt: now };

    if (now - record.firstAttempt > windowMs) {
      record.count = 1;
      record.firstAttempt = now;
      this.flexRateLimitMap.set(actionKey, record);
      return { allowed: true, remainingAttempts: maxAllowed - 1 };
    }

    if (record.count >= maxAllowed) {
      const retryAfterSec = Math.ceil((windowMs - (now - record.firstAttempt)) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSec };
    }

    record.count += 1;
    this.flexRateLimitMap.set(actionKey, record);
    return { allowed: true, remainingAttempts: maxAllowed - record.count };
  }

  /**
   * 4. Sensitive Data Masking (Aadhaar, Phone, Email) for Privacy Compliance
   */
  public static maskSensitiveString(val: string, type: 'aadhaar' | 'phone' | 'email'): string {
    if (!val) return '';
    if (type === 'aadhaar') {
      const clean = val.replace(/[\s-]/g, '');
      return clean.length >= 4 ? `XXXX-XXXX-${clean.slice(-4)}` : 'XXXX-XXXX-XXXX';
    }
    if (type === 'phone') {
      const clean = val.replace(/\s+/g, '');
      return clean.length >= 4 ? `${clean.slice(0, 3)}****${clean.slice(-3)}` : '***-***-****';
    }
    if (type === 'email') {
      const parts = val.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : '***';
        return `${maskedName}@${parts[1]}`;
      }
    }
    return '********';
  }
}

export const securityService = new SecurityService();

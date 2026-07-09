import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

// Rate limits per EMAIL — protects individual accounts from brute-force
const emailAttempts = new Map<string, AttemptRecord>();
const EMAIL_MAX_ATTEMPTS = 10;           // Max failures before email lockout
const EMAIL_WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const EMAIL_LOCKOUT_MS = 30 * 60 * 1000; // 30-minute lockout after threshold

// Rate limits per IP — blocks automated bots trying many emails from one IP
// NOTE: requires app.set('trust proxy', 1) in index.ts so req.ip is the real
// client IP and not the reverse-proxy IP shared by all users.
const ipAttempts = new Map<string, AttemptRecord>();
const IP_MAX_ATTEMPTS = 50;             // Higher threshold for IPs (shared NAT, offices, etc.)
const IP_WINDOW_MS = 15 * 60 * 1000;   // 15-minute sliding window
const IP_LOCKOUT_MS = 15 * 60 * 1000;  // 15-minute lockout

// ---------------------------------------------------------------------------
// Cleanup: remove stale entries every 30 minutes to prevent memory leaks
// ---------------------------------------------------------------------------
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of emailAttempts) {
    if (now - record.firstAttempt > EMAIL_WINDOW_MS * 2) {
      emailAttempts.delete(key);
    }
  }
  for (const [key, record] of ipAttempts) {
    if (now - record.firstAttempt > IP_WINDOW_MS * 2) {
      ipAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

// ---------------------------------------------------------------------------
// Helper: check and enforce a rate limit map entry
// ---------------------------------------------------------------------------
function checkRateLimit(
  store: Map<string, AttemptRecord>,
  key: string,
  maxAttempts: number,
  windowMs: number,
  lockoutMs: number,
  label: string
): { blocked: boolean; message?: string } {
  const now = Date.now();
  let record = store.get(key);

  if (record) {
    // If currently locked out, check if lock has expired
    if (record.lockedUntil) {
      if (now < record.lockedUntil) {
        const remaining = Math.ceil((record.lockedUntil - now) / 60000);
        return {
          blocked: true,
          message: `Muitas tentativas para ${label}. Tente novamente em ${remaining} minuto(s).`
        };
      } else {
        // Lockout expired — reset
        store.delete(key);
        record = undefined as any;
      }
    }
  }

  if (!record) {
    store.set(key, { count: 0, firstAttempt: now });
  }

  return { blocked: false };
}

// ---------------------------------------------------------------------------
// Exported: increment failure count (called only on failed login attempts)
// ---------------------------------------------------------------------------
export const incrementLoginFailure = (email: string, ip: string) => {
  const now = Date.now();

  // --- Email tracking ---
  let emailRecord = emailAttempts.get(email);
  if (!emailRecord) {
    emailAttempts.set(email, { count: 1, firstAttempt: now });
  } else {
    // Reset window if it has passed
    if (now - emailRecord.firstAttempt > EMAIL_WINDOW_MS) {
      emailAttempts.set(email, { count: 1, firstAttempt: now });
    } else {
      emailRecord.count++;
      if (emailRecord.count >= EMAIL_MAX_ATTEMPTS) {
        emailRecord.lockedUntil = now + EMAIL_LOCKOUT_MS;
        console.warn(`[RateLimit] Email "${email}" locked out for 30 min after ${emailRecord.count} failed attempts.`);
      }
    }
  }

  // --- IP tracking ---
  let ipRecord = ipAttempts.get(ip);
  if (!ipRecord) {
    ipAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    if (now - ipRecord.firstAttempt > IP_WINDOW_MS) {
      ipAttempts.set(ip, { count: 1, firstAttempt: now });
    } else {
      ipRecord.count++;
      if (ipRecord.count >= IP_MAX_ATTEMPTS) {
        ipRecord.lockedUntil = now + IP_LOCKOUT_MS;
        console.warn(`[RateLimit] IP "${ip}" locked out for 15 min after ${ipRecord.count} failed login attempts.`);
      }
    }
  }
};

// ---------------------------------------------------------------------------
// Exported: reset attempts on successful login
// ---------------------------------------------------------------------------
export const resetLoginAttempts = (emailOrIp: string) => {
  // Reset by email key
  if (emailAttempts.has(emailOrIp)) {
    emailAttempts.delete(emailOrIp);
    console.log(`[RateLimit] Attempts reset for email "${emailOrIp}" after successful login.`);
  }
  // Also reset by IP key
  if (ipAttempts.has(emailOrIp)) {
    ipAttempts.delete(emailOrIp);
  }
};

// ---------------------------------------------------------------------------
// Middleware: check rate limits BEFORE processing any auth route request.
// For login routes, also validates that IP and email are not currently blocked.
// ---------------------------------------------------------------------------
export const rateLimitAndSanitize = (req: Request, res: Response, next: NextFunction) => {
  // With app.set('trust proxy', 1), req.ip returns the real client IP.
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // --- Check IP rate limit (blocks bots hammering from the same IP) ---
  const ipCheck = checkRateLimit(ipAttempts, ip, IP_MAX_ATTEMPTS, IP_WINDOW_MS, IP_LOCKOUT_MS, `IP ${ip}`);
  if (ipCheck.blocked) {
    return res.status(429).json({ message: ipCheck.message });
  }

  // --- Check email-based rate limit (only for routes that send email in body) ---
  const email = req.body?.email;
  if (email && typeof email === 'string') {
    const emailCheck = checkRateLimit(emailAttempts, email.toLowerCase(), EMAIL_MAX_ATTEMPTS, EMAIL_WINDOW_MS, EMAIL_LOCKOUT_MS, `o e-mail informado`);
    if (emailCheck.blocked) {
      return res.status(429).json({ message: emailCheck.message });
    }
  }

  // --- Sanitize body fields to prevent XSS ---
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
  }

  next();
};

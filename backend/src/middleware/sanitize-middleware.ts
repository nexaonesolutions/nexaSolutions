import { Request, Response, NextFunction } from 'express';

// Simple in-memory store for rate limiting
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const BANNED_IPS = new Set<string>();
const MAX_ATTEMPTS = 5; // Max attempts before temporary lockout
const LOCKOUT_PERIOD = 15 * 60 * 1000; // 15 minutes
const BAN_THRESHOLD = 20; // Total attempts before permanent ban
const BAN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours for a ban

// Rate limiting and security middleware
export const rateLimitAndSanitize = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'; // Provide a fallback for req.ip

    if (BANNED_IPS.has(ip)) {
        return res.status(403).json({ message: 'This IP is temporarily banned due to excessive attempts.' });
    }

    const now = Date.now();
    let attempt = loginAttempts.get(ip);

    if (attempt) {
        // If the lockout period has passed, reset the count
        if (now - attempt.lastAttempt > LOCKOUT_PERIOD) {
            loginAttempts.set(ip, { count: 1, lastAttempt: now });
        } else {
            attempt.count++;
            attempt.lastAttempt = now;

            if (attempt.count > MAX_ATTEMPTS) {
                console.warn(`IP ${ip} has been locked out for 15 minutes.`);
                return res.status(429).json({ message: 'Too many login attempts. Please try again in 15 minutes.' });
            }

            if (attempt.count > BAN_THRESHOLD) {
                console.error(`IP ${ip} has been banned for 24 hours for excessive login attempts.`);
                BANNED_IPS.add(ip);
                // Set a timeout to unban the IP after the ban period
                setTimeout(() => {
                    BANNED_IPS.delete(ip);
                    loginAttempts.delete(ip);
                    console.log(`IP ${ip} has been unbanned.`);
                }, BAN_PERIOD);
                return res.status(403).json({ message: 'This IP has been temporarily banned.' });
            }
        }
    } else {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
    }

    // Sanitize body fields to prevent XSS
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        }
    }

    next();
};

export const resetLoginAttempts = (ip: string) => {
    if (loginAttempts.has(ip)) {
        loginAttempts.delete(ip);
        console.log(`Login attempts reset for IP ${ip} after successful login.`);
    }
};

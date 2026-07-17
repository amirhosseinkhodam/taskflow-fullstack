# Security Checklist

Reusable security best practices for web applications. Adapt to your stack and compliance requirements.

---

## 1. Authentication

### Password Security
- [ ] Enforce minimum password length (12+ characters recommended)
- [ ] Hash passwords with bcrypt/argon2 (never MD5/SHA1)
- [ ] Use salt rounds ≥ 12 for bcrypt
- [ ] Implement account lockout after failed attempts (5-10 attempts)
- [ ] Never return password hashes in API responses

### Session Management
- [ ] Use short-lived JWTs (15-60 minutes) with refresh tokens
- [ ] Store tokens in httpOnly, secure, sameSite cookies (not localStorage for sensitive apps)
- [ ] Implement token rotation on sensitive operations
- [ ] Invalidate all sessions on password change
- [ ] Set appropriate session timeouts

### Multi-Factor Authentication
- [ ] Offer MFA for sensitive operations
- [ ] Support TOTP (Google Authenticator, Authy)
- [ ] Provide backup codes stored securely

---

## 2. Authorization

### Role-Based Access Control (RBAC)
- [ ] Define roles and permissions clearly
- [ ] Enforce authorization on every API endpoint
- [ ] Never trust client-side role checks alone
- [ ] Use principle of least privilege
- [ ] Audit role changes

### API Authorization
- [ ] Validate JWT on every protected route
- [ ] Check resource ownership before allowing modifications
- [ ] Prevent horizontal privilege escalation (user A accessing user B's data)
- [ ] Prevent vertical privilege escalation (user accessing admin functions)

---

## 3. Input Validation

### Server-Side Validation
- [ ] Validate ALL input on the server (never trust the client)
- [ ] Use whitelist validation (allow known good, reject everything else)
- [ ] Validate type, length, range, and format
- [ ] Reject unexpected fields (use `whitelist: true` in class-validator)
- [ ] Sanitize input before using in SQL queries

### SQL Injection Prevention
- [ ] Use parameterized queries (never string concatenation)
- [ ] Use an ORM or query builder with parameterization
- [ ] Validate and sanitize any dynamic table/column names
- [ ] Apply least-privilege database permissions

### XSS Prevention
- [ ] Escape output in templates (Angular does this by default)
- [ ] Sanitize any `innerHTML` or dynamic HTML
- [ ] Use Content Security Policy (CSP) headers
- [ ] Validate URLs in user input (prevent `javascript:` schemes)

---

## 4. API Security

### Rate Limiting
- [ ] Implement rate limiting on all endpoints
- [ ] Apply stricter limits on auth endpoints (login, register)
- [ ] Use sliding window or token bucket algorithms
- [ ] Return proper 429 status codes with retry-after headers

### CORS
- [ ] Restrict CORS to known origins (never `*` in production)
- [ ] Only allow necessary HTTP methods
- [ ] Only allow necessary headers

### Headers
- [ ] Set `X-Content-Type-Options: nosniff`
- [ ] Set `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] Set `X-XSS-Protection: 1; mode=block`
- [ ] Set `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] Use `helmet` or equivalent middleware

---

## 5. Secrets Management

### What to Never Commit
- [ ] API keys, tokens, or secrets
- [ ] Database credentials
- [ ] Private keys or certificates
- [ ] `.env` files (add to `.gitignore`)

### Best Practices
- [ ] Use environment variables for all secrets
- [ ] Use a secrets manager for production (Vault, AWS Secrets Manager, etc.)
- [ ] Rotate secrets periodically
- [ ] Audit secret access
- [ ] Use different secrets for dev/staging/production

---

## 6. Data Protection

### At Rest
- [ ] Encrypt sensitive data in the database
- [ ] Use field-level encryption for PII
- [ ] Implement data retention policies
- [ ] Secure backups with encryption

### In Transit
- [ ] Enforce HTTPS everywhere
- [ ] Use TLS 1.2+ (disable older versions)
- [ ] Validate certificates

### Logging
- [ ] Never log passwords, tokens, or secrets
- [ ] Sanitize sensitive data in logs
- [ ] Use structured logging for audit trails
- [ ] Monitor for suspicious activity

---

## 7. Dependency Security

- [ ] Regularly audit dependencies (`npm audit`)
- [ ] Keep dependencies updated
- [ ] Use lockfiles (`package-lock.json`)
- [ ] Scan for known vulnerabilities (Snyk, Dependabot)
- [ ] Remove unused dependencies

---

## 8. Infrastructure Security

- [ ] Use firewalls and network segmentation
- [ ] Keep OS and runtime updated
- [ ] Use non-root containers
- [ ] Implement monitoring and alerting
- [ ] Regular security scans (port scanning, vulnerability assessment)

---

## 9. Incident Response

- [ ] Have an incident response plan
- [ ] Know who to contact for security issues
- [ ] Have a process for reporting vulnerabilities
- [ ] Keep audit logs for investigation
- [ ] Practice incident response drills

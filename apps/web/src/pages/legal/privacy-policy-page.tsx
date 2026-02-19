import { Link } from 'react-router';

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: 'var(--primary-background-color)' }}
    >
      <div className="mx-auto max-w-3xl">
        <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
          Privacy Policy
        </h1>
        <p
          className="mt-2"
          style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
        >
          Last updated: February 2026
        </p>

        <div className="mt-8 space-y-8" style={{ color: 'var(--primary-text-color)' }}>
          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              1. Data We Collect
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              We collect your email address, display name, and avatar URL when you create an
              account. When you connect third-party accounts (YouTube, TikTok), we store OAuth
              tokens required to interact with those platforms on your behalf.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              2. OAuth Token Security
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              All OAuth access and refresh tokens are encrypted at rest using AES-256-GCM
              encryption. Tokens are only decrypted in memory when making API calls to connected
              platforms. We never share your tokens with third parties.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              3. Analytics Data
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              We collect video performance metrics (views, likes, comments) from your connected
              accounts to power the analytics dashboard. Data older than 90 days is aggregated into
              weekly summaries. Raw daily data beyond the retention window is permanently deleted.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              4. Cookies &amp; Local Storage
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              We use HTTP-only cookies for authentication (session tokens). Local storage is used
              for UI preferences such as theme selection. We do not use third-party tracking cookies
              or advertising pixels.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              5. Data Sharing
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              We do not sell, rent, or share your personal data with third parties. Data is only
              transmitted to YouTube and TikTok APIs when you initiate uploads or sync operations.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              6. Your Rights
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              You may request access to, correction of, or deletion of your personal data at any
              time. To exercise these rights, contact us or use the account deletion feature in
              Settings. See our{' '}
              <Link
                to="/legal/terms"
                style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
              >
                Terms of Service
              </Link>{' '}
              for more details on data retention and deletion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

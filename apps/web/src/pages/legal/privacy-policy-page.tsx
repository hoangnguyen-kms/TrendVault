import { Link } from 'react-router';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: February 2026</p>

        <div className="mt-8 space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Data We Collect</h2>
            <p className="mt-2 text-muted-foreground">
              We collect your email address, display name, and avatar URL when you create an
              account. When you connect third-party accounts (YouTube, TikTok), we store OAuth
              tokens required to interact with those platforms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. OAuth Token Security</h2>
            <p className="mt-2 text-muted-foreground">
              All OAuth access and refresh tokens are encrypted at rest using AES-256-GCM
              encryption. Tokens are only decrypted in memory when making API calls to connected
              platforms. We never share your tokens with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Analytics Data</h2>
            <p className="mt-2 text-muted-foreground">
              We collect video performance metrics (views, likes, comments) from your connected
              accounts to power the analytics dashboard. Data older than 90 days is aggregated into
              weekly summaries. Raw daily data beyond the retention window is permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Cookies &amp; Local Storage</h2>
            <p className="mt-2 text-muted-foreground">
              We use HTTP-only cookies for authentication (session tokens). Local storage is used
              for UI preferences such as theme selection. We do not use third-party tracking cookies
              or advertising pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Data Sharing</h2>
            <p className="mt-2 text-muted-foreground">
              We do not sell, rent, or share your personal data with third parties. Data is only
              transmitted to YouTube and TikTok APIs when you initiate uploads or sync operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="mt-2 text-muted-foreground">
              You may request access to, correction of, or deletion of your personal data at any
              time. To exercise these rights, contact us or use the account deletion feature in
              Settings. See our{' '}
              <Link to="/legal/terms" className="text-primary underline">
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

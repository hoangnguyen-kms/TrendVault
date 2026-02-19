import { useNavigate } from 'react-router';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAcceptTos } from '@/hooks/use-accept-tos';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const acceptTos = useAcceptTos();

  const showAcceptButton = !!user && !user.tosAcceptedAt;

  const handleAccept = async () => {
    await acceptTos.mutateAsync();
    navigate('/');
  };

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: 'var(--primary-background-color)' }}
    >
      <div className="mx-auto max-w-3xl">
        <h1 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
          Terms of Service
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
              1. Content Responsibility
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              You are solely responsible for any content you download, upload, or cross-post through
              TrendVault. You must own or have the necessary rights to all content you distribute.
              TrendVault does not claim ownership of your content and does not monitor uploads for
              copyright compliance.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              2. YouTube Terms of Service Compliance
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              By connecting a YouTube account, you agree to comply with the{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
              >
                YouTube Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
              >
                YouTube API Services Terms
              </a>
              . When re-uploading content, proper attribution to the original creator is required.
              TrendVault enforces a daily upload cap of 4 videos per channel to respect platform
              rate limits.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              3. TikTok Content Posting Guidelines
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              TikTok uploads are performed via the Inbox Upload method. You must review and manually
              publish content from your TikTok inbox. You agree to comply with TikTok's Community
              Guidelines and Terms of Service when posting content through TrendVault.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              4. Data Retention Policy
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              TrendVault retains your account data and activity history for the duration of your
              account's existence. Analytics data older than 90 days is aggregated into weekly
              summaries to optimize storage. Downloaded media files are stored temporarily and may
              be automatically cleaned up after processing.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              5. Account Deletion &amp; Data Export
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              You may request deletion of your account and all associated data at any time. Upon
              deletion, your OAuth tokens, connected accounts, upload history, and analytics data
              will be permanently removed. You may request an export of your data prior to account
              deletion.
            </p>
          </section>

          <section>
            <h2 style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}>
              6. Limitation of Liability
            </h2>
            <p
              className="mt-2"
              style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
            >
              TrendVault is provided "as is" without warranties of any kind. We are not responsible
              for content removed by third-party platforms, account suspensions resulting from your
              use of connected services, or any loss of data due to platform API changes. Use of
              TrendVault is at your own risk.
            </p>
          </section>
        </div>

        {showAcceptButton && (
          <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--ui-border-color)' }}>
            <p style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}>
              By clicking "I Accept", you agree to these Terms of Service.
            </p>
            <button
              onClick={handleAccept}
              disabled={acceptTos.isPending}
              className="mt-4 px-6 py-2 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'var(--text-color-on-primary)',
                borderRadius: 'var(--border-radius-medium)',
              }}
            >
              {acceptTos.isPending ? 'Accepting...' : 'I Accept'}
            </button>
            {acceptTos.isError && (
              <p
                className="mt-2"
                style={{ font: 'var(--font-text2-normal)', color: 'var(--negative-color)' }}
              >
                Failed to accept terms. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

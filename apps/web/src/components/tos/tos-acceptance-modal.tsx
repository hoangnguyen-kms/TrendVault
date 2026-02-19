import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAcceptTos } from '@/hooks/use-accept-tos';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TosAcceptanceModalProps {
  isOpen: boolean;
}

export function TosAcceptanceModal({ isOpen }: TosAcceptanceModalProps) {
  const navigate = useNavigate();
  const acceptTos = useAcceptTos();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    setIsScrolledToBottom(isAtBottom);
  };

  const handleAccept = async () => {
    try {
      setError(null);
      await acceptTos.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept Terms of Service');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const handleViewFullTerms = () => {
    navigate('/legal/terms-of-service');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <Card
        className="mx-4 w-full max-w-2xl p-6"
        style={{
          backgroundColor: 'var(--primary-background-color)',
          boxShadow: 'var(--box-shadow-medium)',
        }}
      >
        <h2 style={{ font: 'var(--font-h2-bold)', color: 'var(--primary-text-color)' }}>
          Terms of Service
        </h2>
        <p
          className="mt-2"
          style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
        >
          Please review and accept our Terms of Service to continue
        </p>

        <div
          className="mt-6 max-h-96 space-y-4 overflow-y-auto rounded-md p-4"
          style={{
            border: '1px solid var(--ui-border-color)',
            backgroundColor: 'var(--allgrey-background-color)',
            font: 'var(--font-text2-normal)',
            color: 'var(--primary-text-color)',
          }}
          onScroll={handleScroll}
        >
          <section>
            <h3 style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              1. Content Responsibility
            </h3>
            <p className="mt-1" style={{ color: 'var(--secondary-text-color)' }}>
              You are solely responsible for any content you download, upload, or cross-post through
              TrendVault. You must own or have the necessary rights to all content you distribute.
            </p>
          </section>

          <section>
            <h3 style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              2. Platform Compliance
            </h3>
            <p className="mt-1" style={{ color: 'var(--secondary-text-color)' }}>
              You agree to comply with YouTube, TikTok, and all third-party platform Terms of
              Service. TrendVault is not responsible for violations of platform policies.
            </p>
          </section>

          <section>
            <h3 style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              3. Account Security
            </h3>
            <p className="mt-1" style={{ color: 'var(--secondary-text-color)' }}>
              You are responsible for maintaining the confidentiality of your OAuth tokens and API
              credentials. Notify us immediately if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h3 style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              4. Prohibited Content
            </h3>
            <p className="mt-1" style={{ color: 'var(--secondary-text-color)' }}>
              You may not use TrendVault to distribute illegal, harmful, or copyright-infringing
              content. We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h3 style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-text-color)' }}>
              5. Service Availability
            </h3>
            <p className="mt-1" style={{ color: 'var(--secondary-text-color)' }}>
              TrendVault is provided "as is" without warranties. We do not guarantee uninterrupted
              service and are not liable for data loss or service outages.
            </p>
          </section>
        </div>

        {!isScrolledToBottom && (
          <p
            className="mt-2"
            style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}
          >
            Please scroll to the bottom to enable the Accept button
          </p>
        )}

        {error && (
          <div
            className="mt-4 rounded-md p-3"
            style={{
              backgroundColor: 'var(--negative-color-selected)',
              font: 'var(--font-text2-normal)',
              color: 'var(--negative-color)',
            }}
          >
            <p style={{ font: 'var(--font-text2-medium)' }}>Error</p>
            <p>{error}</p>
            <Button onClick={handleAccept} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleAccept}
            disabled={!isScrolledToBottom || acceptTos.isPending}
            className="flex-1"
          >
            {acceptTos.isPending ? 'Accepting...' : 'Accept & Continue'}
          </Button>
          <Button onClick={handleViewFullTerms} variant="outline">
            View Full Terms
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}

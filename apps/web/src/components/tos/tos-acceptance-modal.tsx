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

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    setIsScrolledToBottom(isAtBottom);
  };

  const handleAccept = async () => {
    await acceptTos.mutateAsync();
  };

  const handleViewFullTerms = () => {
    navigate('/legal/terms-of-service');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-2xl bg-card p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-foreground">Terms of Service</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please review and accept our Terms of Service to continue
        </p>

        <div
          className="mt-6 max-h-96 space-y-4 overflow-y-auto rounded-md border border-border bg-muted/50 p-4 text-sm text-foreground"
          onScroll={handleScroll}
        >
          <section>
            <h3 className="font-semibold">1. Content Responsibility</h3>
            <p className="mt-1 text-muted-foreground">
              You are solely responsible for any content you download, upload, or cross-post through
              TrendVault. You must own or have the necessary rights to all content you distribute.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">2. Platform Compliance</h3>
            <p className="mt-1 text-muted-foreground">
              You agree to comply with YouTube, TikTok, and all third-party platform Terms of
              Service. TrendVault is not responsible for violations of platform policies.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">3. Account Security</h3>
            <p className="mt-1 text-muted-foreground">
              You are responsible for maintaining the confidentiality of your OAuth tokens and API
              credentials. Notify us immediately if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">4. Prohibited Content</h3>
            <p className="mt-1 text-muted-foreground">
              You may not use TrendVault to distribute illegal, harmful, or copyright-infringing
              content. We reserve the right to terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">5. Service Availability</h3>
            <p className="mt-1 text-muted-foreground">
              TrendVault is provided "as is" without warranties. We do not guarantee uninterrupted
              service and are not liable for data loss or service outages.
            </p>
          </section>
        </div>

        {!isScrolledToBottom && (
          <p className="mt-2 text-xs text-muted-foreground">
            Please scroll to the bottom to enable the Accept button
          </p>
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
        </div>
      </Card>
    </div>
  );
}

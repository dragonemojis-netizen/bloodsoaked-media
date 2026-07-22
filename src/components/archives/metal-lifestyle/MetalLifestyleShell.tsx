import {
  MetalLifestyleHeader,
} from "@/components/archives/metal-lifestyle/MetalLifestyleHeader";
import { MetalLifestylePreservationBanner } from "@/components/archives/metal-lifestyle/MetalLifestylePreservationBanner";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface MetalLifestyleShellProps {
  children: React.ReactNode;
  activeHref?: string;
  withSidebar?: boolean;
  sidebar?: React.ReactNode;
}

export function MetalLifestyleShell({
  children,
  activeHref = METAL_LIFESTYLE_BASE,
  withSidebar = false,
  sidebar,
}: MetalLifestyleShellProps) {
  return (
    <div className="ml-archive">
      <MetalLifestylePreservationBanner />
      <div className="ml-body-wrap">
        <div className="ml-bg-wrapper">
          <MetalLifestyleHeader activeHref={activeHref} />
          <div className="ml-container">
            {withSidebar ? (
              <div className="ml-blog-layout">
                <div className="ml-blog-main">{children}</div>
                {sidebar}
              </div>
            ) : (
              children
            )}
          </div>
          <footer className="ml-footer">
            <div className="ml-footer-content">
              <p>Copyright © Metal Lifestyle — preserved archive</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

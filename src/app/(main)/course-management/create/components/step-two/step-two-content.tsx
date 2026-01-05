import { Row, Col, Affix, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { CourseCurriculumTree } from "./course-curriculum-tree";
import { StepTwoRightPane } from "./step-two-right-pane";

interface Props {
  isPreview?: boolean;
  sentinelId?: string;
}

export const StepTwoContent = ({ isPreview = false, sentinelId }: Props) => {
  const anchorPrefix = isPreview ? "preview-anchor" : "anchor";
  const anchorRootId = isPreview
    ? "step-two-preview-root"
    : "step-two-edit-root";
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [affixEnabled, setAffixEnabled] = useState(true);

  useEffect(() => {
    if (!isPreview) return undefined;
    let frameId: number | null = null;

    const getSentinel = () =>
      sentinelId ? document.getElementById(sentinelId) : sentinelRef.current;

    const updateAffix = () => {
      const el = getSentinel();
      if (!el) {
        setAffixEnabled(true);
        return;
      }
      const { top } = el.getBoundingClientRect();
      const cutoff = 200;
      setAffixEnabled(top > cutoff);
    };

    const onScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateAffix);
    };

    updateAffix();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateAffix);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateAffix);
    };
  }, [isPreview, sentinelId]);

  const treeContent = (
    <div className="max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
      <div className="mb-3 font-bold text-gray-500 uppercase text-xs tracking-wider">
        Mục lục khóa học
      </div>
      <CourseCurriculumTree
        isPreview={isPreview}
        anchorPrefix={anchorPrefix}
        anchorRootId={anchorRootId}
      />
    </div>
  );

  const leftTree = useMemo(() => {
    if (isPreview) {
      return affixEnabled ? (
        <Affix offsetTop={100}>{treeContent}</Affix>
      ) : (
        treeContent
      );
    }
    return <Affix offsetTop={100}>{treeContent}</Affix>;
  }, [affixEnabled, isPreview, treeContent]);

  return (
    <div className="animate-fade-in pb-10">
      {isPreview && (
        <div className="text-center mb-6">
          <Typography.Title level={4} className="text-gray-700 m-0">
            Nội dung khóa học
          </Typography.Title>
        </div>
      )}
      <Row gutter={[16, 24]} className="w-full">
        <Col xs={0} md={0} lg={7} className="hidden lg:block">
          {leftTree}
        </Col>

        <Col xs={24} md={24} lg={17}>
          <StepTwoRightPane
            isPreview={isPreview}
            anchorPrefix={anchorPrefix}
            anchorRootId={anchorRootId}
          />
        </Col>
      </Row>
      {isPreview && !sentinelId && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
};

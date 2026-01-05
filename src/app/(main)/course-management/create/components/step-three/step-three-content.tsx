import { useState, useCallback } from "react";
import { Row, Col, Affix, Typography } from "antd";
import { QuizSidebarTree } from "./quiz-sidebar-tree";
import { StepThreeRightPane } from "./step-three-right-pane";

interface Props {
  isPreview?: boolean;
}

export const StepThreeContent = ({ isPreview = false }: Props) => {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const handleSelectNode = useCallback(
    (key: string, options?: { scroll?: boolean }) => {
      setSelectedNodeKey(key);
      if (options?.scroll === false) return;

      setTimeout(() => {
        const element = document.getElementById(`anchor-quiz-lesson-${key}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    },
    []
  );

  const treeContent = (
    <QuizSidebarTree onSelectNode={handleSelectNode} isPreview={isPreview} />
  );

  return (
    <div className="step-three-wrapper">
      {isPreview && (
        <div className="text-center mb-6">
          <Typography.Title level={4} className="text-gray-700 m-0">
            Bài kiểm tra
          </Typography.Title>
        </div>
      )}
      <Row gutter={[16, 24]} className="w-full">
        <Col xs={0} md={6} lg={7} className="hidden md:block">
          <Affix offsetTop={120}>{treeContent}</Affix>
        </Col>
        <Col xs={24} md={18} lg={17}>
          <StepThreeRightPane
            selectedKey={selectedNodeKey}
            onSelectNode={handleSelectNode}
            isPreview={isPreview}
          />
        </Col>
      </Row>
    </div>
  );
};

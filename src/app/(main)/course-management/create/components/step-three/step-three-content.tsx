import { useState, useCallback } from "react";
import { Row, Col, Affix } from "antd";
import { QuizSidebarTree } from "./quiz-sidebar-tree";
import { StepThreeRightPane } from "./step-three-right-pane";
export const StepThreeContent = () => {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const handleSelectNode = useCallback((key: string) => {
    setSelectedNodeKey(key);
  }, []);
  return (
    <div className="step-three-wrapper">
      <Row gutter={24}>
        <Col span={7} className="hidden md:block">
          <Affix offsetTop={120}>
            {}
            <QuizSidebarTree onSelectNode={handleSelectNode} />
          </Affix>
        </Col>
        <Col span={17} xs={24} md={17}>
          {}
          <StepThreeRightPane selectedKey={selectedNodeKey} />
        </Col>
      </Row>
    </div>
  );
};

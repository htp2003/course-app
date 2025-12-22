import { Row, Col, Affix } from "antd";
import { CourseCurriculumTree } from "./course-curriculum-tree";
import { StepTwoRightPane } from "./step-two-right-pane";

export const StepTwoContent = () => {
  return (
    <div className="animate-fade-in pb-10">
      <Row gutter={24}>
        <Col xs={24} lg={7}>
          <Affix offsetTop={120}>
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-3 font-bold text-gray-500 uppercase text-xs tracking-wider">
                Mục lục khóa học
              </div>
              <CourseCurriculumTree />
            </div>
          </Affix>
        </Col>

        <Col xs={24} lg={17}>
          <StepTwoRightPane />
        </Col>
      </Row>
    </div>
  );
};

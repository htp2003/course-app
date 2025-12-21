import { memo } from "react";
import { Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { LessonQuizGroup } from "./lesson-quiz-group";
interface Props {
  selectedKey: string | null;
}
export const StepThreeRightPane = memo(({ selectedKey }: Props) => {
  if (!selectedKey) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] bg-white rounded-lg border border-dashed border-gray-300">
        <BookOutlined className="text-4xl text-gray-300 mb-4" />
        <Typography.Text type="secondary">
          Vui lòng chọn một <strong>Bài học</strong> từ danh sách bên trái để
          thiết lập bài kiểm tra.
        </Typography.Text>
      </div>
    );
  }
  const [cIdx, lIdx] = selectedKey.split("-").map(Number);
  return (
    <div className="flex flex-col gap-8 pb-20 animate-fade-in">
      
      <LessonQuizGroup chapterIndex={cIdx} lessonIndex={lIdx} />
    </div>
  );
});

import { Collapse, Tag, Typography, List, Empty, Image, Card } from "antd";
import { ProfileOutlined, FieldTimeOutlined } from "@ant-design/icons";
import type { ICreateCourseForm } from "../common/types/types";
import { COURSE_CATEGORIES } from "../common/constants/constants";
import { getLabelFromValue } from "../common/utils/utils";
import { QuizList } from "./quiz-list/quiz-list";
import { LessonPreview } from "./lesson-preview/lesson-preview";

const { Title } = Typography;
const { Panel } = Collapse;

interface Props {
  data: ICreateCourseForm;
  hideHeader?: boolean;
}

export const CourseContentPreview = ({ data, hideHeader = false }: Props) => {
  if (!data || !data.title) return <Empty description="Đang tải dữ liệu..." />;

  const allChapterKeys = data.chapters?.map((c, index) => c.id || index) || [];

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {!hideHeader && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Image
              src={
                Array.isArray(data.thumbnail) && data.thumbnail.length > 0
                  ? data.thumbnail[0].url
                  : undefined
              }
              alt="Ảnh bìa khóa học"
              className="rounded-lg object-cover w-full h-full min-h-[200px]"
              preview={false}
            />
          </div>
          <div className="flex-1">
            <div className="flex gap-2 mb-3 flex-wrap">
              {Array.isArray(data.categories) && data.categories.length > 0 ? (
                (data.categories as Array<number | string>).map((cat) => (
                  <Tag
                    key={String(cat)}
                    color="geekblue"
                    className="rounded-md px-2 font-medium"
                  >
                    {getLabelFromValue(Number(cat), COURSE_CATEGORIES)}
                  </Tag>
                ))
              ) : data.category ? (
                <Tag color="geekblue" className="rounded-md px-2 font-medium">
                  {data.category}
                </Tag>
              ) : null}
              {data?.id && (
                <Tag color="cyan" className="rounded-md px-2 font-medium">
                  ID: {data?.id}
                </Tag>
              )}
            </div>
            <Title
              level={1}
              className="mt-0 mb-4 text-gray-900 font-extrabold text-2xl md:text-3xl"
            >
              {data.title}
            </Title>

            {data.description && (
              <div
                className="text-gray-600 prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border border-gray-100"
                dangerouslySetInnerHTML={{
                  __html: data.description,
                }}
              />
            )}

            <div className="flex gap-6 mt-4 text-gray-500 font-medium border-t border-gray-100 pt-4">
              <span className="flex items-center gap-2">
                <ProfileOutlined /> {data.chapters?.length || 0} Chương
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Title
          level={3}
          className="text-gray-800 m-0 pl-2 border-l-4 border-blue-600"
        >
          Nội dung khóa học
        </Title>

        <Collapse
          ghost
          defaultActiveKey={allChapterKeys}
          expandIconPosition="end"
          className="bg-transparent"
        >
          {data.chapters?.map((chapter, index) => (
            <Panel
              key={chapter.id || index}
              header={
                <div className="py-2">
                  <div className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                    {chapter.title}
                  </div>
                  <div className="text-xs text-gray-500 font-normal mt-1">
                    {chapter.lessons?.length || 0} bài học
                  </div>
                </div>
              }
              className="bg-white mb-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-2 md:px-4">
                <List
                  itemLayout="vertical"
                  dataSource={chapter.lessons}
                  renderItem={(lesson) => <LessonPreview lesson={lesson} />}
                  locale={{ emptyText: "Chưa có bài học trong chương này" }}
                />
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>

      {data.exams && data.exams.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <Title
            level={3}
            className="text-gray-800 m-0 pl-2 border-l-4 border-red-600"
          >
            Bài kiểm tra
          </Title>

          <div className="space-y-6">
            {data.exams.map((exam, idx) => (
              <Card
                key={exam.id || idx}
                className="shadow-sm border-gray-200 rounded-xl border-t-4 border-t-red-500"
                title={
                  <span className="text-lg font-bold text-red-700 flex items-center gap-2">
                    <FieldTimeOutlined /> {exam.title}
                  </span>
                }
              >
                {exam.description && (
                  <div className="text-gray-500 italic mb-4">
                    {exam.description}
                  </div>
                )}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="font-bold text-red-800 mb-4 border-b border-red-200 pb-2">
                    Danh sách câu hỏi ({exam.quizzes?.length || 0} câu)
                  </div>
                  <QuizList quizzes={exam.quizzes} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { Collapse, Tag, Typography, List, Empty, Image, Card } from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ProfileOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import type {
  ICreateCourseForm,
  ILesson,
  IQuiz,
  IAnswerOption,
} from "../common/types/types";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  data: ICreateCourseForm;
}

const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

export const CourseContentPreview = ({ data }: Props) => {
  if (!data || !data.title) return <Empty description="Đang tải dữ liệu..." />;

  const renderLessonItem = (lesson: ILesson) => (
    <List.Item className="flex-col items-start border-b border-gray-100 last:border-0 px-4 py-4 hover:bg-slate-50 transition-colors">
      <div className="w-full flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {lesson.videoUrl ? (
            <PlayCircleOutlined className="text-blue-600 text-2xl" />
          ) : (
            <FileTextOutlined className="text-orange-500 text-2xl" />
          )}
          <div>
            <Text strong className="text-gray-800 text-lg block leading-tight">
              {lesson.title}
            </Text>
            {lesson.videoUrl && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:underline mt-1 block"
              >
                Link nguồn video
              </a>
            )}
          </div>
        </div>
      </div>

      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="w-full mt-2 pl-2 md:pl-10">
          <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 text-indigo-700 font-bold text-base">
              <CheckCircleOutlined />
              <span>Bài tập củng cố ({lesson.quizzes.length} câu)</span>
            </div>

            <div className="space-y-6">
              {lesson.quizzes.map((quiz: IQuiz, qIdx: number) => (
                <div
                  key={quiz.id || qIdx}
                  className="group pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="font-semibold text-gray-800 text-sm mb-3 flex gap-2">
                    <span className="text-indigo-600 shrink-0">
                      Câu {qIdx + 1}:
                    </span>
                    <span>{quiz.title}</span>
                  </div>

                  <div className="space-y-2 pl-4 mb-3">
                    {quiz.options?.map((opt: IAnswerOption, oIdx: number) => {
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={opt.id || oIdx}
                          className={`
                                      flex items-start gap-3 p-2 rounded-lg border text-sm transition-all
                                      ${
                                        isCorrect
                                          ? "bg-green-50 border-green-200 text-green-800"
                                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                      }
                                    `}
                        >
                          <div
                            className={`
                                          w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5
                                          ${
                                            isCorrect
                                              ? "bg-green-200 text-green-800"
                                              : "bg-gray-100 text-gray-500"
                                          }
                                        `}
                          >
                            {getOptionLabel(oIdx)}
                          </div>
                          <div className="flex-1">
                            <span>{opt.content}</span>
                            {isCorrect && (
                              <CheckCircleOutlined className="ml-2 text-green-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {quiz.explanation && (
                    <div className="pl-4">
                      <Collapse
                        ghost
                        size="small"
                        className="bg-orange-50/50 rounded-lg border border-orange-100"
                      >
                        <Panel
                          header={
                            <div className="flex items-center gap-2 text-orange-600 text-xs font-medium">
                              <BulbOutlined /> Xem giải thích
                            </div>
                          }
                          key="1"
                        >
                          <div className="text-sm text-gray-600 italic pl-6 border-l-2 border-orange-300">
                            {quiz.explanation}
                          </div>
                        </Panel>
                      </Collapse>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </List.Item>
  );

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Image
            src={
              Array.isArray(data.thumbnail) && data.thumbnail.length
                ? data.thumbnail[0].url || data.thumbnail[0].thumbUrl
                : "https://placehold.co/600x400?text=No+Banner"
            }
            className="rounded-lg object-cover w-full h-full min-h-[200px]"
            fallback="https://placehold.co/600x400?text=Error"
          />
        </div>
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <Tag color="geekblue" className="px-3 py-0.5 rounded-full">
              {data.category}
            </Tag>
            <Tag
              color={data.status === 2 ? "success" : "warning"}
              className="px-3 py-0.5 rounded-full"
            >
              {data.status === 2 ? "Đang phát hành" : "Chờ duyệt/Nháp"}
            </Tag>
          </div>
          <Title level={2} className="mt-0 mb-3 text-indigo-950 font-bold">
            {data.title}
          </Title>

          <div
            className="text-gray-600 prose prose-sm max-w-none line-clamp-3 mb-5"
            dangerouslySetInnerHTML={{ __html: data.description || "" }}
          />

          <div className="flex gap-6 text-gray-500 font-medium border-t border-gray-100 pt-4">
            <span className="flex items-center gap-2">
              <ProfileOutlined /> {data.chapters?.length || 0} Chương
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleOutlined />{" "}
              {data.chapters?.reduce(
                (acc, c) => acc + (c.lessons?.length || 0),
                0
              )}{" "}
              Bài học
            </span>
          </div>
        </div>
      </div>

      <Card
        title={
          <span className="text-xl font-bold text-gray-800">
            Nội dung khóa học
          </span>
        }
        className="shadow-sm border-gray-200"
        bodyStyle={{ padding: 0 }}
      >
        <Collapse
          ghost
          defaultActiveKey={data.chapters?.map((c) => c.id)}
          expandIconPosition="end"
        >
          {data.chapters?.map((chapter) => (
            <Panel
              key={chapter.id}
              header={
                <div className="py-2">
                  <div className="text-lg font-bold text-gray-800">
                    {chapter.title}
                  </div>
                  <div className="text-xs text-gray-400 font-normal">
                    {chapter.lessons?.length || 0} bài học
                  </div>
                </div>
              }
              className="border-b border-gray-100 last:border-0"
            >
              <List
                dataSource={chapter.lessons}
                renderItem={renderLessonItem}
                locale={{ emptyText: "Chưa có bài học trong chương này" }}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
};

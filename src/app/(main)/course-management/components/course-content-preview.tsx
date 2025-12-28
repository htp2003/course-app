import { Collapse, Tag, Typography, List, Empty, Image, Card } from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ProfileOutlined,
  BulbOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type {
  ICreateCourseForm,
  ILesson,
  IQuiz,
  IDocument,
} from "../common/types/types";
import { COURSE_CATEGORIES } from "../common/constants/constants";
import { getLabelFromValue } from "../common/utils/utils";

interface IUploadResponse {
  result?: {
    rawUrl?: string;
    url?: string;
    uri?: string;
    compressUrl?: string;
  };
  data?: {
    rawUrl?: string;
    url?: string;
    uri?: string;
  };
  uri?: string;
  url?: string;
}

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  data: ICreateCourseForm;
}

const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

export const CourseContentPreview = ({ data }: Props) => {
  if (!data || !data.title) return <Empty description="Đang tải dữ liệu..." />;

  const allChapterKeys = data.chapters?.map((c, index) => c.id || index) || [];

  const renderQuizList = (quizzes: IQuiz[] | undefined) => {
    if (!quizzes || quizzes.length === 0) return null;

    return (
      <div className="space-y-4 mt-3">
        {quizzes.map((quiz, qIdx) => (
          <div
            key={quiz.id || qIdx}
            className="group p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-indigo-200 transition-all"
          >
            <div className="font-semibold text-gray-800 text-sm mb-3 flex gap-2">
              <span className="text-indigo-600 shrink-0 font-bold">
                Câu {qIdx + 1}:
              </span>
              <span className="whitespace-pre-wrap">
                {quiz.title || quiz.content || "Nội dung câu hỏi"}
              </span>
            </div>

            <div className="space-y-2 pl-0 md:pl-4">
              {quiz.options?.map((opt, oIdx) => {
                const isCorrect = opt.isCorrect;
                return (
                  <div
                    key={opt.id || oIdx}
                    className={`
                      flex items-start gap-3 p-2 rounded border text-sm transition-colors
                      ${isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-100"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5
                        ${isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {getOptionLabel(oIdx)}
                    </div>
                    <div className="flex-1">
                      <span
                        className={
                          isCorrect ? "font-medium text-green-900" : ""
                        }
                      >
                        {opt.content}
                      </span>
                      {isCorrect && (
                        <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">
                          ĐÁP ÁN ĐÚNG
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {quiz.explanation && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-md text-sm text-gray-600">
                <div className="flex items-center gap-1 text-orange-600 font-bold text-xs uppercase mb-1">
                  <BulbOutlined /> Giải thích:
                </div>
                <div className="italic">{quiz.explanation}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderLessonItem = (lesson: ILesson) => (
    <List.Item className="flex-col items-start px-0 py-6 border-b border-gray-100 last:border-0 w-full">
      <div className="w-full flex gap-4 mb-3">
        <div className="flex-shrink-0 mt-1">
          {lesson.videoUrl ? (
            <PlayCircleOutlined className="text-blue-600 text-2xl" />
          ) : (
            <FileTextOutlined className="text-orange-500 text-2xl" />
          )}
        </div>
        <div className="flex-1">
          <Text className="text-gray-900 text-lg font-bold block mb-1">
            {lesson.title}
          </Text>
          {lesson.videoUrl && (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1"
            >
              <PlayCircleOutlined /> Xem Video bài giảng
            </a>
          )}
        </div>
      </div>

      {lesson.description && (
        <div className="w-full pl-0 md:pl-11 mb-4">
          <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm text-gray-600">
            <div className="flex items-center gap-2 font-semibold mb-1 text-gray-700 text-xs uppercase tracking-wide">
              <InfoCircleOutlined /> Mô tả bài học
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: lesson.description }}
            />
          </div>
        </div>
      )}

      {lesson.documents && lesson.documents.length > 0 && (
        <div className="w-full pl-0 md:pl-11 mb-5">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
            Tài liệu đính kèm:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.documents.map((doc: IDocument, idx) => (
              <a
                key={idx}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-md flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                  <FilePdfOutlined style={{ fontSize: "20px" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600">
                    {doc.name || "Tài liệu không tên"}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Nhấn để xem hoặc tải về
                  </div>
                </div>
                <DownloadOutlined className="text-gray-300 group-hover:text-blue-500" />
              </a>
            ))}
          </div>
        </div>
      )}

      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="w-full pl-2 md:pl-11 mb-4">
          <div className="bg-indigo-50/50 border-l-4 border-indigo-500 pl-4 py-3 rounded-r-lg">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-base">
              <CheckCircleOutlined />
              <span>Bài kiểm tra ({lesson.quizzes.length} câu)</span>
            </div>
            {renderQuizList(lesson.quizzes)}
          </div>
        </div>
      )}

      {lesson.exams && lesson.exams.length > 0 && (
        <div className="w-full pl-2 md:pl-11 mt-2">
          {lesson.exams.map((exam, idx) => (
            <Card
              key={exam.id || idx}
              className="mb-6 border-red-200 shadow-sm"
              headStyle={{
                backgroundColor: "#fff1f0",
                color: "#cf1322",
                fontSize: "15px",
                borderBottom: "1px solid #ffa39e",
              }}
              title={
                <div className="flex items-center gap-2">
                  <FieldTimeOutlined />
                  <span>{exam.title || "Bài kiểm tra"}</span>
                </div>
              }
              size="small"
            >
              {exam.description && (
                <div className="text-gray-500 italic mb-4 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                  {exam.description}
                </div>
              )}

              <div className="font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                Danh sách câu hỏi ({exam.quizzes?.length || 0} câu):
              </div>

              {renderQuizList(exam.quizzes)}
            </Card>
          ))}
        </div>
      )}
    </List.Item>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <Image
            src={
              Array.isArray(data.thumbnail) && data.thumbnail.length > 0
                ? (() => {
                  const thumb = data.thumbnail[0];
                  // Try URL first
                  if (thumb.url) return thumb.url;
                  // Try response paths
                  const resp = thumb.response as IUploadResponse | undefined;
                  if (resp?.result?.rawUrl) return resp.result.rawUrl;
                  if (resp?.result?.url) return resp.result.url;
                  if (resp?.data?.url) return resp.data.url;
                  // Fallback to thumbUrl
                  return thumb.thumbUrl || "https://placehold.co/600x400?text=No+Banner";
                })()
                : "https://placehold.co/600x400?text=No+Banner"
            }
            className="rounded-lg object-cover w-full h-full min-h-[200px]"
            fallback="https://placehold.co/600x400?text=Error"
          />
        </div>
        <div className="flex-1">
          <div className="flex gap-2 mb-3 flex-wrap">
            {Array.isArray((data as any).categories) && (data as any).categories.length > 0 ? (
              ((data as any).categories as Array<number | string>).map((cat) => (
                <Tag key={String(cat)} color="geekblue" className="rounded-md px-2 font-medium">
                  {getLabelFromValue(Number(cat), COURSE_CATEGORIES)}
                </Tag>
              ))
            ) : (
              <Tag color="geekblue" className="rounded-md px-2 font-medium">Chung</Tag>
            )}
            {data.id && (
              <Tag color="cyan" className="rounded-md px-2 font-medium">
                ID: {data.id}
              </Tag>
            )}
          </div>
          <Title
            level={1}
            className="mt-0 mb-4 text-gray-900 font-extrabold text-2xl md:text-3xl"
          >
            {data.title}
          </Title>

          <div
            className="text-gray-600 prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg border border-gray-100"
            dangerouslySetInnerHTML={{
              __html: data.description || "<i>Chưa có mô tả</i>",
            }}
          />

          <div className="flex gap-6 mt-4 text-gray-500 font-medium border-t border-gray-100 pt-4">
            <span className="flex items-center gap-2">
              <ProfileOutlined /> {data.chapters?.length || 0} Chương
            </span>
          </div>
        </div>
      </div>

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
                  renderItem={renderLessonItem}
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
            Bài kiểm tra cuối khóa
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
                  {renderQuizList(exam.quizzes)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

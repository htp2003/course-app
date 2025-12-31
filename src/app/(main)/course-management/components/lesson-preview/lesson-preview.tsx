import { List, Card } from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ILesson, IDocument } from "../../common/types/types";
import { QuizList } from "../quiz-list/quiz-list";

interface Props {
  lesson: ILesson;
}

export const LessonPreview = ({ lesson }: Props) => (
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
        <span className="text-gray-900 text-lg font-bold block mb-1">
          {lesson.title}
        </span>
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
          <QuizList quizzes={lesson.quizzes} />
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

            <QuizList quizzes={exam.quizzes} />
          </Card>
        ))}
      </div>
    )}
  </List.Item>
);

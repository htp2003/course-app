import { useMemo } from "react";
import { Form, Typography, Empty, Button } from "antd";
import { CourseContentPreview } from "../../../components/course-content-preview";
import { CourseInfoSection } from "../step-one/course-info-section";
import type { UploadFile } from "antd/es/upload/interface";
import type {
  ICreateCourseForm,
  IChapter,
  ILesson,
  IDocument,
  IQuiz,
  IExam,
} from "../../../common/types/types";

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

const getPreviewUrl = (fileList: UploadFile[] | undefined): string => {
  if (!fileList || !Array.isArray(fileList) || fileList.length === 0) return "";
  const file = fileList[0];
  if (!file) return "";

  if (file.url) return file.url;
  if (file.preview) return file.preview;

  const response = file.response as IUploadResponse | undefined;
  if (response) {
    if (response.result?.rawUrl) return response.result.rawUrl;
    if (response.result?.compressUrl) return response.result.compressUrl;
    if (response.result?.url) return response.result.url;
    if (response.result?.uri) return response.result.uri;
    if (response.data?.rawUrl) return response.data.rawUrl;
    if (response.data?.url) return response.data.url;
    if (response.data?.uri) return response.data.uri;
    if (response.uri) return response.uri;
    if (response.url) return response.url;
  }

  if (file.originFileObj) {
    try {
      return URL.createObjectURL(file.originFileObj as Blob);
    } catch {
    }
  }

  return "";
};

const flattenQuizzesToQuestions = (quizzes: IQuiz[] | undefined): IQuiz[] => {
  if (!quizzes || quizzes.length === 0) return [];

  return quizzes.flatMap((quizGroup) => {
    if (quizGroup.questions && quizGroup.questions.length > 0) {
      return quizGroup.questions.map((q) => ({
        id: q.id,
        title: q.title || "Câu hỏi chưa đặt tên",
        options: q.options,
        explanation: q.explanation,
        type: quizGroup.type,
      }));
    }
    return [quizGroup];
  });
};

export const StepFourContent = () => {
  const form = Form.useFormInstance();
  const rawData = Form.useWatch([], form) as ICreateCourseForm;

  const previewData = useMemo(() => {
    if (!rawData) return null;

    const transformed: ICreateCourseForm = {
      ...rawData,
      thumbnail: rawData.thumbnail,

      chapters: (rawData.chapters || []).map((chapter: IChapter) => ({
        ...chapter,
        lessons: (chapter.lessons || []).map((lesson: ILesson) => {
          const videoUrl = getPreviewUrl(lesson.videoFile);

          const previewDocs: IDocument[] = [];
          const addDoc = (files: UploadFile[] | undefined, type: string) => {
            if (files && Array.isArray(files) && files.length > 0) {
              files.forEach((f) => {
                const url = getPreviewUrl([f]);
                if (f) {
                  previewDocs.push({
                    id: f.uid,
                    name: f.name || "Tài liệu",
                    url: url,
                    type,
                  });
                }
              });
            }
          };
          addDoc(lesson.docFile, "document");
          addDoc(lesson.slideFile, "slide");
          addDoc(lesson.refDocFile, "reference");

          const flatQuizzes = flattenQuizzesToQuestions(lesson.quizzes);

          return {
            ...lesson,
            videoUrl: videoUrl,
            documents: previewDocs,
            quizzes: flatQuizzes,
            exams: lesson.exams || [],
          };
        }),
      })),

      exams: (rawData.exams || []).map((exam: IExam) => ({
        ...exam,
        quizzes: flattenQuizzesToQuestions(exam.quizzes),
      })),
    };

    return transformed;
  }, [rawData]);

  if (!previewData) {
    return <Empty description="Chưa có dữ liệu" />;
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Typography.Title level={3} className="text-gray-700 m-0">
            Xem trước khóa học
          </Typography.Title>
          <Typography.Text type="secondary">
            Kiểm tra toàn bộ thông tin và nội dung khóa học trước khi xuất bản
          </Typography.Text>
        </div>

        {/* Step 1: Basic Information (Read-only) */}
        <CourseInfoSection readOnly={true} />

        {/* Course Content Preview */}
        <div className="text-center mb-6 mt-10">
          <Typography.Title level={4} className="text-gray-700 m-0">
            Nội dung & Bài học
          </Typography.Title>
        </div>

        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-dashed border-gray-300 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button size="small" type="dashed">
              Chế độ xem trước
            </Button>
          </div>

          <CourseContentPreview data={previewData} hideHeader={true} />
        </div>
      </div>
    </div>
  );
};

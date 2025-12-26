import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Spin, Typography, FloatButton } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

import { getCourseDetailRealAPI } from "./services/api";
import { CourseContentPreview } from "../components/course-content-preview";
import { COURSE_CATEGORIES } from "../common/constants/constants";

import type {
  ICreateCourseForm,
  ICourseDetailResponse,
  IApiQuiz,
  IApiChapter,
  IApiExam,
  IApiLesson,
  IExam,
  IDocument,
} from "../common/types/types";

const { Title } = Typography;

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course-detail", id],
    queryFn: () => getCourseDetailRealAPI(id!),
    enabled: !!id,
  });

  const apiData = response?.data as ICourseDetailResponse | undefined;

  const previewData: ICreateCourseForm | null = useMemo(() => {
    if (!apiData) return null;

    const mapQuizzes = (quizzes: IApiQuiz[] | undefined) => {
      if (!quizzes) return [];
      return quizzes.map((q) => ({
        id: q.id,
        title: q.content || q.title || "Câu hỏi không có tiêu đề",
        options: (q.quizAns || q.quizOptions || q.options || []).map((opt) => ({
          id: opt.id,
          content: opt.content,
          isCorrect: opt.isTrue ?? opt.isCorrect ?? false,
        })),
        explanation: q.explanation,
        type: q.type,
      }));
    };

    const mapExams = (exams: IApiExam[] | undefined) => {
      if (!exams) return [];
      return exams.map((ex) => ({
        id: ex.id,
        title: ex.title,
        description: ex.description,
        quizzes: mapQuizzes(ex.quizzes),
      }));
    };

    let allExams: IExam[] = [];

    if (apiData.exams) {
      allExams = [...allExams, ...mapExams(apiData.exams)];
    }

    if (apiData.chapters) {
      apiData.chapters.forEach((chapter) => {
        chapter.lessons?.forEach((lesson) => {
          if (lesson.exams && lesson.exams.length > 0) {
            allExams = [...allExams, ...mapExams(lesson.exams)];
          }
        });
      });
    }

    let categoryLabel = "Khác";
    if (apiData.topics) {
      const firstTopicId = String(apiData.topics).split(",")[0];
      const foundTopic = COURSE_CATEGORIES.find(
        (c) => c.value === Number(firstTopicId)
      );
      if (foundTopic) categoryLabel = foundTopic.label;
    }

    return {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      category: categoryLabel,
      status: apiData.timeStateType,

      thumbnail: apiData.bannerUri
        ? [
            {
              uid: "-1",
              name: "banner",
              status: "done",
              url: apiData.bannerUri,
              thumbUrl: apiData.bannerUri,
            },
          ]
        : [],

      chapters: apiData.chapters?.map((ch: IApiChapter) => ({
        id: ch.id,
        title: ch.title,
        lessons: ch.lessons?.map((les: IApiLesson) => ({
          id: les.id,
          title: les.title,
          description: les.description,documents: les.lessonFiles?.map((f) => ({
            id: f.mediaFile?.id || f.id,
            name: f.mediaFile?.fileName || "Tài liệu không tên",
            url: f.mediaFile?.uri || "",
          })).filter(d => d.url) as IDocument[],
          videoUrl: les.mediaUri || les.videoUrl,

          quizzes: mapQuizzes(les.quizzes),

          exams: mapExams(les.exams),
          

          type: les.type,
        })),
      })),

      exams: allExams,

      startTime: apiData.startTime,
      endTime: apiData.endTime,
    } as unknown as ICreateCourseForm;
  }, [apiData]);

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  if (isError || !apiData)
    return <div className="p-10 text-center text-red-500">Lỗi dữ liệu</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/course-management/list")}
        >
          Quay lại danh sách
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/course-management/create?id=${id}`)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <div className="mb-8 text-center">
        <Title level={3} className="text-gray-500 m-0 uppercase tracking-wide">
          Chi tiết khóa học
        </Title>
        <div className="text-gray-400 text-xs mt-1">ID: {id}</div>
      </div>

      {previewData && <CourseContentPreview data={previewData} />}

      <FloatButton.BackTop />
    </div>
  );
};

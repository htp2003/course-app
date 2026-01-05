import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type {
    ICreateCourseForm,
    IChapter,
    ILesson,
    IDocument,
    IExam,
    IQuiz,
    IAnswerOption,
    IQuestion,
    LessonTypeType,
    QuestionType,
} from "../../common/types/types";
import type {
    TCourseDetailResponse,
    TApiLesson,
    TApiExam,
    TApiQuiz,
    TApiQuizAns,
} from "../../common/types/api-response";
import {
    COURSE_END_PRIZE,
    COURSE_TIME_STATE_TYPE,
    API_LESSON_TYPE,
    API_QUESTION_TYPE,
} from "../../common/constants/constants";

/**
 * Map API response to form structure for preview
 */
export const mapCourseDetailToForm = (apiData: TCourseDetailResponse["data"]): ICreateCourseForm => {
    const mapLessonType = (type?: number): LessonTypeType => {
        if (type === API_LESSON_TYPE.DOCUMENT) return "document";
        if (type === API_LESSON_TYPE.SLIDE) return "slide";
        return "video";
    };

    const mapQuestionType = (type?: number): QuestionType => {
        return type === API_QUESTION_TYPE.ESSAY ? "essay" : "choice";
    };

    const mapAnswerOptions = (quizAns?: TApiQuizAns[]): IAnswerOption[] => {
        if (!quizAns || quizAns.length === 0) return [];
        return quizAns.map((ans) => ({
            id: ans.id,
            content: ans.content || "",
            isCorrect: Boolean(ans.isTrue),
        }));
    };

    const mapQuizToQuestion = (quiz: TApiQuiz, index: number): IQuestion => {
        const options = mapAnswerOptions(quiz.quizAns);
        const correctCount = options.filter((o) => o.isCorrect).length;

        return {
            id: quiz.id,
            title: quiz.content || `Câu hỏi ${index + 1}`,
            type: mapQuestionType(quiz.type),
            isMultipleChoice: correctCount > 1,
            options,
            explanation: quiz.explanation || "",
            score: 1,
        };
    };

    const mapExamQuizzes = (quizzes: TApiQuiz[]): IQuiz[] => {
        if (!quizzes || quizzes.length === 0) return [];

        return quizzes.map((quiz, idx) => ({
            id: quiz.id || `quiz-${idx}`,
            title: quiz.content || `Câu hỏi ${idx + 1}`,
            content: quiz.content || "",
            options: mapAnswerOptions(quiz.quizAns),
            explanation: quiz.explanation || "",
            type: quiz.type,
        }));
    };

    const mapExams = (exams: TApiExam[]): IExam[] => {
        if (!exams || exams.length === 0) return [];

        return exams.map((exam, idx) => ({
            id: exam.id || exam.itemId || `exam-${idx}`,
            title: exam.title || `Bài kiểm tra ${idx + 1}`,
            description: "",
            quizzes: mapExamQuizzes(exam.quizzes || []),
        }));
    };

    const mapLessonDocuments = (lesson: TApiLesson): IDocument[] => {
        const documentFiles = (lesson.lessonFiles || []).filter((f) => f.type === 1);

        return documentFiles
            .filter((f) => f.mediaFile)
            .map((f) => ({
                id: f.mediaFile.id,
                name: f.mediaFile.fileName || "Tài liệu",
                url: f.mediaFile.uri || "",
            }))
            .filter((d) => d.url);
    };

    const getVideoUrl = (lesson: TApiLesson): string => {
        const videoFiles = (lesson.lessonFiles || []).filter(
            (f) => f.type === 2 && f.mediaFile
        );

        if (videoFiles.length > 0 && videoFiles[0].mediaFile) {
            return videoFiles[0].mediaFile.uri || "";
        }

        return "";
    };

    const mapLessons = (lessons: TApiLesson[]): ILesson[] => {
        return lessons.map((lesson) => {
            const questions = (lesson.exams || [])
                .flatMap((exam) => exam.quizzes || [])
                .map((quiz, qIdx) => mapQuizToQuestion(quiz, qIdx));

            const quizzes =
                questions.length > 0
                    ? [
                        {
                            id: `lesson-${lesson.id}-quiz`,
                            title: `Bài kiểm tra`,
                            questions,
                        },
                    ]
                    : [];

            return {
                id: lesson.id,
                title: lesson.title || "",
                description: lesson.description || "",
                type: mapLessonType(lesson.type),
                duration: 0,
                videoUrl: getVideoUrl(lesson),
                documents: mapLessonDocuments(lesson),
                quizzes,
                exams: mapExams(lesson.exams || []),
                refDocFile: [],
            };
        });
    };

    const chapters: IChapter[] = (apiData.chapters || []).map(
        (chapter) => ({
            id: chapter.id || chapter.courseId,
            title: chapter.title || "",
            lessons: mapLessons(chapter.lessons || []),
        })
    );

    const collectedExams: IExam[] = [];
    chapters.forEach((chapter) => {
        chapter.lessons?.forEach((lesson) => {
            if (lesson.exams && lesson.exams.length > 0) {
                collectedExams.push(...lesson.exams);
            }
        });
    });


    const parseTopics = (): number[] => {
        if (!apiData.topics) return [];
        return String(apiData.topics)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => Number(t));
    };

    const categories = parseTopics();

    const thumbnail = apiData.bannerUri
        ? [
            {
                uid: "-1",
                name: "banner",
                status: "done" as const,
                url: apiData.bannerUri,
                thumbUrl: apiData.bannerUri,
            },
        ]
        : [];

    const publishAt = apiData.publishAt ? dayjs(apiData.publishAt) : dayjs();
    const startTime = apiData.startTime ? dayjs(apiData.startTime) : undefined;
    const endTime = apiData.endTime ? dayjs(apiData.endTime) : undefined;

    const timeRange: [Dayjs, Dayjs] =
        startTime && endTime
            ? [startTime, endTime]
            : publishAt
                ? [publishAt, publishAt.add(30, "day")]
                : [dayjs(), dayjs().add(30, "day")];

    return {
        id: apiData.id,
        title: apiData.title || "",
        description: apiData.description || "",
        category: categories[0],
        categories,
        status: apiData.status,
        type: apiData.type ?? 1,
        timeStateType: apiData.timeStateType ?? COURSE_TIME_STATE_TYPE.CUSTOMIZE.value,
        isHasBadge: COURSE_END_PRIZE.NONE.value,
        isLearnInOrder: apiData.isLearnInOrder ?? true,
        publishAt,
        timeRange,
        courseBadgeFile: [],
        thumbnail,
        chapters,
        exams: collectedExams,
    };
};

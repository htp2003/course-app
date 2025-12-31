import { BulbOutlined } from "@ant-design/icons";
import type { IQuiz } from "../../common/types/types";

interface Props {
  quizzes: IQuiz[] | undefined;
}

const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

export const QuizList = ({ quizzes }: Props) => {
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
                    ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-100"
                    }
                  `}
                >
                  <div
                    className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5
                      ${
                        isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {getOptionLabel(oIdx)}
                  </div>
                  <div className="flex-1">
                    <span
                      className={isCorrect ? "font-medium text-green-900" : ""}
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

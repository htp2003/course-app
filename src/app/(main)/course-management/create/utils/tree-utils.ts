import type {
  IChapter,
  ILesson,
  IQuiz,
  IQuestion,
} from "../../common/types/types";

type TreeItem = IChapter | ILesson | IQuiz | IQuestion;
type TreeList = IChapter[] | ILesson[] | IQuiz[] | IQuestion[];

const LEVEL_KEYS: Record<number, keyof ITraversableNode> = {
  0: "lessons",
  1: "quizzes",
  2: "questions",
};

interface ITraversableNode {
  lessons?: ILesson[];
  quizzes?: IQuiz[];
  questions?: IQuestion[];
}

const parseKey = (key: string) => key.toString().split("-").map(Number);

const getListAtLevel = (
  root: IChapter[],
  path: number[],
  targetLevel: number
): TreeList | null => {
  if (targetLevel === 0) return root;
  let currentList: TreeList = root;
  for (let i = 0; i < targetLevel; i++) {
    const nodeIndex = path[i];
    const currentNode = currentList[nodeIndex] as ITraversableNode;
    if (!currentNode) return null;
    const childKey = LEVEL_KEYS[i];
    if (i < targetLevel) {
      if (!currentNode[childKey]) {
        if (childKey === "lessons") {
          currentNode.lessons = [] as ILesson[];
        } else if (childKey === "quizzes") {
          currentNode.quizzes = [] as IQuiz[];
        } else {
          currentNode.questions = [] as IQuestion[];
        }
      }
      currentList = (childKey === "lessons"
        ? currentNode.lessons
        : childKey === "quizzes"
          ? currentNode.quizzes
          : currentNode.questions) as TreeList;
    }
  }
  return currentList;
};

export const handleDropLogic = (
  currentData: IChapter[],
  dragKey: string,
  dropKey: string,
  dropPosition: number,
  nodePos: string
): IChapter[] | null => {
  const newChapters = structuredClone(currentData);
  const dragPath = parseKey(dragKey);
  const dropPath = parseKey(dropKey);
  const dragLevel = dragPath.length - 1;
  const dropLevel = dropPath.length - 1;

  if (dropLevel > dragLevel || dropLevel < dragLevel - 1) return null;

  const sourceList = getListAtLevel(newChapters, dragPath, dragLevel);

  if (!sourceList) return null;

  const dragIndex = dragPath[dragLevel];
  const dragItem = sourceList[dragIndex];
  sourceList.splice(dragIndex, 1);
  let targetList: TreeList | null = null;
  let targetIndex = 0;

  if (dragLevel === dropLevel) {
    targetList = getListAtLevel(newChapters, dropPath, dropLevel);
    const dropIndex = dropPath[dropLevel];
    targetIndex = dropIndex;
    const dropPosSplit = nodePos.split("-");
    const relativePos =
      dropPosition - Number(dropPosSplit[dropPosSplit.length - 1]);

    if (sourceList === targetList && dragIndex < dropIndex) targetIndex--;

    if (relativePos !== -1) targetIndex++;
  } else {
    targetList = getListAtLevel(newChapters, [...dropPath, 0], dragLevel);
  }

  if (targetList) {
    (targetList as TreeItem[]).splice(targetIndex, 0, dragItem);
    return newChapters;
  }
  return null;
};

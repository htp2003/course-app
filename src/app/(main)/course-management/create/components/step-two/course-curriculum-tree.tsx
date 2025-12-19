import { memo, useMemo } from "react";
import { Tree, Form, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { TreeProps } from "antd/es/tree";
import type {
  ICreateCourseForm,
  IChapter,
  ILesson,
} from "../../../common/types";
import { handleDropLogic } from "../../utils/tree-utils";
const treeNodeStyles = `
  .draggable-tree .ant-tree-node-content-wrapper {
    overflow: visible;
    max-width: 100%;
    word-break: break-word;
    white-space: normal;
  }
  .draggable-tree .ant-tree-title {
    overflow: visible;
    word-break: break-word;
    white-space: normal;
  }
`;
const hasStructureChanged = (
  prev: ICreateCourseForm,
  curr: ICreateCourseForm
) => {
  const pCh = prev.chapters || [];
  const cCh = curr.chapters || [];
  if (pCh.length !== cCh.length) return true;
  return pCh.some((ch: IChapter, idx: number) => {
    if (ch.title !== cCh[idx]?.title) return true;
    const pLes = ch.lessons || [];
    const cLes = cCh[idx]?.lessons || [];
    if (pLes.length !== cLes.length) return true;
    return pLes.some(
      (l: ILesson, lIdx: number) => l.title !== cLes[lIdx]?.title
    );
  });
};
interface TreeViewProps {
  chapters: IChapter[];
  onSelect: TreeProps["onSelect"];
  onDrop: TreeProps["onDrop"];
}
const TreeView = memo(({ chapters, onSelect, onDrop }: TreeViewProps) => {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed">
        <Typography.Text type="secondary">Chưa có nội dung</Typography.Text>
      </div>
    );
  }
  const treeData = useMemo(() => {
    return chapters.map((chapter: IChapter, cIdx: number) => ({
      key: `${cIdx}`,
      title: (
        <span className="font-semibold text-gray-700 block break-words whitespace-normal max-w-[350px]">
          {chapter.title || (
            <span className="text-gray-400 italic">Chương chưa đặt tên</span>
          )}
        </span>
      ),
      children: chapter.lessons?.map((lesson: ILesson, lIdx: number) => ({
        key: `${cIdx}-${lIdx}`,
        title: (
          <span className="block break-words whitespace-normal max-w-[400px]">
            {lesson.title || (
              <span className="text-gray-400 italic">Bài học mới</span>
            )}
          </span>
        ),
        isLeaf: true,
      })),
    }));
  }, [chapters]);
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
      <Tree
        className="draggable-tree"
        draggable
        blockNode
        showLine={{ showLeafIcon: false }}
        showIcon
        defaultExpandAll
        treeData={treeData}
        onSelect={onSelect}
        onDrop={onDrop}
        switcherIcon={<DownOutlined />}
      />
    </div>
  );
});
export const CourseCurriculumTree = () => {
  const form = Form.useFormInstance<ICreateCourseForm>();
  const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
    if (!selectedKeys.length) return;
    const key = selectedKeys[0].toString();
    const element = document.getElementById(`anchor-${key}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-blue-400");
      setTimeout(
        () => element.classList.remove("ring-2", "ring-blue-400"),
        1500
      );
    }
  };
  const onDrop: TreeProps["onDrop"] = (info) => {
    const data = form.getFieldValue("chapters") || [];
    const newChapters = handleDropLogic(
      data,
      info.dragNode.key.toString(),
      info.node.key.toString(),
      info.dropPosition,
      info.node.pos
    );
    if (newChapters) {
      form.setFieldValue("chapters", newChapters);
    }
  };
  return (
    <>
      <style>{treeNodeStyles}</style>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
        {}
        <Form.Item noStyle shouldUpdate={hasStructureChanged}>
          {({ getFieldValue }) => {
            const chapters = getFieldValue("chapters") as IChapter[];
            return (
              <TreeView
                chapters={chapters}
                onSelect={onSelect}
                onDrop={onDrop}
              />
            );
          }}
        </Form.Item>
      </div>
    </>
  );
};

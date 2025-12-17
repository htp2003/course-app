import React, { useState, useMemo, useReducer } from "react";
import {
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  Empty,
  Typography,
  Space,
  Modal,
  Collapse,
  Tooltip,
  Popconfirm,
  Upload,
  message,
  Radio,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  CaretRightOutlined,
  MenuOutlined,
  EditOutlined,
  InboxOutlined,
  FilePptOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Panel } = Collapse;
const { Dragger } = Upload;

export const StepTwoContent = () => {
  const form = Form.useFormInstance();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  // Lấy data chapters từ form
  const chapters = form.getFieldValue("chapters") || [];

  const [selected, setSelected] = useState<{
    type: "chapter" | "lesson";
    cIndex: number;
    lIndex?: number;
  } | null>(null);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    index: number | null;
  }>({
    open: false,
    title: "",
    index: null,
  });

  const genId = () => Math.random().toString(36).substr(2, 9);
  const getData = () =>
    JSON.parse(JSON.stringify(form.getFieldValue("chapters") || []));

  // --- CRUD ACTIONS ---
  const saveChapter = () => {
    if (!modal.title.trim()) return;
    const current = getData();

    if (modal.index !== null) {
      if (current[modal.index]) current[modal.index].title = modal.title;
    } else {
      const newId = genId();
      current.push({ id: newId, title: modal.title, lessons: [] });
      setActiveKeys((prev) => [...prev, newId]);
      setSelected({ type: "chapter", cIndex: current.length - 1 });
    }
    form.setFieldValue("chapters", current);
    setModal({ open: false, title: "", index: null });
    forceUpdate();
  };

  const deleteChapter = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getData();
    current.splice(idx, 1);
    form.setFieldValue("chapters", current);
    setSelected(null);
    forceUpdate();
  };

  const addLesson = (cIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getData();
    if (!current[cIndex]) return;
    if (!current[cIndex].lessons) current[cIndex].lessons = [];

    current[cIndex].lessons.push({
      id: genId(),
      title: "Bài học mới",
      type: "video",
      duration: 0,
    });

    form.setFieldValue("chapters", current);
    const chapId = current[cIndex].id;
    if (!activeKeys.includes(chapId))
      setActiveKeys((prev) => [...prev, chapId]);
    setSelected({
      type: "lesson",
      cIndex,
      lIndex: current[cIndex].lessons.length - 1,
    });
    forceUpdate();
  };

  const deleteLesson = (
    cIndex: number,
    lIndex: number,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const current = getData();
    if (current[cIndex]?.lessons) {
      current[cIndex].lessons.splice(lIndex, 1);
      form.setFieldValue("chapters", current);
      setSelected({ type: "chapter", cIndex });
      forceUpdate();
    }
  };

  // --- HANDLE UPLOAD FILE GIẢ LẬP ---
  const handleMockUpload = (
    file: File,
    cIndex: number,
    lIndex: number,
    fieldName: string
  ) => {
    message.loading({ content: "Đang tải file lên...", key: "upload" });

    setTimeout(() => {
      const current = getData();
      current[cIndex].lessons[lIndex][fieldName] = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type,
        status: "done",
        url: URL.createObjectURL(file),
      };

      form.setFieldValue("chapters", current);
      message.success({ content: "Tải lên thành công!", key: "upload" });
      forceUpdate();
    }, 1000);

    return false;
  };

  const removeFile = (cIndex: number, lIndex: number, fieldName: string) => {
    const current = getData();
    current[cIndex].lessons[lIndex][fieldName] = null;
    form.setFieldValue("chapters", current);
    forceUpdate();
  };

  // --- RENDER SIDEBAR ---
  const renderSidebar = useMemo(() => {
    if (!chapters || chapters.length === 0)
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có nội dung"
        />
      );

    return (
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        ghost
      >
        {chapters.map((chap: any, cIdx: number) => (
          <Panel
            key={chap.id || cIdx}
            header={
              <div
                className={`flex justify-between items-center group ${
                  selected?.type === "chapter" && selected.cIndex === cIdx
                    ? "text-indigo-600 font-bold"
                    : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected({ type: "chapter", cIndex: cIdx });
                }}
              >
                <span className="truncate">
                  {cIdx + 1}. {chap.title}
                </span>
                <Space onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Sửa tên">
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() =>
                        setModal({ open: true, title: chap.title, index: cIdx })
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Thêm bài">
                    <Button
                      size="small"
                      type="text"
                      icon={<PlusOutlined />}
                      className="text-blue-500"
                      onClick={(e) => addLesson(cIdx, e)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Xóa?"
                    onConfirm={(e: any) => deleteChapter(cIdx, e)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              </div>
            }
          >
            <div className="flex flex-col gap-1 pl-2">
              {chap.lessons?.map((les: any, lIdx: number) => {
                const isActive =
                  selected?.type === "lesson" &&
                  selected.cIndex === cIdx &&
                  selected.lIndex === lIdx;
                let Icon = VideoCameraOutlined;
                if (les.type === "document") Icon = FileTextOutlined;
                if (les.type === "slide") Icon = FilePptOutlined;

                return (
                  <div
                    key={les.id || lIdx}
                    onClick={() =>
                      setSelected({
                        type: "lesson",
                        cIndex: cIdx,
                        lIndex: lIdx,
                      })
                    }
                    className={`flex items-center p-2 rounded cursor-pointer text-sm ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="mr-2">
                      <Icon />
                    </span>
                    <span className="truncate flex-1">
                      {lIdx + 1}. {les.title}
                    </span>
                    {isActive && (
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => deleteLesson(cIdx, lIdx, e)}
                      />
                    )}
                  </div>
                );
              })}
              {(!chap.lessons || chap.lessons.length === 0) && (
                <div
                  className="text-xs text-gray-400 text-center py-2 border-dashed border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
                  onClick={(e) => addLesson(cIdx, e)}
                >
                  + Thêm bài học
                </div>
              )}
            </div>
          </Panel>
        ))}
      </Collapse>
    );
  }, [chapters, selected, activeKeys, ignored]);

  // --- RENDER EDITOR ---
  const renderEditor = () => {
    if (!selected)
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <FolderOpenOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <p>Chọn mục lục để chỉnh sửa</p>
        </div>
      );

    const { cIndex, lIndex } = selected;
    if (!chapters[cIndex]) return <Empty description="Dữ liệu không tồn tại" />;

    if (selected.type === "chapter") {
      return (
        <div key={`chap-${cIndex}`} className="animate-fade-in p-1">
          <Typography.Title level={4} className="mb-6">
            <FolderOpenOutlined /> {chapters[cIndex].title}
          </Typography.Title>
          <Form.Item
            name={["chapters", cIndex, "title"]}
            label="Tên chương"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name={["chapters", cIndex, "description"]} label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>
        </div>
      );
    }

    if (selected.type === "lesson" && lIndex !== undefined) {
      if (!chapters[cIndex].lessons?.[lIndex]) return <Empty />;

      const lesson = chapters[cIndex].lessons[lIndex];

      return (
        <div
          key={`les-${cIndex}-${lIndex}`}
          className="animate-fade-in p-1 h-full flex flex-col"
        >
          <div className="border-b pb-4 mb-4 flex justify-between">
            <span className="text-lg font-semibold text-indigo-700">
              Bài {lIndex + 1}: {lesson.title}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Tên bài học */}
            <Form.Item
              name={["chapters", cIndex, "lessons", lIndex, "title"]}
              label="Tên bài học"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>

            {/*RADIO GROUP*/}
            <Form.Item
              name={["chapters", cIndex, "lessons", lIndex, "type"]}
              label="Loại tài liệu"
            >
              <Radio.Group
                buttonStyle="solid"
                onChange={() => forceUpdate()}
                className="w-full flex"
              >
                <Radio.Button value="video" className="flex-1 text-center">
                  <VideoCameraOutlined /> Video
                </Radio.Button>
                <Radio.Button value="document" className="flex-1 text-center">
                  <FileTextOutlined /> Tài liệu
                </Radio.Button>
                <Radio.Button value="slide" className="flex-1 text-center">
                  <FilePptOutlined /> Slide
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name={["chapters", cIndex, "lessons", lIndex, "duration"]}
              label="Thời lượng ước tính"
            >
              <InputNumber
                min={0}
                addonAfter="phút"
                style={{ width: "100%" }}
                placeholder="VD: 45"
              />
            </Form.Item>

            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 mb-6">
              {/* DYNAMIC CONTENT */}
              {lesson.type === "video" && (
                <>
                  <div className="mb-2 font-medium text-gray-700">
                    Đường dẫn Video bài giảng:
                  </div>
                  <Form.Item
                    name={["chapters", cIndex, "lessons", lIndex, "videoUrl"]}
                    noStyle
                    rules={[
                      { required: true, message: "Vui lòng nhập link video" },
                    ]}
                  >
                    <Input
                      prefix={<LinkOutlined />}
                      size="large"
                      placeholder="https://youtube.com/..."
                    />
                  </Form.Item>
                  <div className="mt-2 text-xs text-gray-400">
                    Hỗ trợ Youtube, Vimeo hoặc link server nội bộ.
                  </div>
                </>
              )}

              {lesson.type === "document" && (
                <>
                  <div className="mb-2 font-medium text-gray-700">
                    Tải lên tài liệu (.pdf, .doc, .docx, .txt):
                  </div>
                  {!lesson.docFile ? (
                    <Dragger
                      name="file"
                      maxCount={1}
                      accept=".pdf,.doc,.docx,.txt"
                      beforeUpload={(file) =>
                        handleMockUpload(file, cIndex, lIndex!, "docFile")
                      }
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                    </Dragger>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <FileTextOutlined className="text-2xl text-blue-500" />
                        <div>
                          <div className="font-medium">
                            {lesson.docFile.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {lesson.docFile.size}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFile(cIndex, lIndex!, "docFile")}
                      />
                    </div>
                  )}
                </>
              )}

              {lesson.type === "slide" && (
                <>
                  <div className="mb-2 font-medium text-gray-700">
                    Tải lên Slide (.ppt, .pptx, .pdf):
                  </div>
                  {!lesson.slideFile ? (
                    <Dragger
                      name="file"
                      maxCount={1}
                      accept=".ppt,.pptx,.pdf"
                      beforeUpload={(file) =>
                        handleMockUpload(file, cIndex, lIndex!, "slideFile")
                      }
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <FilePptOutlined className="text-orange-500" />
                      </p>
                      <p className="ant-upload-text">
                        Tải lên file thuyết trình
                      </p>
                    </Dragger>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <FilePptOutlined className="text-2xl text-orange-500" />
                        <div>
                          <div className="font-medium">
                            {lesson.slideFile.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {lesson.slideFile.size}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFile(cIndex, lIndex!, "slideFile")}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <Form.Item
              name={["chapters", cIndex, "lessons", lIndex, "references"]}
              label="Tài liệu tham khảo (Link ngoài)"
            >
              <Input placeholder="VD: Link Google Drive..." />
            </Form.Item>
          </div>
        </div>
      );
    }
  };

  return (
    <Card
      className="shadow-sm h-[600px]"
      bodyStyle={{ padding: 0, height: "100%" }}
    >
      <Form.Item name="chapters" hidden />
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-4 border-r bg-gray-50 flex flex-col h-full">
          <div className="p-3 border-b bg-white flex justify-between items-center shadow-sm">
            <span className="font-bold text-gray-600">
              <MenuOutlined /> Mục lục ({chapters.length})
            </span>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModal({ open: true, title: "", index: null })}
            >
              Thêm chương
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {renderSidebar}
          </div>
        </div>
        <div className="col-span-8 bg-white h-full p-6 overflow-hidden">
          {renderEditor()}
        </div>
      </div>
      <Modal
        title={modal.index !== null ? "Sửa tên chương" : "Tạo chương mới"}
        open={modal.open}
        onOk={saveChapter}
        onCancel={() => setModal({ ...modal, open: false })}
      >
        <Input
          value={modal.title}
          onChange={(e) => setModal({ ...modal, title: e.target.value })}
          onPressEnter={saveChapter}
          autoFocus
          placeholder="Nhập tên chương..."
        />
      </Modal>
    </Card>
  );
};

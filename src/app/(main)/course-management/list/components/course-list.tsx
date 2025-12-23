import {
  Button,
  Table,
  Tag,
  Typography,
  Popconfirm,
  App,
  Tooltip,
  Badge,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseListAPI, deleteCourseAPI } from "../../create/services/api";
import {
  formatCurrency,
  formatDate,
  getLabelFromValue,
} from "../../common/utils";
import { COURSE_CATEGORIES } from "../../common/constants";

const COURSE_TYPES: Record<number, { label: string; color: string }> = {
  1: { label: "Online", color: "blue" },
  2: { label: "Offline", color: "purple" },
};

const TIME_STATE_TYPES: Record<
  number,
  {
    label: string;
    status: "default" | "success" | "processing" | "error" | "warning";
  }
> = {
  1: { label: "Nháp", status: "default" },
  2: { label: "Chờ duyệt", status: "warning" },
  3: { label: "Đang diễn ra", status: "processing" },
  4: { label: "Kết thúc", status: "success" },
};

interface ICourseRecord {
  id: string;
  title: string;
  code?: string;
  price: number;
  type: number;
  timeStateType: number;
  startTime: string;
  endTime: string;
  publishAt: string;
  isLearnInOrder: boolean;
  category: string;
  chapters: any[];
  exams: any[];
}

export const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourseListAPI,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseAPI,
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => message.error("Xóa thất bại"),
  });

  const columns: TableProps<ICourseRecord>["columns"] = [
    {
      title: "Tên khóa học",
      dataIndex: "title",
      key: "title",
      width: 280,
      fixed: "left",
      render: (text: string, record: ICourseRecord) => (
        <div className="flex flex-col">
          <span
            className="font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer truncate"
            title={text}
            onClick={() =>
              navigate(`/course-management/create?id=${record.id}`)
            }
          >
            {text}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {record.code && (
              <Tag className="m-0 text-[10px]">{record.code}</Tag>
            )}
            {record.isLearnInOrder && (
              <Tooltip title="Học viên phải học tuần tự từng bài">
                <Tag color="orange" className="m-0 text-[10px]">
                  Sequential
                </Tag>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "classification",
      width: 160,
      render: (_, record) => {
        const catLabel = getLabelFromValue(record.category, COURSE_CATEGORIES);
        const typeInfo = COURSE_TYPES[record.type] || {
          color: "default",
        };

        return (
          <div className="flex flex-col gap-1 items-start">
            <Tag color={typeInfo.color} bordered={false}>
              {typeInfo.label}
            </Tag>
            <span className="text-xs text-gray-500 ml-1">{catLabel}</span>
          </div>
        );
      },
    },
    {
      title: "Nội dung",
      key: "stats",
      width: 140,
      render: (_, record) => {
        const chapterCount = record.chapters?.length || 0;
        const examCount = record.exams?.length || 0;
        const lessonCount =
          record.chapters?.reduce(
            (sum, ch) => sum + (ch.lessons?.length || 0),
            0
          ) || 0;

        return (
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <b>{chapterCount}</b> Chương - <b>{lessonCount}</b> Bài
            </div>
            {examCount > 0 && (
              <div className="text-red-500">
                <b>{examCount}</b> Đề kiểm tra
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <CalendarOutlined />
            <span>Bắt đầu: {formatDate(record.startTime, false)}</span>
          </div>
          {record.endTime && (
            <div className="flex items-center gap-1">
              <SafetyCertificateOutlined />
              <span>Kết thúc: {formatDate(record.endTime, false)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "timeStateType",
      key: "status",
      width: 140,
      render: (type: number) => {
        const state = TIME_STATE_TYPES[type] || {
          label: "Không rõ",
          status: "default",
        };
        return <Badge status={state.status as any} text={state.label} />;
      },
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      render: (price) => (
        <span className="font-mono font-medium">{formatCurrency(price)}</span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/course-management/create?id=${record.id}`)
            }
          />
          <Popconfirm
            title="Xóa?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <Typography.Title level={3} className="m-0 text-gray-800">
            Quản lý khóa học
          </Typography.Title>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/course-management/create")}
        >
          Tạo khóa học
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          dataSource={(courses as ICourseRecord[]) || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </div>
    </div>
  );
};

import { useState } from "react";
import {
  Button,
  Table,
  Tag,
  Typography,
  Popconfirm,
  App,
  Tooltip,
  Badge,
  Avatar,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { courseListAPI } from "../services/api";
import type { TCourseRecord } from "../types";
import { deleteCourseAPI } from "../../create/services/api";
import { formatDate } from "../../common/utils/utils";
import {
  COURSE_TYPE_KEY_BY,
  COURSE_STATUS_KEY_BY,
} from "../../common/constants/constants";

export const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["courses", pagination.current, pagination.pageSize],
    queryFn: () =>
      courseListAPI.getCourses({
        Page: pagination.current,
        PageSize: pagination.pageSize,
      }),
  });

  const courseData = data?.data || [];
  const totalRecords = data?.totalCount || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCourseAPI(id.toString()),
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => message.error("Xóa thất bại"),
  });

  const columns: TableProps<TCourseRecord>["columns"] = [
    {
      title: "Khóa học",
      dataIndex: "title",
      key: "title",
      width: 350,
      fixed: "left",
      render: (text: string, record: TCourseRecord) => (
        <div className="flex items-start gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.bannerUri}
            icon={<UserOutlined />}
            className="flex-shrink-0 bg-gray-200"
          />
          <div className="flex flex-col">
            <span
              className="font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer line-clamp-2"
              title={text}
              onClick={() => navigate(`/course-management/detail/${record.id}`)}
            >
              {text}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {record.isLearnInOrder && (
                <Tooltip title="Học tuần tự">
                  <Tag color="orange" className="m-0 text-[10px]">
                    Sequential
                  </Tag>
                </Tooltip>
              )}
              <span className="text-xs text-gray-400">
                {record.totalRegister} học viên
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "classification",
      width: 150,
      render: (_, record: TCourseRecord) => {
        const typeInfo = COURSE_TYPE_KEY_BY[record.type];

        return (
          <div className="flex flex-col gap-1 items-start">
            {typeInfo ? (
              <Tag color={typeInfo.color} bordered={false}>
                {typeInfo.label}
              </Tag>
            ) : (
              <Tag>Khác</Tag>
            )}

            <span className="text-xs text-gray-500 ml-1">
              Topic: {record.topics}
            </span>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_, record: TCourseRecord) => (
        <div className="flex flex-col text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <CalendarOutlined />
            <span>
              {record.startTime
                ? `Bắt đầu: ${formatDate(record.startTime, false)}`
                : `Ngày đăng: ${formatDate(record.publishAt, false)}`}
            </span>
          </div>

          {record.endTime && (
            <div className="flex items-center gap-1 text-gray-400">
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
      width: 150,
      render: (statusValue: number) => {
        const state = COURSE_STATUS_KEY_BY[statusValue];

        if (!state) return <Badge status="default" text="Không rõ" />;

        return <Badge status={state.color as any} text={state.label} />;
      },
    },
    {
      title: "",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record: TCourseRecord) => (
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

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
  };

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
          dataSource={courseData}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </div>
    </div>
  );
};

import { Button, Table, Tag, Typography, Tooltip, Avatar } from "antd";
import type { TableProps, TablePaginationConfig } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { courseListAPI } from "../services/api";
import type { TCourseRecord, TGetCoursesParams } from "../types";
import { formatDate } from "../../common/utils/utils";
import {
  COURSE_TYPE_KEY_BY,
  COURSE_STATUS_KEY_BY,
  COURSE_CATEGORIES,
} from "../../common/constants/constants";

import { CourseFilter } from "./course-filter";
import { useCourseParams } from "../hooks/use-course-params";

export const CourseList = () => {
  const navigate = useNavigate();
  const { params, setParams } = useCourseParams();

  const { data, isLoading } = useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseListAPI.getCourses(params),
    placeholderData: (prev) => prev,
  });

  const courseData = data?.data || [];
  const totalRecords = data?.totalCount || 0;

  const getTopicLabel = (topicId: string | number) => {
    const id = Number(topicId);
    const found = COURSE_CATEGORIES.find((c) => c.value === id);
    return found ? found.label : topicId;
  };

  const renderTopicColumn = (topics: string | number) => {
    if (!topics) return <span className="text-gray-400">--</span>;

    const listIds = String(topics)
      .split(",")
      .map((id) => id.trim());

    const MAX_DISPLAY = 2;

    if (listIds.length <= MAX_DISPLAY) {
      return (
        <div className="flex flex-wrap gap-1">
          {listIds.map((id) => (
            <Tag key={id} color="geekblue" bordered={false}>
              {getTopicLabel(id)}
            </Tag>
          ))}
        </div>
      );
    }

    const visibleTags = listIds.slice(0, MAX_DISPLAY);
    const hiddenTags = listIds.slice(MAX_DISPLAY);

    const tooltipContent = (
      <div className="flex flex-col gap-1">
        {hiddenTags.map((id) => (
          <span key={id}>• {getTopicLabel(id)}</span>
        ))}
      </div>
    );

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {visibleTags.map((id) => (
          <Tag key={id} color="geekblue" bordered={false}>
            {getTopicLabel(id)}
          </Tag>
        ))}

        <Tooltip title={tooltipContent} color="#108ee9">
          <Tag className="m-0 cursor-pointer bg-gray-100 text-gray-500 border-gray-300">
            +{hiddenTags.length}
          </Tag>
        </Tooltip>
      </div>
    );
  };

  const handleFilter = (filterParams: Partial<TGetCoursesParams>) => {
    setParams({ ...filterParams, Page: 1 });
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setParams({
      Page: newPagination.current || 1,
      PageSize: newPagination.pageSize || 10,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const columns: TableProps<TCourseRecord>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left",
      align: "center",
      render: (id) => <span className="font-semibold text-gray-500">{id}</span>,
    },
    {
      title: "Khóa học",
      dataIndex: "title",
      key: "title",
      width: 300,
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
      key: "type",
      width: 120,
      render: (_, record: TCourseRecord) => {
        const typeInfo = COURSE_TYPE_KEY_BY[record.type];
        return typeInfo ? (
          <Tag color={typeInfo.color} bordered={false}>
            {typeInfo.label}
          </Tag>
        ) : (
          <Tag>Khác</Tag>
        );
      },
    },
    {
      title: "Chủ đề",
      dataIndex: "topics",
      key: "topics",
      width: 200,
      render: renderTopicColumn,
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
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (statusValue: number) => {
        const state = COURSE_STATUS_KEY_BY[statusValue];
        if (!state) return <Tag>Không rõ</Tag>;
        return (
          <Tag color={state.color} bordered={false}>
            {state.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record: TCourseRecord) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-blue-500" />}
              onClick={() => navigate(`/course-management/detail/${record.id}`)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <CourseFilter
        initialValues={params}
        onFilter={handleFilter}
        loading={isLoading}
      />

      <div className="flex justify-between items-end">
        <Typography.Title level={3} className="m-0 text-gray-800">
          Quản lý khóa học
        </Typography.Title>
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
            current: params.Page,
            pageSize: params.PageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Tổng ${total} khóa học`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </div>
    </div>
  );
};

import { Button, Table, Tag, Typography, Popconfirm, message } from "antd";
import type { TableProps } from "antd"; // Import kiểu TableProps
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseListAPI, deleteCourseAPI } from "../../create/services/api";
import { formatCurrency, getLabelFromValue } from "../../common/utils";
import { COURSE_CATEGORIES } from "../../common/constants";
import type { ICreateCourseForm } from "../../common/types";


interface ICourseRecord extends ICreateCourseForm {
  id: string;
}

export const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourseListAPI,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseAPI,
    onSuccess: () => {
      message.success("Đã xóa khóa học thành công");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => {
      message.error("Xóa thất bại");
    }
  });

  const columns: TableProps<ICourseRecord>['columns'] = [
    {
      title: "Tên khóa học",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-medium text-gray-700">{text}</span>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => {
        const label = getLabelFromValue(cat, COURSE_CATEGORIES);
        return <Tag color="blue">{label}</Tag>;
      }
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price: number) => (
        <span className="font-semibold text-gray-600">
          {price === 0 ? "Miễn phí" : formatCurrency(price)}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_: unknown, record: ICourseRecord) => (
        <div className="flex justify-end gap-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => navigate(`/course-management/create?id=${record.id}`)}
          />

          <Popconfirm
            title="Xóa khóa học này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa luôn"
            cancelText="Thôi"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <Typography.Title level={3} className="m-0">Quản lý khóa học</Typography.Title>
          <Typography.Text type="secondary">Danh sách tất cả các khóa học hiện có</Typography.Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/course-management/create")}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          Tạo khóa học mới
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          dataSource={(courses as ICourseRecord[]) || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};
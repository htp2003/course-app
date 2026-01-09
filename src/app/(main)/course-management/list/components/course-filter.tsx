import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Card,
  ConfigProvider,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect } from "react";
import {
  COURSE_STATUS_LIST,
  COURSE_TYPE_LIST,
  COURSE_CATEGORIES,
} from "../../common/constants/constants";
import type { TGetCoursesParams } from "../types";

const { RangePicker } = DatePicker;

export type TFilterValues = Omit<
  TGetCoursesParams,
  "Page" | "PageSize" | "StartTime" | "EndTime"
> & {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
};

interface Props {
  initialValues: TGetCoursesParams;
  onFilter: (values: Partial<TGetCoursesParams>) => void;
  loading?: boolean;
}

export const CourseFilter = ({ initialValues, onFilter, loading }: Props) => {
  const [form] = Form.useForm();

  const defaultValues: TFilterValues = {
    Title: initialValues.Title,
    Status: initialValues.Status,
    Type: initialValues.Type,
    Topics: initialValues.Topics,
    dateRange:
      initialValues.StartTime && initialValues.EndTime
        ? [dayjs(initialValues.StartTime), dayjs(initialValues.EndTime)]
        : undefined,
  };

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [
    initialValues.Title,
    initialValues.Status,
    initialValues.Type,
    JSON.stringify(initialValues.Topics),
    initialValues.StartTime,
    initialValues.EndTime,
  ]);

  const handleFinish = (values: TFilterValues) => {
    const { dateRange, ...rest } = values;

    const trimmedTitle = rest.Title?.trim();

    const apiParams: Partial<TGetCoursesParams> = {
      ...rest,
      Title: trimmedTitle || undefined,
      StartTime: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
      EndTime: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
    };
    onFilter(apiParams);
  };

  const handleReset = () => {
    form.setFieldsValue({
      Title: undefined,
      Status: undefined,
      Type: undefined,
      Topics: undefined,
      dateRange: undefined,
    });
    onFilter({
      Title: undefined,
      Status: undefined,
      Type: undefined,
      Topics: undefined,
      StartTime: undefined,
      EndTime: undefined,
    });
  };

  const colProps = { xs: 24, sm: 12, md: 8, lg: 6 };

  return (
    <ConfigProvider componentSize="middle">
      <Card
        className="shadow-sm border-gray-200 mb-4"
        size="small"
        styles={{ body: { padding: "10px 16px" } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultValues}
          onFinish={handleFinish}
        >
          <Row gutter={[12, 0]}>
            <Col {...colProps}>
              <Form.Item name="Title">
                <Input
                  placeholder="Tên khóa học..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="Topics">
                <Select
                  mode="multiple"
                  placeholder="Chọn chủ đề"
                  allowClear
                  showSearch
                  maxTagCount="responsive"
                  options={COURSE_CATEGORIES}
                  notFoundContent="Không tìm thấy chủ đề"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="Status">
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={COURSE_STATUS_LIST}
                  fieldNames={{ label: "label", value: "value" }}
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="Type">
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={COURSE_TYPE_LIST}
                  fieldNames={{ label: "label", value: "value" }}
                />
              </Form.Item>
            </Col>

            <Col {...colProps}>
              <Form.Item name="dateRange">
                <RangePicker
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row className="mt-0 mb-2">
            <Col span={24} className="flex justify-end">
              <div className="flex gap-2">
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<FilterOutlined />}
                  loading={loading}
                >
                  Lọc kết quả
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </ConfigProvider>
  );
};

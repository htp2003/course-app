import {
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Upload,
  Typography,
  Tag,
  Image,
} from "antd";
import { DollarOutlined, FileImageOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { TiptapEditor } from "../common/tiptap-editor";
import { COURSE_LEVELS, COURSE_CATEGORIES } from "../../../common/constants";
import { formatCurrency, getLabelFromValue } from "../../../common/utils";
interface Props {
  readOnly?: boolean;
}
const normFile = (e: UploadChangeParam | UploadFile[]) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};
const currencyFormatter = (value: number | undefined) => {
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const currencyParser = (value: string | undefined) => {
  const parsed = value?.replace(/\$\s?|(,*)/g, "");
  return parsed ? Number(parsed) : 0;
};
const getThumbnailUrl = (thumbnailList: UploadFile[]): string => {
  if (!thumbnailList || thumbnailList.length === 0) {
    return "https://placehold.co/600x400?text=No+Image";
  }
  const file = thumbnailList[0];
  if (file.url) return file.url;
  if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
  return file.thumbUrl || "";
};
const CourseInfoPreview = () => {
  const form = Form.useFormInstance();
  const watchedValues = Form.useWatch([], form);
  const { title, price, level, category, description, thumbnail } =
    watchedValues || {};
  const thumbUrl = getThumbnailUrl(thumbnail);
  return (
    <Card className="shadow-sm mb-8 bg-white/50 backdrop-blur-sm">
      <Row gutter={[32, 24]}>
        <Col xs={24} md={8}>
          <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-video group relative">
            <Image
              src={thumbUrl}
              alt="Course Thumbnail"
              width="100%"
              height="100%"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              preview={false}
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </div>
        </Col>
        <Col xs={24} md={16} className="flex flex-col gap-4">
          <div>
            <Typography.Title level={2} className="m-0 text-gray-800 font-bold">
              {title || <span className="text-gray-300">Tiêu đề khóa học</span>}
            </Typography.Title>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Tag
                color="geekblue"
                className="px-3 py-1 text-sm rounded-full font-medium"
              >
                {getLabelFromValue(level, COURSE_LEVELS)}
              </Tag>
              <Tag
                color="purple"
                className="px-3 py-1 text-sm rounded-full font-medium"
              >
                {getLabelFromValue(category, COURSE_CATEGORIES)}
              </Tag>
              <Tag
                color="gold"
                icon={<DollarOutlined />}
                className="px-3 py-1 text-sm rounded-full font-bold text-yellow-700 bg-yellow-50"
              >
                {price ? formatCurrency(price) : "Miễn phí"}
              </Tag>
            </div>
          </div>
          <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-100 flex-1">
            <Typography.Text
              type="secondary"
              className="block mb-2 text-xs uppercase tracking-wider font-semibold"
            >
              Giới thiệu
            </Typography.Text>
            <TiptapEditor value={description} readOnly={true} />
          </div>
        </Col>
      </Row>
    </Card>
  );
};
export const CourseInfoSection = ({ readOnly = false }: Props) => {
  if (readOnly) {
    return <CourseInfoPreview />;
  }
  return (
    <Card title="Thông tin chung" className="shadow-sm mb-6 rounded-lg">
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={16}>
          <Form.Item
            name="title"
            label="Tên khóa học"
            rules={[{ required: true, message: "Vui lòng nhập tên khóa học" }]}
          >
            <Input
              size="large"
              placeholder="VD: ReactJS Masterclass..."
              showCount
              maxLength={100}
            />
          </Form.Item>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="price"
                label="Giá bán"
                rules={[{ required: true, message: "Nhập giá bán" }]}
              >
                <InputNumber<number>
                  className="w-full"
                  size="large"
                  formatter={currencyFormatter}
                  parser={currencyParser}
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="level" label="Trình độ">
                <Select size="large" options={COURSE_LEVELS} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Chọn danh mục" }]}
          >
            <Select
              size="large"
              placeholder="Chọn lĩnh vực..."
              options={COURSE_CATEGORIES}
            />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            {}
            <TiptapEditor placeholder="Mô tả những gì học viên sẽ đạt được..." />
          </Form.Item>
        </Col>
        <Col xs={24} lg={8}>
          <Form.Item
            label="Ảnh bìa khóa học"
            tooltip="Kích thước khuyến nghị: 1280x720 (16:9)"
          >
            <Form.Item
              name="thumbnail"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload.Dragger
                name="files"
                maxCount={1}
                listType="picture-card"
                className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300"
                height={280}
                beforeUpload={() => false}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                showUploadList={{ showPreviewIcon: false }}
              >
                <div className="py-8">
                  <p className="ant-upload-drag-icon mb-4">
                    <FileImageOutlined className="text-gray-400 text-5xl" />
                  </p>
                  <p className="ant-upload-text font-medium text-gray-600">
                    Kéo thả hoặc click để tải ảnh
                  </p>
                  <p className="ant-upload-hint text-xs text-gray-400 mt-2 px-4">
                    Hỗ trợ: PNG, JPG, WEBP (Max 5MB)
                  </p>
                </div>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

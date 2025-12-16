import { Form, Input, InputNumber, Select, Card, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Dragger } = Upload;

// Hàm chuẩn hóa dữ liệu file cho Antd Upload
const normFile = (e: any) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export const StepOneInfo = () => {
  return (
    <Card title="Thông tin cơ bản" className="shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Form.Item
            name="title"
            label="Tên khóa học"
            rules={[{ required: true, message: "Vui lòng nhập tên khóa học" }]}
          >
            <Input size="large" placeholder="VD: ReactJS Ultimate 2024..." />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Học phí (VND)"
              rules={[{ required: true, message: "Nhập giá tiền đi bác" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                parser={(value) =>
                  value?.replace(
                    /\$\s?|(\.*)|(₫*)|(,*)/g,
                    ""
                  ) as unknown as number
                }
                placeholder="0"
              />
            </Form.Item>

            {/* Fix lỗi initialValue: Xóa initialValue="beginner" ở đây (đã set ở Form cha) */}
            <Form.Item name="level" label="Trình độ">
              <Select size="large">
                <Select.Option value="beginner">
                  Sơ cấp (Beginner)
                </Select.Option>
                <Select.Option value="intermediate">
                  Trung cấp (Intermediate)
                </Select.Option>
                <Select.Option value="advanced">
                  Cao cấp (Advanced)
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="category" label="Danh mục">
            <Select size="large" placeholder="Chọn danh mục...">
              <Select.Option value="it">Công nghệ thông tin</Select.Option>
              <Select.Option value="design">Thiết kế đồ họa</Select.Option>
              <Select.Option value="business">
                Kinh doanh & Startup
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả ngắn">
            <TextArea
              rows={4}
              placeholder="Giới thiệu sơ lược..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </div>

        <div className="lg:col-span-1">
          {/* Fix lỗi value Upload: Thêm valuePropName và getValueFromEvent */}
          <Form.Item
            label="Ảnh bìa khóa học"
            name="thumbnail"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Dragger
              multiple={false}
              listType="picture"
              height={250}
              className="bg-gray-50"
              beforeUpload={() => false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon text-indigo-500">
                <InboxOutlined style={{ fontSize: "48px" }} />
              </p>
              <p className="ant-upload-text font-medium">
                Click hoặc kéo ảnh vào đây
              </p>
            </Dragger>
          </Form.Item>
        </div>
      </div>
    </Card>
  );
};

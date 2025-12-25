import {
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Image,
  DatePicker,
  Radio,
} from "antd";
import {
  FileImageOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import dayjs from "dayjs";

import { TiptapEditor } from "../common/tiptap-editor";
import { CommonFileUpload } from "../common/common-file-upload";
import {
  COURSE_CATEGORIES,
  UPLOAD_CONFIG,
  ASPECT_RATIOS,
  COURSE_TIME_STATE_TYPE,
  COURSE_END_PRIZE,
  LEARN_ORDER,
  COURSE_TYPE,
} from "../../../common/constants/constants";
import { getLabelFromValue } from "../../../common/utils/utils";

import { uploadImageAPI } from "../../services/api";

const { RangePicker } = DatePicker;

interface Props {
  readOnly?: boolean;
}

export const normFile = (e: UploadChangeParam | UploadFile[]): UploadFile[] => {
  if (Array.isArray(e)) return e;
  return e && e.fileList ? e.fileList : [];
};

const getThumbnailUrl = (thumbnailList: UploadFile[] | undefined): string => {
  if (!thumbnailList || thumbnailList.length === 0) {
    return "https://placehold.co/600x400?text=No+Image";
  }
  const file = thumbnailList[0];
  if (file.url) return file.url;

  const originFile = file.originFileObj;
  if (originFile) {
    return URL.createObjectURL(originFile as Blob);
  }

  return file.thumbUrl || "https://placehold.co/600x400?text=No+Image";
};

const CourseInfoPreview = () => {
  const form = Form.useFormInstance();
  const watchedValues = Form.useWatch([], form);
  const { title, category, description, thumbnail, timeRange } =
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
          </div>
        </Col>
        <Col xs={24} md={16} className="flex flex-col gap-4">
          <div>
            <Typography.Title level={2} className="m-0 text-gray-800 font-bold">
              {title || <span className="text-gray-300">Tiêu đề khóa học</span>}
            </Typography.Title>

            <div className="flex gap-2 mt-3 flex-wrap items-center">
              <Tag
                color="purple"
                className="px-3 py-1 text-sm rounded-full font-medium"
              >
                {getLabelFromValue(category, COURSE_CATEGORIES)}
              </Tag>

              {timeRange && timeRange[0] && timeRange[1] && (
                <Tag
                  icon={<CalendarOutlined />}
                  color="blue"
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {dayjs(timeRange[0]).format("DD/MM/YYYY")} -{" "}
                  {dayjs(timeRange[1]).format("DD/MM/YYYY")}
                </Tag>
              )}
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
    <Card title="Thông tin cơ bản" className="shadow-sm mb-6 rounded-lg">
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={8}>
          <Form.Item
            label="Hình ảnh cho khoá học"
            tooltip="Kích thước khuyến nghị: 16:9"
          >
            <Form.Item
              name="thumbnail"
              getValueFromEvent={normFile}
              noStyle
              rules={[{ required: true, message: "Vui lòng chọn ảnh bìa" }]}
            >
              <CommonFileUpload
                accept={UPLOAD_CONFIG.IMAGE.ACCEPT}
                maxSizeMB={UPLOAD_CONFIG.IMAGE.MAX_SIZE_MB}
                helperText={UPLOAD_CONFIG.IMAGE.HELPER_TEXT}
                listType="picture"
                maxCount={1}
                height={250}
                checkRatio={true}
                aspectRatio={ASPECT_RATIOS.VIDEO}
                icon={<FileImageOutlined className="text-gray-400 text-5xl" />}
                label="Tải ảnh bìa"
                apiCall={uploadImageAPI}
              />
            </Form.Item>
          </Form.Item>
        </Col>

        <Col xs={24} lg={16}>
          <Form.Item
            name="title"
            label="Tên khoá học"
            rules={[{ required: true, message: "Nhập tên khóa học" }]}
          >
            <Input placeholder="Nhập tên khóa học..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại khoá học"
            initialValue={COURSE_TYPE.OBLIGATORY.value}
          >
            <Radio.Group>
              <Radio value={COURSE_TYPE.OBLIGATORY.value}>
                {COURSE_TYPE.OBLIGATORY.label}
              </Radio>
              <Radio value={COURSE_TYPE.OPTIONAL.value}>
                {COURSE_TYPE.OPTIONAL.label}
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="category"
            label="Chủ đề"
            rules={[{ required: true, message: "Chọn chủ đề" }]}
          >
            <Select placeholder="Chọn chủ đề..." options={COURSE_CATEGORIES} />
          </Form.Item>

          <Form.Item
            name="publishAt"
            label="Thời gian phát hành"
            rules={[{ required: true, message: "Chọn ngày phát hành" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian phát hành"
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Thời gian khoá học" required className="mb-0">
            <Form.Item
              name="timeStateType"
              initialValue={COURSE_TIME_STATE_TYPE.CUSTOMIZE.value}
              className="mb-2"
            >
              <Radio.Group>
                <Radio value={COURSE_TIME_STATE_TYPE.CUSTOMIZE.value}>
                  {COURSE_TIME_STATE_TYPE.CUSTOMIZE.label}
                </Radio>
                <Radio value={COURSE_TIME_STATE_TYPE.ALL_TIME.value}>
                  {COURSE_TIME_STATE_TYPE.ALL_TIME.label}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.timeStateType !== curr.timeStateType
              }
            >
              {({ getFieldValue }) => {
                const timeType = getFieldValue("timeStateType");
                return timeType === COURSE_TIME_STATE_TYPE.CUSTOMIZE.value ? (
                  <Form.Item
                    name="timeRange"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn khoảng thời gian",
                      },
                    ]}
                  >
                    <RangePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      placeholder={[
                        "Thời gian diễn ra từ",
                        "Thời gian diễn ra đến",
                      ]}
                      className="w-full"
                    />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item label="Hoàn thành khóa học" required className="mb-0">
            <Form.Item
              name="isHasBadge"
              initialValue={COURSE_END_PRIZE.NONE.value}
              className="mb-2"
            >
              <Radio.Group>
                <Radio value={COURSE_END_PRIZE.BADGE.value}>
                  {COURSE_END_PRIZE.BADGE.label}
                </Radio>
                <Radio value={COURSE_END_PRIZE.NONE.value}>
                  {COURSE_END_PRIZE.NONE.label}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.isHasBadge !== curr.isHasBadge}
            >
              {({ getFieldValue }) => {
                const hasBadge = getFieldValue("isHasBadge");
                return hasBadge === COURSE_END_PRIZE.BADGE.value ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg mb-4">
                    <Typography.Text className="block mb-2 text-xs text-gray-500 font-semibold uppercase">
                      Hình ảnh huy chương
                    </Typography.Text>
                    <Form.Item
                      name="courseBadgeFile"
                      getValueFromEvent={normFile}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng tải ảnh huy chương",
                        },
                      ]}
                      noStyle
                    >
                      <CommonFileUpload
                        accept={UPLOAD_CONFIG.IMAGE.ACCEPT}
                        maxSizeMB={UPLOAD_CONFIG.IMAGE.MAX_SIZE_MB}
                        helperText="Ảnh huy chương (PNG, JPG)"
                        listType="picture"
                        maxCount={1}
                        height={150}
                        icon={
                          <TrophyOutlined className="text-yellow-500 text-3xl" />
                        }
                        label="Tải ảnh huy chương"
                        apiCall={uploadImageAPI}
                      />
                    </Form.Item>
                  </div>
                ) : null;
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="isLearnInOrder"
            label="Học theo thứ tự"
            initialValue={LEARN_ORDER.YES.value}
          >
            <Radio.Group>
              <Radio value={LEARN_ORDER.YES.value}>
                {LEARN_ORDER.YES.label}
              </Radio>
              <Radio value={LEARN_ORDER.NO.value}>{LEARN_ORDER.NO.label}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả khóa học" },
              {
                min: 10,
                message: "Vui lòng nhập mô tả khóa học, ít nhất 10 ký tự",
              },
            ]}
          >
            <TiptapEditor placeholder="Nhập mô tả..." />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

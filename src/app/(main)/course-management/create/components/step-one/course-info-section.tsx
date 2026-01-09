import {
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Radio,
} from "antd";
import { FileImageOutlined, TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { TiptapEditorWrapper as TiptapEditor } from "../common/tiptap-editor-lazy";
import { ImageUpload } from "../common/image-upload";
import {
  COURSE_CATEGORIES,
  UPLOAD_CONFIG,
  ASPECT_RATIOS,
  COURSE_TIME_STATE_TYPE,
  COURSE_END_PRIZE,
  LEARN_ORDER,
  COURSE_TYPE,
} from "../../../common/constants/constants";
import { disablePastDates, normFile } from "../../../common/utils/utils";

import { uploadImageAPI } from "../../services/api";

const { RangePicker } = DatePicker;

interface Props {
  isPreview?: boolean;
}

export const CourseInfoSection = ({ isPreview = false }: Props) => {
  return (
    <Card title="Thông tin cơ bản" className="shadow-sm mb-6 rounded-lg">
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={8}>
          <Form.Item
            label="Hình ảnh cho khoá học"
            tooltip="Hỗ trợ cắt ảnh theo tỉ lệ 16:9 tự động"
            required
          >
            <Form.Item
              name="thumbnail"
              getValueFromEvent={normFile}
              noStyle
              rules={[
                { required: true, message: "Vui lòng chọn ảnh bìa" },
                {
                  validator: async (_, fileList) => {
                    if (
                      Array.isArray(fileList) &&
                      fileList.some((f) => f?.status === "error")
                    ) {
                      throw new Error(
                        "Ảnh bìa upload thất bại, vui lòng thử lại"
                      );
                    }
                  },
                },
              ]}
              validateTrigger="onChange"
            >
              <ImageUpload
                accept={UPLOAD_CONFIG.IMAGE.ACCEPT}
                maxSizeMB={UPLOAD_CONFIG.IMAGE.MAX_SIZE_MB}
                aspectRatio={ASPECT_RATIOS.VIDEO}
                enableCrop
                label="Tải ảnh bìa"
                helperText={UPLOAD_CONFIG.IMAGE.HELPER_TEXT}
                icon={<FileImageOutlined className="text-gray-400 text-3xl" />}
                height={250}
                apiCall={uploadImageAPI}
                disabled={isPreview}
              />
            </Form.Item>
          </Form.Item>
        </Col>

        <Col xs={24} lg={16}>
          <Form.Item
            name="title"
            label="Tên khoá học"
            rules={[
              { required: true, message: "Nhập tên khóa học" },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.reject(
                      new Error(
                        "Tên khóa học không được để trống hoặc chỉ có khoảng trắng"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onChange"
          >
            <Input
              placeholder="Nhập tên khóa học..."
              disabled={isPreview}
              onChange={(e) => {
                const trimmed = e.target.value.trim();
                e.target.value = trimmed;
              }}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại khoá học"
            {...(!isPreview && { initialValue: COURSE_TYPE.OBLIGATORY.value })}
            rules={[{ required: true, message: "Chọn loại khoá học" }]}
            validateTrigger="onChange"
          >
            <Radio.Group disabled={isPreview}>
              <Radio value={COURSE_TYPE.OBLIGATORY.value}>
                {COURSE_TYPE.OBLIGATORY.label}
              </Radio>
              <Radio value={COURSE_TYPE.OPTIONAL.value}>
                {COURSE_TYPE.OPTIONAL.label}
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="categories"
            label="Chủ đề"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: "Chọn ít nhất 1 chủ đề",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Select
              mode="multiple"
              placeholder="Chọn chủ đề..."
              options={COURSE_CATEGORIES}
              disabled={isPreview}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent="Không tìm thấy chủ đề"
            />
          </Form.Item>

          <Form.Item
            name="publishAt"
            label="Thời gian phát hành"
            rules={[
              { required: true, message: "Chọn ngày phát hành" },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const timeStateType = getFieldValue("timeStateType");
                  const timeRange = getFieldValue("timeRange");

                  if (
                    timeStateType === COURSE_TIME_STATE_TYPE.CUSTOMIZE.value &&
                    timeRange &&
                    timeRange[0] &&
                    value &&
                    timeRange[0].isBefore(value)
                  ) {
                    return Promise.reject(
                      new Error(
                        "Thời gian phát hành phải trước hoặc bằng thời gian diễn ra"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            dependencies={["timeRange", "timeStateType"]}
            validateTrigger="onChange"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian phát hành"
              className="w-full"
              disabledDate={(current) => {
                if (!current) return false;
                return current.isBefore(dayjs().add(1, "day").startOf("day"));
              }}
              disabled={isPreview}
            />
          </Form.Item>

          <Form.Item label="Thời gian khoá học" required className="mb-0">
            <Form.Item
              name="timeStateType"
              {...(!isPreview && {
                initialValue: COURSE_TIME_STATE_TYPE.CUSTOMIZE.value,
              })}
              className="mb-2"
            >
              <Radio.Group disabled={isPreview}>
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
                prev.timeStateType !== curr.timeStateType ||
                prev.publishAt !== curr.publishAt
              }
            >
              {({ getFieldValue }) => {
                const timeType = getFieldValue("timeStateType");
                const publishAt = getFieldValue("publishAt");
                const disableCourseRangeDate = (current: Dayjs) => {
                  if (!current) return false;
                  if (disablePastDates(current)) return true;
                  if (publishAt) {
                    return current.isBefore(publishAt.startOf("day"));
                  }
                  return false;
                };
                return timeType === COURSE_TIME_STATE_TYPE.CUSTOMIZE.value ? (
                  <Form.Item
                    name="timeRange"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn khoảng thời gian",
                      },
                      {
                        validator: (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.resolve();
                          }
                          const [start, end] = value;
                          if (end.isBefore(start)) {
                            return Promise.reject(
                              new Error(
                                "Thời gian kết thúc phải sau thời gian bắt đầu"
                              )
                            );
                          }
                          if (publishAt && start.isBefore(publishAt)) {
                            return Promise.reject(
                              new Error(
                                "Thời gian diễn ra phải sau hoặc bằng thời gian phát hành"
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    validateTrigger="onChange"
                  >
                    <RangePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      placeholder={[
                        "Thời gian diễn ra từ",
                        "Thời gian diễn ra đến",
                      ]}
                      className="w-full"
                      disabledDate={disableCourseRangeDate}
                      disabled={isPreview}
                    />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item label="Hoàn thành khóa học" required className="mb-0">
            <Form.Item
              name="isHasBadge"
              {...(!isPreview && { initialValue: COURSE_END_PRIZE.NONE.value })}
              className="mb-2"
            >
              <Radio.Group disabled={isPreview}>
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
                        {
                          validator: async (_, fileList) => {
                            if (
                              Array.isArray(fileList) &&
                              fileList.some((f) => f?.status === "error")
                            ) {
                              throw new Error(
                                "Ảnh huy chương upload thất bại, vui lòng thử lại"
                              );
                            }
                          },
                        },
                      ]}
                      noStyle
                      validateTrigger="onChange"
                    >
                      <ImageUpload
                        accept={UPLOAD_CONFIG.IMAGE.ACCEPT}
                        maxSizeMB={UPLOAD_CONFIG.IMAGE.MAX_SIZE_MB}
                        label="Tải ảnh huy chương"
                        helperText="Ảnh huy chương (PNG, JPG, WEBP)"
                        icon={
                          <TrophyOutlined className="text-yellow-500 text-3xl" />
                        }
                        height={180}
                        width={220}
                        apiCall={uploadImageAPI}
                        disabled={isPreview}
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
            {...(!isPreview && { initialValue: LEARN_ORDER.YES.value })}
            rules={[{ required: true, message: "Chọn hình thức học" }]}
            validateTrigger="onChange"
          >
            <Radio.Group disabled={isPreview}>
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
                validator: (_, value) => {
                  const textOnly = (value || "")
                    .replace(/<[^>]*>/g, " ")
                    .replace(/&nbsp;/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
                  if (!textOnly || textOnly.length < 10) {
                    return Promise.reject(
                      new Error(
                        "Mô tả cần ít nhất 10 ký tự không phải khoảng trắng"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onBlur"
          >
            <TiptapEditor isPreview={isPreview} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

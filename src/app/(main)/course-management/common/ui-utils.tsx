import type { ReactNode } from "react";
import { Tag } from "antd";
import {
  VideoCameraOutlined,
  FileTextOutlined,
  DesktopOutlined,
} from "@ant-design/icons";

export const getLessonIcon = (type: string): ReactNode => {
  switch (type) {
    case "video":
      return <VideoCameraOutlined className="text-blue-500" />;
    case "document":
      return <FileTextOutlined className="text-orange-500" />;
    case "slide":
      return <DesktopOutlined className="text-green-500" />;
    default:
      return <FileTextOutlined />;
  }
};

export const getLessonTypeTag = (type: string): ReactNode => {
  switch (type) {
    case "video":
      return <Tag color="blue">Video</Tag>;
    case "document":
      return <Tag color="orange">Tài liệu</Tag>;
    case "slide":
      return <Tag color="green">Slide</Tag>;
    default:
      return <Tag>Khác</Tag>;
  }
};
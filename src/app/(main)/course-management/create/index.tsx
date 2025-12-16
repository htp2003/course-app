import React from 'react';
import { CourseWizard } from './components/course-wizard';

const CreateCoursePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tạo khóa học mới</h1>
          <p className="text-gray-500">Thiết lập thông tin, nội dung và bài kiểm tra</p>
        </div>
      </div>
      
      {/* Gọi Wizard Component */}
      <CourseWizard />
    </div>
  );
};

export default CreateCoursePage;
export type TGetCoursesParams = {
  Page: number;
  PageSize: number;
  Title?: string;
  Type?: number;
  Status?: number;
  Topics?: number[];
  StartTime?: string;
  EndTime?: string;
};

export type TCourseRecord = {
  id: number;
  title: string;
  bannerUri: string | null;
  type: number;
  timeStateType: number;
  startTime: string | null;
  endTime: string | null;
  publishAt: string;
  topics: string;
  totalRegister: number;
  isLearnInOrder: boolean;
};

export type TGetCoursesResponse = {
  totalCount: number;
  pageSize: number;
  offset: number;
  totalPages: number;
  data: TCourseRecord[];
};

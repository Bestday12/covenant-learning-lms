
export { default as CourseTable } from './components/CourseTable';
export { default as CourseForm } from './components/CourseForm';
export { default as CourseFilters } from './components/CourseFilters';
export { default as CourseModulesEditor } from './components/CourseModulesEditor';
export { default as CoursePublishPanel } from './components/CoursePublishPanel';
export { default as CourseSkeleton } from './components/CourseSkeleton';
export { default as CourseEmptyState } from './components/CourseEmptyState';
export { default as CourseStatusBadge } from './components/CourseStatusBadge';
export { default as CourseCard } from './components/CourseCard';
export { default as CoursePreview } from './components/CoursePreview';
export { default as CourseAnalytics } from './components/CourseAnalytics';

export { default as CourseListPage } from './pages/CourseListPage';
export { default as CourseCreatePage } from './pages/CourseCreatePage';
export { default as CourseEditPage } from './pages/CourseEditPage';
export { default as CourseDetailPage } from './pages/CourseDetailPage';
export { default as CourseAnalyticsPage } from './pages/CourseAnalyticsPage';
export { default as CourseSettingsPage } from './pages/CourseSettingsPage';

export {
  useCourse,
  useCourses,
  useCourseMutation,
  default as CourseApi,
} from './services/coursesApi';

export { default as useCourseFilters } from './hooks/useCourseFilters';
export { default as useCourseForm } from './hooks/useCourseForm';
export { default as useCourseValidation } from './hooks/useCourseValidation';
export { default as useCoursePublish } from './hooks/useCoursePublish';
export { default as useCourseModules } from './hooks/useCourseModules';
export { default as useCourseAnalytics } from './hooks/useCourseAnalytics';
export { default as useCourseExport } from './hooks/useCourseExport';
export { default as useCourseSearch } from './hooks/useCourseSearch';
export { default as useCourseSelection } from './hooks/useCourseSelection';
export { default as useCourseCache } from './hooks/useCourseCache';
export { default as useCourseRealtime } from './hooks/useCourseRealtime';

export { default as coursesApi } from './services/coursesApi';
export { default as courseStorage } from './services/courseStorage';
export { default as courseValidator } from './services/courseValidator';
export { default as courseNormalizer } from './services/courseNormalizer';
export { default as courseExporter } from './services/courseExporter';
export { default as courseImporter } from './services/courseImporter';

export * from './utils/courseHelpers';
export * from './constants';
export * from './types';

export { default as useCourseStore } from './store/courseStore';
export { default as useCourseFilterStore } from './store/courseFilterStore';
export { default as useCourseSelectionStore } from './store/courseSelectionStore';
export { default as useCoursePaginationStore } from './store/coursePaginationStore';

export {
  mockCourse,
  mockCourses,
  mockCourseFilters,
  mockCourseFormData,
  mockCourseModule,
  mockCourseBonus,
  mockCourseAnalytics,
  mockCourseApiResponse,
  createMockCourse,
  createMockCourses,
  createMockApiResponse,
  waitForLoading,
  waitForData,
  waitForError,
  renderWithCourseContext,
} from './__tests__/testUtils';

export {
  CourseSchema,
  CourseModuleSchema,
  CourseBonusSchema,
  CourseSettingsSchema,
  CourseSEOSchema,
  CourseFiltersSchema,
  CourseFormSchema,
} from './schemas';

export { CourseProvider, useCourseContext } from './context/CourseContext';
export { CourseFilterProvider, useCourseFilterContext } from './context/CourseFilterContext';

export { default as CourseRoutes } from './routes';
export { default as courseRouteConfig } from './routes/config';

export { default as courseTranslations } from './locales';
export { useCourseTranslation } from './locales/hooks';

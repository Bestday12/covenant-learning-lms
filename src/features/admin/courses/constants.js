export const COURSE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  COMING_SOON: 'coming_soon',
  IN_REVIEW: 'in_review',
  SCHEDULED: 'scheduled',
};

export const COURSE_STATUS_LABELS = {
  [COURSE_STATUSES.DRAFT]: 'Draft',
  [COURSE_STATUSES.PUBLISHED]: 'Published',
  [COURSE_STATUSES.ARCHIVED]: 'Archived',
  [COURSE_STATUSES.COMING_SOON]: 'Coming soon',
  [COURSE_STATUSES.IN_REVIEW]: 'In review',
  [COURSE_STATUSES.SCHEDULED]: 'Scheduled',
};

export const COURSE_STATUS_COLORS = {
  [COURSE_STATUSES.DRAFT]: 'slate',
  [COURSE_STATUSES.PUBLISHED]: 'emerald',
  [COURSE_STATUSES.ARCHIVED]: 'slate',
  [COURSE_STATUSES.COMING_SOON]: 'amber',
  [COURSE_STATUSES.IN_REVIEW]: 'blue',
  [COURSE_STATUSES.SCHEDULED]: 'indigo',
};

export const COURSE_STATUS_ICONS = {
  [COURSE_STATUSES.DRAFT]: 'Clock',
  [COURSE_STATUSES.PUBLISHED]: 'CheckCircle2',
  [COURSE_STATUSES.ARCHIVED]: 'Archive',
  [COURSE_STATUSES.COMING_SOON]: 'Zap',
  [COURSE_STATUSES.IN_REVIEW]: 'Loader2',
  [COURSE_STATUSES.SCHEDULED]: 'Calendar',
};

export const COURSE_DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

export const COURSE_DIFFICULTY_LABELS = {
  [COURSE_DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
  [COURSE_DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate',
  [COURSE_DIFFICULTY_LEVELS.ADVANCED]: 'Advanced',
  [COURSE_DIFFICULTY_LEVELS.EXPERT]: 'Expert',
};

export const COURSE_DIFFICULTY_COLORS = {
  [COURSE_DIFFICULTY_LEVELS.BEGINNER]: 'emerald',
  [COURSE_DIFFICULTY_LEVELS.INTERMEDIATE]: 'blue',
  [COURSE_DIFFICULTY_LEVELS.ADVANCED]: 'amber',
  [COURSE_DIFFICULTY_LEVELS.EXPERT]: 'rose',
};

export const COURSE_CATEGORIES = [
  { value: 'marriage', label: 'Marriage', icon: 'Heart' },
  { value: 'parenting', label: 'Parenting', icon: 'Users' },
  { value: 'finance', label: 'Finance', icon: 'DollarSign' },
  { value: 'leadership', label: 'Leadership', icon: 'Crown' },
  { value: 'spiritual', label: 'Spiritual growth', icon: 'Sparkles' },
  { value: 'career', label: 'Career development', icon: 'TrendingUp' },
  { value: 'health', label: 'Health & wellness', icon: 'Activity' },
  { value: 'relationships', label: 'Relationships', icon: 'HeartHandshake' },
  { value: 'technology', label: 'Technology', icon: 'Monitor' },
  { value: 'education', label: 'Education', icon: 'BookOpen' },
  { value: 'business', label: 'Business', icon: 'Briefcase' },
  { value: 'personal', label: 'Personal development', icon: 'User' },
];

export const COURSE_DEFAULT_VALUES = {
  title: '',
  subtitle: '',
  slug: '',
  description: '',
  category: '',
  instructor: '',
  price: 0,
  currency: 'GBP',
  difficulty: COURSE_DIFFICULTY_LEVELS.BEGINNER,
  language: 'English',
  status: COURSE_STATUSES.DRAFT,
  visibility: 'private',
  featured: false,
  estimatedDuration: '',
  prerequisites: [],
  learningObjectives: [],
  targetAudience: [],
  tags: [],
  modules: [],
  bonus_resources: [],
  settings: {
    allowComments: true,
    allowDownloads: true,
    showProgress: true,
    showCertificate: true,
    requirePayment: true,
    allowRefund: true,
    refundPolicy: '14-days',
  },
  seo: {
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
  },
};

export const COURSE_VALIDATION_RULES = {
  title: { required: true, minLength: 3, maxLength: 100 },
  slug: { required: true, minLength: 3, maxLength: 100, pattern: /^[a-z0-9-]+$/ },
  description: { required: true, minLength: 20, maxLength: 5000 },
  category: { required: true },
  instructor: { required: true },
  difficulty: { required: true },
  price: { required: false, min: 0 },
  estimatedDuration: { pattern: /^\d+\s*(min|hour|day)s?$/i },
};

export const COURSE_VALIDATION_MESSAGES = {
  title: {
    required: 'Title is required',
    minLength: 'Title must be at least 3 characters',
    maxLength: 'Title must be less than 100 characters',
  },
  slug: {
    required: 'Slug is required',
    minLength: 'Slug must be at least 3 characters',
    maxLength: 'Slug must be less than 100 characters',
    pattern: 'Slug can only contain lowercase letters, numbers, and hyphens',
  },
  description: {
    required: 'Description is required',
    minLength: 'Description must be at least 20 characters',
    maxLength: 'Description must be less than 5000 characters',
  },
  category: { required: 'Please select a category' },
  instructor: { required: 'Please select an instructor' },
  difficulty: { required: 'Please select a difficulty level' },
  price: { min: 'Price cannot be negative' },
  estimatedDuration: { pattern: 'Format: 30 min, 2 hours, 3 days' },
};

export const COURSE_SORT_OPTIONS = [
  { value: 'title', label: 'Title A-Z' },
  { value: 'created_at', label: 'Date created' },
  { value: 'updated_at', label: 'Date updated' },
  { value: 'student_count', label: 'Most popular' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'completion_rate', label: 'Completion rate' },
];

export const COURSE_FILTER_OPTIONS = {
  status: [
    { value: '', label: 'All statuses' },
    { value: COURSE_STATUSES.DRAFT, label: 'Draft' },
    { value: COURSE_STATUSES.PUBLISHED, label: 'Published' },
    { value: COURSE_STATUSES.ARCHIVED, label: 'Archived' },
    { value: COURSE_STATUSES.COMING_SOON, label: 'Coming soon' },
    { value: COURSE_STATUSES.IN_REVIEW, label: 'In review' },
    { value: COURSE_STATUSES.SCHEDULED, label: 'Scheduled' },
  ],
  difficulty: [
    { value: '', label: 'All levels' },
    ...Object.entries(COURSE_DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
  ],
  dateRanges: [
    { value: '', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'quarter', label: 'This quarter' },
    { value: 'year', label: 'This year' },
  ],
  moduleCount: [
    { value: '', label: 'Any' },
    { value: '0', label: '0 modules' },
    { value: '1-5', label: '1-5 modules' },
    { value: '6-10', label: '6-10 modules' },
    { value: '10+', label: '10+ modules' },
  ],
};

export const COURSE_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  COMPACT: 'compact',
  TABLE: 'table',
};

export const COURSE_PAGE_SIZES = [10, 25, 50, 100];
export const COURSE_DEFAULT_PAGE_SIZE = 10;

export const COURSE_EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  XLSX: 'xlsx',
  PDF: 'pdf',
};

export const COURSE_IMPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  XLSX: 'xlsx',
};

export const COURSE_DATE_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};

export const COURSE_MODULE_TYPES = {
  TEACHING: 'teaching',
  REFLECTION: 'reflection',
  DISCUSSION: 'discussion',
  EXERCISE: 'exercise',
  WORKSHEET: 'worksheet',
  VIDEO: 'video',
  AUDIO: 'audio',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
};

export const COURSE_MODULE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const COURSE_BONUS_TYPES = {
  PDF: 'pdf',
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
  LINK: 'link',
  DOCUMENT: 'document',
  TEMPLATE: 'template',
  CHECKLIST: 'checklist',
  WORKSHEET: 'worksheet',
  CHALLENGE: 'challenge',
};

export const COURSE_PRICING_MODELS = {
  FREE: 'free',
  PAID: 'paid',
  SUBSCRIPTION: 'subscription',
  DONATION: 'donation',
};

export const COURSE_CURRENCIES = [
  { value: 'GBP', label: '£ GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'NGN', label: '₦ NGN' },
  { value: 'KES', label: 'KSh KES' },
  { value: 'ZAR', label: 'R ZAR' },
  { value: 'AUD', label: '$ AUD' },
  { value: 'CAD', label: '$ CAD' },
];

export const COURSE_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Mandarin',
  'Arabic',
  'Russian',
  'Japanese',
  'Korean',
  'Italian',
  'Dutch',
  'Swahili',
  'Yoruba',
  'Igbo',
  'Hausa',
];

export const COURSE_LIMITS = {
  maxModules: 50,
  maxBonuses: 20,
  maxTags: 10,
  maxTitleLength: 100,
  maxDescriptionLength: 5000,
  maxLearningObjectives: 20,
  maxTargetAudience: 10,
  maxPrerequisites: 10,
  maxFaq: 20,
  maxAnnouncements: 100,
};

export const COURSE_MAX_MODULES = COURSE_LIMITS.maxModules;
export const COURSE_MAX_BONUSES = COURSE_LIMITS.maxBonuses;
export const COURSE_MAX_TAGS = COURSE_LIMITS.maxTags;
export const COURSE_MAX_TITLE_LENGTH = COURSE_LIMITS.maxTitleLength;
export const COURSE_MAX_DESCRIPTION_LENGTH = COURSE_LIMITS.maxDescriptionLength;
export const COURSE_MAX_LEARNING_OBJECTIVES = COURSE_LIMITS.maxLearningObjectives;
export const COURSE_MAX_TARGET_AUDIENCE = COURSE_LIMITS.maxTargetAudience;
export const COURSE_MAX_PREREQUISITES = COURSE_LIMITS.maxPrerequisites;
export const COURSE_MAX_FAQ = COURSE_LIMITS.maxFaq;
export const COURSE_MAX_ANNOUNCEMENTS = COURSE_LIMITS.maxAnnouncements;

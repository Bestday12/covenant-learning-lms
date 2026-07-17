import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Save,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Upload,
  Trash2,
  Plus,
  ChevronDown,
  FileText,
  BookOpen,
  DollarSign,
  Globe,
  Settings2,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Circle,
  Calendar,
  Tag,
  Users,
  Clock,
  Sparkles,
  Hash,
  Link2,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Type,
  LayoutGrid,
  List,
  Shield,
  RotateCw,
  Copy,
  Star,
  Award,
  Info,
  HelpCircle,
  Settings,
} from 'lucide-react';

const getInitialFormData = (course = null) => ({
  title: course?.title || '',
  subtitle: course?.subtitle || '',
  slug: course?.slug || '',
  description: course?.description || '',
  category: course?.category || '',
  instructor: course?.instructor || '',
  price: course?.price ?? '',
  currency: course?.currency || 'GBP',
  difficulty: course?.difficulty || '',
  language: course?.language || 'English',
  status: course?.status || 'draft',
  featured: Boolean(course?.featured),
  visibility: course?.visibility || 'public',
  estimatedDuration: course?.estimatedDuration || '',
  prerequisites: course?.prerequisites || [],
  learningObjectives: course?.learningObjectives || [],
  targetAudience: course?.targetAudience || [],
  tags: course?.tags || [],
  image: course?.image || null,
  imageUrl: course?.imageUrl || course?.image || '',
  videoUrl: course?.videoUrl || '',
  promoVideo: course?.promoVideo || '',
  syllabus: course?.syllabus || [],
  resources: course?.resources || [],
  faqs: course?.faqs || [],
  settings: {
    allowComments: course?.settings?.allowComments ?? True,
    allowDownloads: course?.settings?.allowDownloads ?? True,
    showProgress: course?.settings?.showProgress ?? True,
    showCertificate: course?.settings?.showCertificate ?? True,
    requirePayment: course?.settings?.requirePayment ?? True,
    allowRefund: course?.settings?.allowRefund ?? True,
    refundPolicy: course?.settings?.refundPolicy || '14-days',
  },
  seo: {
    title: course?.seo?.title || '',
    description: course?.seo?.description || '',
    keywords: course?.seo?.keywords || [],
    ogImage: course?.seo?.ogImage || '',
  },
});

const CourseForm = ({
  course = null,
  isEditing = false,
  onSubmit,
  onCancel,
  onSaveDraft,
  onPreview,
  isSaving = false,
  isSubmitting = false,
  isLoading = false,
  isReadOnly = false,
  validateOnChange = true,
  showValidationSummary = true,
  categories = [],
  instructors = [],
  difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Mandarin'],
  className = '',
  compact = false,
  showSidebar = true,
  showProgress = true,
}) => {
  const [formData, setFormData] = useState(() => getInitialFormData(course));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreview, setImagePreview] = useState(course?.imageUrl || course?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(False)
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(False);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(False);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const autosaveRef = useRef(null);
  const slugManuallyEditedRef = useRef(Boolean(course?.slug));

  const steps = useMemo(() => [
    { id: 'basic', label: 'Basic Info', icon: <FileText className="h-4 w-4" /> },
    { id: 'content', label: 'Content', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'pricing', label: 'Pricing & Access', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings2 className="h-4 w-4" /> },
    { id: 'seo', label: 'SEO', icon: <Globe className="h-4 w-4" /> },
  ], []);

  useEffect(() => {
    setFormData(getInitialFormData(course));
    setErrors({});
    setTouched({});
    setCurrentStep(0);
    setActiveTab('basic');
    setIsDirty(false);
    setImagePreview(course?.imageUrl || course?.image || null);
    slugManuallyEditedRef.current = Boolean(course?.slug);
  }, [course]);

  const validateField = useCallback((field, value) => {
    let message = '';
    if (field === 'title') {
      if (!value || value.trim().length < 3) message = 'Title must be at least 3 characters';
      else if (value.trim().length > 100) message = 'Title must be less than 100 characters';
    }
    if (field === 'slug') {
      if (!value || value.trim().length < 3) message = 'Slug must be at least 3 characters';
      else if (!/^[a-z0-9-]+$/.test(value)) message = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (field === 'description') {
      if (!value || value.trim().length < 20) message = 'Description must be at least 20 characters';
      else if (value.trim().length > 5000) message = 'Description must be less than 5000 characters';
    }
    if (field === 'category' && !value) message = 'Please select a category';
    if (field === 'instructor' && !value) message = 'Please select an instructor';
    if (field === 'price' && value !== '' && isNaN(value)) message = 'Price must be a number';
    if (field === 'price' && value !== '' && parseFloat(value) < 0) message = 'Price cannot be negative';
    if (field === 'difficulty' && !value) message = 'Please select a difficulty level';
    if (field === 'estimatedDuration' && value && !/^\d+\s*(min|hour|day)s?$/.test(value)) message = 'Format: 30 min, 2 hours, 3 days';

    setErrors(prev => {
      const next = { ...prev };
      if (message) next[field] = message; else delete next[field];
      return next;
    });
    return !message;
  }, []);

  const validateForm = useCallback(() => {
    const fields = ['title', 'slug', 'description', 'category', 'instructor', 'difficulty'];
    let ok = true;
    fields.forEach(field => {
      if (!validateField(field, formData[field])) ok = false;
    });
    return ok;
  }, [formData, validateField]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugManuallyEditedRef.current && !prev.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return next;
    });
    setTouched(prev => ({ ...prev, [field]: true }));
    setIsDirty(true);
    if (validateOnChange) validateField(field, value);
  }, [validateOnChange, validateField]);

  const handleSlugChange = useCallback((value) => {
    slugManuallyEditedRef.current = true;
    handleChange('slug', value.toLowerCase());
  }, [handleChange]);

  const handleNestedChange = useCallback((parent, field, value) => {
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
    setIsDirty(true);
  }, []);

  const handleArrayChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleAddArrayItem = useCallback((field, item) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), item] }));
    setIsDirty(true);
  }, []);

  const handleRemoveArrayItem = useCallback((field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    setIsDirty(true);
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please upload an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'Image must be less than 5MB' }));
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 12);
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(timer);
    }, 120);
    const reader = new FileReader();
    reader.onload = (event) => {
      clearInterval(timer);
      setImagePreview(event.target.result);
      setFormData(prev => ({ ...prev, image: file, imageUrl: event.target.result }));
      setIsUploading(false);
      setUploadProgress(100);
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsDirty(true);
    setShowDeleteImageConfirm(false);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus?.();
      return;
    }
    onSubmit?.(formData);
    setIsDirty(false);
  }, [formData, validateForm, onSubmit]);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft?.(formData);
    setIsDirty(false);
  }, [formData, onSaveDraft]);

  const handleCancel = useCallback(() => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    onCancel?.();
  }, [isDirty, onCancel]);

  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      if (onSaveDraft) {
        onSaveDraft(formData);
        setIsDirty(false);
      }
    }, 30000);
    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [formData, isDirty, isSubmitting, onSaveDraft]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isDirty) handleSaveDraft();
      }
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isDirty, handleSaveDraft, handleCancel]);

  const completion = useMemo(() => {
    const required = ['title', 'slug', 'description', 'category', 'instructor', 'difficulty'];
    const done = required.filter(field => String(formData[field] || '').trim().length > 0).length;
    return Math.round((done / required.length) * 100);
  }, [formData]);

  const nextStep = useCallback(() => setCurrentStep(s => Math.min(steps.length - 1, s + 1)), [steps.length]);
  const prevStep = useCallback(() => setCurrentStep(s => Math.max(0, s - 1)), []);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {showProgress && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Course completion</p>
              <p className="text-xs text-slate-500">{completion}% complete</p>
            </div>
            <span className="text-sm font-semibold text-slate-900 tabular-nums">{completion}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
      )}

      {showValidationSummary && Object.keys(errors).length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Fix these issues before publishing</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${currentStep === index ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {step.icon}
                {step.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {currentStep === 0 && (
              <div className="space-y-4">
                <Field label="Title" error={errors.title}>
                  <input ref={titleInputRef} value={formData.title} onChange={e => handleChange('title', e.target.value)} className="input" data-error={Boolean(errors.title) || undefined} />
                </Field>
                <Field label="Subtitle" error={errors.subtitle}>
                  <input value={formData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="input" />
                </Field>
                <Field label="Slug" error={errors.slug}>
                  <input value={formData.slug} onChange={e => handleSlugChange(e.target.value)} className="input" data-error={Boolean(errors.slug) || undefined} />
                </Field>
                <Field label="Description" error={errors.description}>
                  <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} className="input min-h-40" data-error={Boolean(errors.description) || undefined} />
                </Field>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <Field label="Category" error={errors.category}>
                  <select value={formData.category} onChange={e => handleChange('category', e.target.value)} className="input" data-error={Boolean(errors.category) || undefined}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.value || c} value={c.value || c}>{c.label || c}</option>)}
                  </select>
                </Field>
                <Field label="Instructor" error={errors.instructor}>
                  <select value={formData.instructor} onChange={e => handleChange('instructor', e.target.value)} className="input" data-error={Boolean(errors.instructor) || undefined}>
                    <option value="">Select instructor</option>
                    {instructors.map(i => <option key={i.value || i} value={i.value || i}>{i.label || i}</option>)}
                  </select>
                </Field>
                <Field label="Difficulty" error={errors.difficulty}>
                  <select value={formData.difficulty} onChange={e => handleChange('difficulty', e.target.value)} className="input" data-error={Boolean(errors.difficulty) || undefined}>
                    <option value="">Select difficulty</option>
                    {difficultyLevels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                </Field>
                <Field label="Estimated duration" error={errors.estimatedDuration}>
                  <input value={formData.estimatedDuration} onChange={e => handleChange('estimatedDuration', e.target.value)} className="input" />
                </Field>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  {imagePreview ? <img src={imagePreview} alt="Course preview" className="mx-auto mb-4 max-h-56 rounded-xl object-cover" /> : <ImageIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" />}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white">
                      <Upload className="h-4 w-4" /> Upload image
                    </button>
                    {imagePreview && (
                      <button type="button" onClick={() => setShowDeleteImageConfirm(true)} className="btn-secondary inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    )}
                  </div>
                  {isUploading && <p className="mt-3 text-sm text-slate-500">Uploading… {uploadProgress}%</p>}
                </div>
                {showDeleteImageConfirm && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm text-rose-800">Remove the current course image?</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={handleRemoveImage} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white">Remove</button>
                      <button type="button" onClick={() => setShowDeleteImageConfirm(false)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Field label="Price" error={errors.price}>
                  <input value={formData.price} onChange={e => handleChange('price', e.target.value)} className="input" />
                </Field>
                <Field label="Currency">
                  <input value={formData.currency} onChange={e => handleChange('currency', e.target.value)} className="input" />
                </Field>
                <Field label="Visibility">
                  <select value={formData.visibility} onChange={e => handleChange('visibility', e.target.value)} className="input">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <ToggleRow label="Allow comments" checked={formData.settings.allowComments} onChange={v => handleNestedChange('settings', 'allowComments', v)} />
                <ToggleRow label="Allow downloads" checked={formData.settings.allowDownloads} onChange={v => handleNestedChange('settings', 'allowDownloads', v)} />
                <ToggleRow label="Show progress" checked={formData.settings.showProgress} onChange={v => handleNestedChange('settings', 'showProgress', v)} />
                <ToggleRow label="Show certificate" checked={formData.settings.showCertificate} onChange={v => handleNestedChange('settings', 'showCertificate', v)} />
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <Field label="SEO title">
                  <input value={formData.seo.title} onChange={e => handleNestedChange('seo', 'title', e.target.value)} className="input" />
                </Field>
                <Field label="SEO description">
                  <textarea value={formData.seo.description} onChange={e => handleNestedChange('seo', 'description', e.target.value)} className="input min-h-32" />
                </Field>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={prevStep} disabled={currentStep === 0} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
              <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                Cancel
              </button>
              <button type="button" onClick={handleSaveDraft} disabled={isSaving || !isDirty} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
                {isSaving ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <Save className="mr-2 inline h-4 w-4" />} Save draft
              </button>
              <button type={currentStep === steps.length - 1 ? 'submit' : 'button'} onClick={currentStep === steps.length - 1 ? undefined : nextStep} disabled={isSubmitting} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                {currentStep === steps.length - 1 ? 'Publish / Update' : 'Next'} <ArrowRight className="ml-2 inline h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {showSidebar && (
          <aside className="w-full lg:w-80">
            <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Course summary</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <SummaryRow label="Status" value={formData.status} icon={formData.status === 'draft' ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} />
                <SummaryRow label="Visibility" value={formData.visibility} icon={formData.visibility === 'public' ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />} />
                <SummaryRow label="Featured" value={formData.featured ? 'Yes' : 'No'} icon={<Star className="h-4 w-4" />} />
                <SummaryRow label="Has image" value={imagePreview ? 'Yes' : 'No'} icon={<ImageIcon className="h-4 w-4" />} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </form>
  );
};

const Field = ({ label, error, children }) => (
  <label className="block">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
    {children}
  </label>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
    <span>{label}</span>
    <span className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
      <span className={`h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </span>
  </button>
);

const SummaryRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
    <div className="flex items-center gap-2 text-slate-500">{icon}<span>{label}</span></div>
    <span className="font-medium text-slate-900">{value}</span>
  </div>
);

Field.propTypes = { label: PropTypes.string.isRequired, error: PropTypes.string, children: PropTypes.node.isRequired };
ToggleRow.propTypes = { label: PropTypes.string.isRequired, checked: PropTypes.bool.isRequired, onChange: PropTypes.func.isRequired };
SummaryRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, icon: PropTypes.node };

CourseForm.propTypes = {
  course: PropTypes.object,
  isEditing: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onPreview: PropTypes.func,
  isSaving: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  isLoading: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  showValidationSummary: PropTypes.bool,
  categories: PropTypes.array,
  instructors: PropTypes.array,
  difficultyLevels: PropTypes.array,
  languages: PropTypes.array,
  className: PropTypes.string,
  compact: PropTypes.bool,
  showSidebar: PropTypes.bool,
  showProgress: PropTypes.bool,
};

export default CourseForm;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Share2,
  Link2,
  Twitter,
  Facebook,
  Mail,
  Copy,
  Check,
  Loader2,
  Rocket,
  BarChart3,
  Bell,
  Send,
  PartyPopper,
  ExternalLink,
  Download,
  ClipboardCheck,
  CircleX,
  Settings,
} from 'lucide-react';

const buildShareLinks = (course, baseUrl) => {
  const slugOrId = course?.slug || course?.id || 'course';
  const direct = `${baseUrl}/courses/${slugOrId}`;
  return {
    direct,
    preview: `${direct}?preview=true`,
    social: {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(course?.title || 'Course')}&url=${encodeURIComponent(direct)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(direct)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(direct)}`,
      email: `mailto:?subject=${encodeURIComponent(course?.title || 'Course')}&body=${encodeURIComponent(`Check out this course: ${direct}`)}`,
    },
    embed: `<iframe src="${direct}" width="100%" height="600" frameborder="0"></iframe>`,
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(direct)}`,
  };
};

const validateCourse = (course) => {
  const modules = Array.isArray(course?.modules) ? course.modules : [];
  const publishedModules = modules.filter((m) => m.status === 'published').length;
  const completionRate = modules.length > 0 ? Math.round((publishedModules / modules.length) * 100) : 0;
  const issues = [];

  if (!course?.title || course.title.trim().length < 3) {
    issues.push({ field: 'title', message: 'Course title must be at least 3 characters', severity: 'error' });
  }
  if (!course?.description || course.description.trim().length < 20) {
    issues.push({ field: 'description', message: 'Course description must be at least 20 characters', severity: 'error' });
  }
  if (!course?.instructor || String(course.instructor).trim().length < 2) {
    issues.push({ field: 'instructor', message: 'Instructor name is required', severity: 'error' });
  }
  if (!course?.price || Number(course.price) <= 0) {
    issues.push({ field: 'price', message: 'Course price must be set', severity: 'warning' });
  }
  if (modules.length === 0) {
    issues.push({ field: 'modules', message: 'Course must have at least one module', severity: 'error' });
  }
  if (completionRate < 100) {
    issues.push({ field: 'modules', message: `${publishedModules} of ${modules.length} modules are published (${completionRate}%)`, severity: 'warning' });
  }

  return {
    issues,
    modules,
    publishedModules,
    completionRate,
    isReadyToPublish: modules.length > 0 && completionRate === 100 && !issues.some((i) => i.severity === 'error'),
  };
};

const CoursePublishPanel = ({
  course,
  baseUrl = '',
  analytics = null,
  recentAnnouncements = [],
  onPublish,
  onUnpublish,
  onArchive,
  onUpdateSettings,
  onSchedulePublish,
  onSendAnnouncement,
  onGenerateShareLinks,
  onPreview,
  isPublishing = false,
  isSaving = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(null);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false);

  const derived = useMemo(() => validateCourse(course), [course]);
  const shareLinks = useMemo(() => buildShareLinks(course, baseUrl || window.location.origin), [baseUrl, course]);

  const isPublished = course?.status === 'published';
  const isArchived = course?.status === 'archived';
  const isDraft = course?.status === 'draft';
  const errorCount = derived.issues.filter((i) => i.severity === 'error').length;
  const warningCount = derived.issues.filter((i) => i.severity === 'warning').length;

  useEffect(() => {
    onGenerateShareLinks?.(shareLinks);
  }, [onGenerateShareLinks, shareLinks]);

  const handleCopy = useCallback((value, key) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedLink(key);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  }, []);

  const handlePublish = useCallback(() => {
    if (!derived.isReadyToPublish) {
      setActiveTab('validation');
      return;
    }
    setShowPublishConfirmation(true);
  }, [derived.isReadyToPublish]);

  const confirmPublish = useCallback(() => {
    setShowPublishConfirmation(false);
    onPublish?.();
  }, [onPublish]);

  const handleSchedule = useCallback(() => {
    if (!scheduleDate || !scheduleTime) return;
    onSchedulePublish?.(new Date(`${scheduleDate}T${scheduleTime}`));
  }, [onSchedulePublish, scheduleDate, scheduleTime]);

  const handleSendAnnouncement = useCallback(() => {
    const trimmed = announcementMessage.trim();
    if (!trimmed) return;
    onSendAnnouncement?.(trimmed);
    setAnnouncementMessage('');
  }, [announcementMessage, onSendAnnouncement]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'validation', label: 'Validation', icon: ClipboardCheck, badge: derived.issues.length },
    { id: 'sharing', label: 'Sharing', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <StatusHeader
        course={course}
        isPublished={isPublished}
        isArchived={isArchived}
        isDraft={isDraft}
        isReadyToPublish={derived.isReadyToPublish}
        moduleCount={derived.modules.length}
        publishedModules={derived.publishedModules}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        onUnpublish={onUnpublish}
        onArchive={onArchive}
      />

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge ? <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{tab.badge}</span> : null}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <OverviewTab
              course={course}
              derived={derived}
              isPublished={isPublished}
              isArchived={isArchived}
              onUpdateSettings={onUpdateSettings}
              scheduleDate={scheduleDate}
              scheduleTime={scheduleTime}
              setScheduleDate={setScheduleDate}
              setScheduleTime={setScheduleTime}
              onSchedule={handleSchedule}
              isPublishing={isPublishing}
            />
          ) : null}

          {activeTab === 'validation' ? (
            <ValidationTab issues={derived.issues} errorCount={errorCount} warningCount={warningCount} />
          ) : null}

          {activeTab === 'sharing' ? (
            <SharingTab shareLinks={shareLinks} copiedLink={copiedLink} onCopy={handleCopy} onPreview={onPreview} course={course} />
          ) : null}

          {activeTab === 'analytics' ? (
            <AnalyticsTab analytics={analytics} />
          ) : null}

          {activeTab === 'announcements' ? (
            <AnnouncementsTab
              announcementMessage={announcementMessage}
              setAnnouncementMessage={setAnnouncementMessage}
              onSendAnnouncement={handleSendAnnouncement}
              recentAnnouncements={recentAnnouncements}
            />
          ) : null}
        </div>
      </div>

      {showPublishConfirmation ? (
        <PublishConfirmationModal
          courseTitle={course?.title}
          moduleCount={derived.modules.length}
          isPublishing={isPublishing}
          onConfirm={confirmPublish}
          onCancel={() => setShowPublishConfirmation(false)}
        />
      ) : null}
    </div>
  );
};

const StatusHeader = ({
  course,
  isPublished,
  isArchived,
  isDraft,
  isReadyToPublish,
  moduleCount,
  publishedModules,
  isPublishing,
  onPublish,
  onUnpublish,
  onArchive,
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200/40">
          {isPublished ? <Globe className="h-7 w-7" /> : isArchived ? <Lock className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">{course?.title || 'Untitled Course'}</h2>
            <StatusPill isPublished={isPublished} isArchived={isArchived} isDraft={isDraft} />
          </div>
          <p className="text-sm text-slate-500">
            {course?.subtitle || 'No subtitle set'} • {moduleCount} modules • {publishedModules} published
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!isPublished && !isArchived ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${isReadyToPublish ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 hover:bg-slate-400'}`}
          >
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {isReadyToPublish ? 'Publish course' : 'Fix issues to publish'}
          </button>
        ) : null}

        {isPublished ? (
          <>
            <button type="button" onClick={onUnpublish} className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100">
              <EyeOff className="h-4 w-4" />
              Unpublish
            </button>
            <button type="button" onClick={onArchive} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Lock className="h-4 w-4" />
              Archive
            </button>
          </>
        ) : null}
      </div>
    </div>
  </div>
);

const StatusPill = ({ isPublished, isArchived, isDraft }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : isArchived ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
    {isPublished ? <CheckCircle2 className="h-3.5 w-3.5" /> : isArchived ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
    {isPublished ? 'Published' : isArchived ? 'Archived' : isDraft ? 'Draft' : 'Draft'}
  </span>
);

const OverviewTab = ({
  course,
  derived,
  isPublished,
  isArchived,
  onUpdateSettings,
  scheduleDate,
  scheduleTime,
  setScheduleDate,
  setScheduleTime,
  onSchedule,
  isPublishing,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard icon={<BookOpen className="h-5 w-5" />} label="Modules" value={derived.modules.length} subValue={`${derived.publishedModules} published`} />
      <StatCard icon={<Users className="h-5 w-5" />} label="Students" value={course?.studentCount || 0} subValue="Total enrolled" />
      <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completion" value={`${derived.completionRate}%`} subValue={derived.isReadyToPublish ? 'Ready to publish' : 'Needs attention'} />
      <StatCard icon={<Calendar className="h-5 w-5" />} label="Updated" value={course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Never'} subValue="Latest edit" />
      <StatCard icon={<Eye className="h-5 w-5" />} label="Visibility" value={isPublished ? 'Public' : isArchived ? 'Archived' : 'Private'} subValue={isPublished ? 'Searchable' : 'Hidden'} />
    </div>

    <PanelCard title="Visibility & privacy" icon={<Globe className="h-4 w-4" />}>
      <div className="space-y-3">
        <SettingRow
          title="Course visibility"
          description={isPublished ? 'Anyone can access this course' : isArchived ? 'This course is archived and hidden' : 'Only admins and preview users can access'}
          action={
            <div className="flex gap-2">
              <button type="button" onClick={() => onUpdateSettings?.({ visibility: 'public' })} className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Public</button>
              <button type="button" onClick={() => onUpdateSettings?.({ visibility: 'private' })} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200">Private</button>
            </div>
          }
        />
        <SettingRow
          title="Search engine indexing"
          description={course?.indexed ? 'Allowed for search engines' : 'Blocked from search engines'}
          action={<button type="button" onClick={() => onUpdateSettings?.({ indexed: !course?.indexed })} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200">{course?.indexed ? 'Indexed' : 'Blocked'}</button>}
        />
      </div>
    </PanelCard>

    <PanelCard title="Scheduled publishing" icon={<Clock className="h-4 w-4" />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Date</label>
          <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Time</label>
          <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>
      <button type="button" onClick={onSchedule} disabled={!scheduleDate || !scheduleTime || isPublishing} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        <Clock className="h-4 w-4" />
        Schedule publish
      </button>
    </PanelCard>
  </div>
);

const ValidationTab = ({ issues, errorCount, warningCount }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
        {errorCount === 0 && warningCount === 0 ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <AlertTriangle className="h-6 w-6 text-amber-500" />}
      </div>
      <div>
        <p className="font-medium text-slate-900">{errorCount === 0 && warningCount === 0 ? 'Course is ready to publish' : `${errorCount} errors, ${warningCount} warnings`}</p>
        <p className="text-sm text-slate-500">Fix errors before publishing. Warnings are recommended but not required.</p>
      </div>
    </div>

    {issues.length === 0 ? (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center">
        <PartyPopper className="h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 text-lg font-semibold text-emerald-700">Perfect</h3>
        <p className="mt-1 text-sm text-emerald-600">Your course meets all requirements. Ready to launch.</p>
      </div>
    ) : (
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div key={`${issue.field}-${index}`} className={`flex items-start gap-3 rounded-xl border p-4 ${issue.severity === 'error' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
            {issue.severity === 'error' ? <CircleX className="mt-0.5 h-5 w-5 text-rose-500" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-slate-900">{issue.message}</p>
              <p className="text-xs text-slate-500">Field: {issue.field}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SharingTab = ({ shareLinks, copiedLink, onCopy, onPreview, course }) => (
  <div className="space-y-4">
    <LinkCard label="Direct link" value={shareLinks.direct} copied={copiedLink === 'direct'} onCopy={() => onCopy(shareLinks.direct, 'direct')} externalHref={shareLinks.direct} />
    <LinkCard label="Admin preview" value={shareLinks.preview} copied={copiedLink === 'preview'} onCopy={() => onCopy(shareLinks.preview, 'preview')} onPreview={() => onPreview?.(course)} />

    <PanelCard title="Share on social media" icon={<Share2 className="h-4 w-4" />}>
      <div className="flex flex-wrap gap-2">
        <SocialButton href={shareLinks.social.twitter} label="Twitter" icon={<Twitter className="h-4 w-4" />} className="bg-[#1DA1F2] hover:bg-[#188cd8]" />
        <SocialButton href={shareLinks.social.facebook} label="Facebook" icon={<Facebook className="h-4 w-4" />} className="bg-[#1877F2] hover:bg-[#1366d5]" />
        <SocialButton href={shareLinks.social.linkedin} label="LinkedIn" icon={<Share2 className="h-4 w-4" />} className="bg-[#0A66C2] hover:bg-[#0957a5]" />
        <SocialButton href={shareLinks.social.email} label="Email" icon={<Mail className="h-4 w-4" />} className="bg-slate-700 hover:bg-slate-800" />
      </div>
    </PanelCard>

    <LinkCard label="Embed code" value={shareLinks.embed} multiline copied={copiedLink === 'embed'} onCopy={() => onCopy(shareLinks.embed, 'embed')} />

    <PanelCard title="QR code" icon={<Download className="h-4 w-4" />}>
      <div className="flex items-center gap-4">
        <img src={shareLinks.qr} alt="QR Code" className="h-24 w-24 rounded-xl border border-slate-200" />
        <a href={shareLinks.qr} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
          <Download className="mr-1.5 inline h-4 w-4" />
          Download QR
        </a>
      </div>
    </PanelCard>
  </div>
);

const AnalyticsTab = ({ analytics }) => {
  const stats = analytics || {
    totalViews: '1,234',
    enrollments: '456',
    completionRate: '67%',
    avgTime: '2.4h',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AnalyticsCard label="Total views" value={stats.totalViews} icon={<Eye className="h-4 w-4" />} />
        <AnalyticsCard label="Enrollments" value={stats.enrollments} icon={<Users className="h-4 w-4" />} />
        <AnalyticsCard label="Completion rate" value={stats.completionRate} icon={<CheckCircle2 className="h-4 w-4" />} />
        <AnalyticsCard label="Avg. time" value={stats.avgTime} icon={<Clock className="h-4 w-4" />} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
        <BarChart3 className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2">Connect your analytics provider to show live charts and engagement trends.</p>
      </div>
    </div>
  );
};

const AnnouncementsTab = ({ announcementMessage, setAnnouncementMessage, onSendAnnouncement, recentAnnouncements }) => (
  <div className="space-y-4">
    <PanelCard title="Send announcement" icon={<Bell className="h-4 w-4" />}>
      <textarea value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} placeholder="Write your announcement message..." rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
      <button type="button" onClick={onSendAnnouncement} disabled={!announcementMessage.trim()} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        <Send className="h-4 w-4" />
        Send to all students
      </button>
    </PanelCard>

    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-900">Recent announcements</p>
      {(recentAnnouncements.length > 0 ? recentAnnouncements : [
        { title: 'New module added', body: 'A new lesson is now available.', meta: 'Sent recently' },
        { title: 'Course update', body: 'Several videos were refreshed.', meta: 'Sent last week' },
      ]).map((item, index) => (
        <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium text-slate-900">{item.title}</p>
          <p className="text-sm text-slate-500">{item.body}</p>
          <p className="mt-1 text-xs text-slate-400">{item.meta}</p>
        </div>
      ))}
    </div>
  </div>
);

const PublishConfirmationModal = ({ courseTitle, moduleCount, isPublishing, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-slate-900">Publish course</h3>
      <p className="mt-2 text-sm text-slate-500">
        You are about to publish <span className="font-medium text-slate-900">{courseTitle || 'this course'}</span> with {moduleCount} modules.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={isPublishing} className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {isPublishing ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <Rocket className="mr-2 inline h-4 w-4" />}
          Confirm publish
        </button>
      </div>
    </div>
  </div>
);

const PanelCard = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
      {icon}
      {title}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const StatCard = ({ icon, label, value, subValue }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between text-slate-400">
      <span className="text-xs font-medium uppercase tracking-[0.08em]">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{subValue}</p>
  </div>
);

const SettingRow = ({ title, description, action }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div>
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    {action}
  </div>
);

const LinkCard = ({ label, value, copied, onCopy, externalHref, multiline = false, onPreview }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-sm font-medium text-slate-900">{label}</p>
    <div className="mt-2 flex items-start gap-2">
      {multiline ? (
        <textarea readOnly rows={2} value={value} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600" />
      ) : (
        <input readOnly value={value} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600" />
      )}
      <button type="button" onClick={onCopy} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </button>
      {externalHref ? (
        <a href={externalHref} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
      {onPreview ? (
        <button type="button" onClick={onPreview} className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
          <Eye className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  </div>
);

const SocialButton = ({ href, label, icon, className }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white ${className}`}>
    {icon}
    {label}
  </a>
);

const AnalyticsCard = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between text-slate-400">
      <span className="text-xs font-medium uppercase tracking-[0.08em]">{label}</span>
      {icon}
    </div>
    <p className="mt-3 text-xl font-semibold text-slate-900">{value}</p>
  </div>
);

StatusHeader.propTypes = {
  course: PropTypes.object,
  isPublished: PropTypes.bool.isRequired,
  isArchived: PropTypes.bool.isRequired,
  isDraft: PropTypes.bool.isRequired,
  isReadyToPublish: PropTypes.bool.isRequired,
  moduleCount: PropTypes.number.isRequired,
  publishedModules: PropTypes.number.isRequired,
  isPublishing: PropTypes.bool.isRequired,
  onPublish: PropTypes.func,
  onUnpublish: PropTypes.func,
  onArchive: PropTypes.func,
};

StatusPill.propTypes = {
  isPublished: PropTypes.bool.isRequired,
  isArchived: PropTypes.bool.isRequired,
  isDraft: PropTypes.bool.isRequired,
};

OverviewTab.propTypes = {
  course: PropTypes.object,
  derived: PropTypes.object.isRequired,
  isPublished: PropTypes.bool.isRequired,
  isArchived: PropTypes.bool.isRequired,
  onUpdateSettings: PropTypes.func,
  scheduleDate: PropTypes.string.isRequired,
  scheduleTime: PropTypes.string.isRequired,
  setScheduleDate: PropTypes.func.isRequired,
  setScheduleTime: PropTypes.func.isRequired,
  onSchedule: PropTypes.func.isRequired,
  isPublishing: PropTypes.bool.isRequired,
};

ValidationTab.propTypes = {
  issues: PropTypes.array.isRequired,
  errorCount: PropTypes.number.isRequired,
  warningCount: PropTypes.number.isRequired,
};

SharingTab.propTypes = {
  shareLinks: PropTypes.object.isRequired,
  copiedLink: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  course: PropTypes.object,
};

AnalyticsTab.propTypes = {
  analytics: PropTypes.object,
};

AnnouncementsTab.propTypes = {
  announcementMessage: PropTypes.string.isRequired,
  setAnnouncementMessage: PropTypes.func.isRequired,
  onSendAnnouncement: PropTypes.func.isRequired,
  recentAnnouncements: PropTypes.array.isRequired,
};

PublishConfirmationModal.propTypes = {
  courseTitle: PropTypes.string,
  moduleCount: PropTypes.number.isRequired,
  isPublishing: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

PanelCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
};

StatCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.string.isRequired,
};

SettingRow.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.node.isRequired,
};

LinkCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopy: PropTypes.func.isRequired,
  externalHref: PropTypes.string,
  multiline: PropTypes.bool,
  onPreview: PropTypes.func,
};

SocialButton.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  className: PropTypes.string.isRequired,
};

AnalyticsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

CoursePublishPanel.propTypes = {
  course: PropTypes.object,
  baseUrl: PropTypes.string,
  analytics: PropTypes.object,
  recentAnnouncements: PropTypes.array,
  onPublish: PropTypes.func,
  onUnpublish: PropTypes.func,
  onArchive: PropTypes.func,
  onUpdateSettings: PropTypes.func,
  onSchedulePublish: PropTypes.func,
  onSendAnnouncement: PropTypes.func,
  onGenerateShareLinks: PropTypes.func,
  onPreview: PropTypes.func,
  isPublishing: PropTypes.bool,
  isSaving: PropTypes.bool,
  className: PropTypes.string,
};

export default CoursePublishPanel;

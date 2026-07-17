import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  User,
  Loader2,
  ArrowUp,
  ArrowDown,
  Move,
  Sparkles,
  Layers,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const createDefaultModule = (index = 0) => ({
  moduleId: `module-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  moduleNumber: index + 1,
  slug: `new-module-${Date.now()}`,
  status: "draft",
  moduleTitle: "New Module",
  moduleTheme: "",
  estimatedDuration: "",
  welcomeText: "",
  memoryStatement: "",
  tabs: {
    teaching: { title: "Teaching", content: [], keyScriptures: [] },
    reflection: { title: "Reflection", questions: [] },
    discussion: { title: "Discussion", questions: [] },
    exercise: { title: "Exercise", instructions: "" },
    worksheets: { title: "Worksheets", items: [] },
  },
  prayerFocus: "",
  weeklyActionStep: "",
  completionText: "",
  nextModuleId: null,
});

const normalizeModules = (modules = []) =>
  modules.map((module, index) => ({
    ...createDefaultModule(index),
    ...module,
    moduleId:
      module?.moduleId ||
      `module-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    moduleNumber: index + 1,
  }));

const StatPill = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white px-3 py-2 shadow-sm">
    <span className="text-slate-400">{icon}</span>
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="ml-auto text-sm font-semibold text-slate-900">{value}</span>
  </div>
);

const ActionButton = ({
  icon,
  label,
  onClick,
  variant = "ghost",
  className = "",
  disabled = false,
  type = "button",
}) => {
  const variants = {
    primary: "border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    success: "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    warning: "border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100",
    danger: "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "border-transparent text-slate-500 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.ghost} ${className}`}
    >
      {icon}
      {label ? <span>{label}</span> : null}
    </button>
  );
};

const SortableModuleItem = ({
  module,
  index,
  totalModules,
  isActive,
  isDragging,
  onToggleExpand,
  onTogglePublish,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEdit,
  onSave,
  onCancel,
  isEditing,
  editedData,
  setEditedData,
  isSaving,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: module.moduleId,
    data: {
      type: "module",
      module,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  const statusColors = {
    published: "border-emerald-200 bg-emerald-100 text-emerald-700",
    draft: "border-amber-200 bg-amber-100 text-amber-700",
    archived: "border-slate-200 bg-slate-100 text-slate-500",
  };

  const statusIcons = {
    published: <CheckCircle2 className="h-3.5 w-3.5" />,
    draft: <Clock className="h-3.5 w-3.5" />,
    archived: <EyeOff className="h-3.5 w-3.5" />,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border border-slate-200 bg-white transition-all duration-200 ${
        isActive
          ? "border-indigo-200 ring-1 ring-indigo-200 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)]"
          : "shadow-sm hover:shadow-md"
      } ${isSortableDragging ? "z-50 scale-[1.02] shadow-2xl" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label={`Drag to reorder ${module.moduleTitle || "module"}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onToggleExpand(module.moduleId)}
          className="flex flex-1 items-center gap-3 text-left transition hover:opacity-70"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {index + 1}
          </span>

          {isEditing ? (
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={editedData?.moduleTitle || ""}
                onChange={(e) =>
                  setEditedData((prev) => ({
                    ...prev,
                    moduleTitle: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Module title..."
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={editedData?.moduleTheme || ""}
                onChange={(e) =>
                  setEditedData((prev) => ({
                    ...prev,
                    moduleTheme: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Module theme (optional)..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-slate-900">
                  {module.moduleTitle}
                </span>
                {module.moduleTheme ? (
                  <span className="hidden truncate text-xs text-slate-400 sm:inline">
                    — {module.moduleTheme}
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    statusColors[module.status] || statusColors.draft
                  }`}
                >
                  {statusIcons[module.status] || statusIcons.draft}
                  {module.status || "draft"}
                </span>
                {module.estimatedDuration ? (
                  <span className="text-[10px] text-slate-400">
                    ⏱ {module.estimatedDuration}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onToggleExpand(module.moduleId)}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={isActive ? "Collapse module" : "Expand module"}
        >
          {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isActive ? (
        <div className="space-y-4 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Teaching"
              value={module.tabs?.teaching?.content?.length || 0}
            />
            <StatPill
              icon={<User className="h-3.5 w-3.5" />}
              label="Reflections"
              value={module.tabs?.reflection?.questions?.length || 0}
            />
            <StatPill
              icon={<User className="h-3.5 w-3.5" />}
              label="Discussions"
              value={module.tabs?.discussion?.questions?.length || 0}
            />
            <StatPill
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Worksheets"
              value={module.tabs?.worksheets?.items?.length || 0}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => onSave(module.moduleId)}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => onCancel(module.moduleId)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <ActionButton
                  icon={<Edit2 className="h-3.5 w-3.5" />}
                  label="Edit"
                  onClick={() => onEdit(module.moduleId)}
                  variant="primary"
                />
                <ActionButton
                  icon={
                    module.status === "published" ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )
                  }
                  label={module.status === "published" ? "Unpublish" : "Publish"}
                  onClick={() => onTogglePublish(module.moduleId)}
                  variant={module.status === "published" ? "warning" : "success"}
                />
                <ActionButton
                  icon={<Copy className="h-3.5 w-3.5" />}
                  label="Duplicate"
                  onClick={() => onDuplicate(module.moduleId)}
                  variant="ghost"
                />
                <ActionButton
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  label="Delete"
                  onClick={() => onDelete(module.moduleId)}
                  variant="danger"
                />
                <div className="ml-auto flex items-center gap-1">
                  {index > 0 ? (
                    <ActionButton
                      icon={<ArrowUp className="h-3.5 w-3.5" />}
                      label=""
                      onClick={() => onMoveUp(module.moduleId)}
                      variant="ghost"
                      className="!p-1.5"
                    />
                  ) : null}
                  {index < totalModules - 1 ? (
                    <ActionButton
                      icon={<ArrowDown className="h-3.5 w-3.5" />}
                      label=""
                      onClick={() => onMoveDown(module.moduleId)}
                      variant="ghost"
                      className="!p-1.5"
                    />
                  ) : null}
                </div>
              </>
            )}
          </div>

          {!isEditing && module.tabs?.teaching?.content?.length > 0 ? (
            <div className="rounded-xl border border-slate-200/60 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Preview
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {module.tabs.teaching.content[0]}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const EmptyState = ({ onAddModule, isReadOnly }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
    <div className="mb-4 rounded-full bg-slate-100 p-4">
      <Layers className="h-8 w-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No modules yet</h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      Start building your course by adding your first module. Each module can contain teaching,
      reflection, discussion, exercises, and worksheets.
    </p>
    {!isReadOnly ? (
      <button
        type="button"
        onClick={onAddModule}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200/50"
      >
        <Plus className="h-4 w-4" />
        Add First Module
      </button>
    ) : null}
  </div>
);

const CourseModulesEditor = ({
  courseId,
  modules = [],
  onModulesChange,
  onSave,
  isSaving = false,
  isReadOnly = false,
  className = "",
}) => {
  const [items, setItems] = useState(() => normalizeModules(modules));
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItems(normalizeModules(modules));
    setIsDirty(false);
  }, [modules]);

  const updateItems = useCallback(
    (nextItems, options = { markDirty: true }) => {
      const normalized = normalizeModules(nextItems);
      setItems(normalized);
      onModulesChange?.(normalized);
      if (options.markDirty) {
        setIsDirty(true);
      }
    },
    [onModulesChange]
  );

  const handleDragStart = useCallback((event) => {
    setIsDragging(true);
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      setIsDragging(false);
      setActiveId(null);

      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => item.moduleId === active.id);
      const newIndex = items.findIndex((item) => item.moduleId === over.id);

      if (oldIndex < 0 || newIndex < 0) return;

      updateItems(arrayMove(items, oldIndex, newIndex));
    },
    [items, updateItems]
  );

  const handleToggleExpand = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleEdit = useCallback(
    (id) => {
      const module = items.find((m) => m.moduleId === id);
      if (!module) return;

      setEditingId(id);
      setEditedData({
        moduleTitle: module.moduleTitle || "",
        moduleTheme: module.moduleTheme || "",
      });
      setExpandedId(id);
    },
    [items]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditedData({});
  }, []);

  const handleSaveEdit = useCallback(
    async (id) => {
      const updatedItems = items.map((item) =>
        item.moduleId === id
          ? {
              ...item,
              moduleTitle: editedData.moduleTitle || item.moduleTitle,
              moduleTheme: editedData.moduleTheme || item.moduleTheme,
            }
          : item
      );

      updateItems(updatedItems);
      setEditingId(null);
      setEditedData({});

      if (onSave) {
        await onSave(updatedItems);
        setIsDirty(false);
      }
    },
    [items, editedData, onSave, updateItems]
  );

  const handleTogglePublish = useCallback(
    (id) => {
      const updatedItems = items.map((item) =>
        item.moduleId === id
          ? {
              ...item,
              status: item.status === "published" ? "draft" : "published",
            }
          : item
      );

      updateItems(updatedItems);
    },
    [items, updateItems]
  );

  const handleDuplicate = useCallback(
    (id) => {
      const moduleToDuplicate = items.find((item) => item.moduleId === id);
      if (!moduleToDuplicate) return;

      const newModule = {
        ...moduleToDuplicate,
        moduleId: `module-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        slug: `${moduleToDuplicate.slug || "module"}-copy-${Date.now()}`,
        moduleTitle: `${moduleToDuplicate.moduleTitle} (Copy)`,
        status: "draft",
      };

      const insertIndex = items.findIndex((item) => item.moduleId === id) + 1;
      const newItems = [...items];
      newItems.splice(insertIndex, 0, newModule);

      updateItems(newItems);
      setExpandedId(newModule.moduleId);
    },
    [items, updateItems]
  );

  const handleDelete = useCallback(
    (id) => {
      const module = items.find((item) => item.moduleId === id);
      const confirmed = window.confirm(
        `Delete "${module?.moduleTitle || "this module"}"? This action cannot be undone.`
      );

      if (!confirmed) return;

      const newItems = items.filter((item) => item.moduleId !== id);
      updateItems(newItems);

      if (expandedId === id) setExpandedId(null);
      if (editingId === id) {
        setEditingId(null);
        setEditedData({});
      }
    },
    [items, updateItems, expandedId, editingId]
  );

  const handleMoveUp = useCallback(
    (id) => {
      const index = items.findIndex((item) => item.moduleId === id);
      if (index <= 0) return;
      updateItems(arrayMove(items, index, index - 1));
    },
    [items, updateItems]
  );

  const handleMoveDown = useCallback(
    (id) => {
      const index = items.findIndex((item) => item.moduleId === id);
      if (index >= items.length - 1) return;
      updateItems(arrayMove(items, index, index + 1));
    },
    [items, updateItems]
  );

  const handleAddModule = useCallback(() => {
    const newModule = createDefaultModule(items.length);
    const newItems = [...items, newModule];

    updateItems(newItems);
    setExpandedId(newModule.moduleId);
    setEditingId(newModule.moduleId);
    setEditedData({
      moduleTitle: newModule.moduleTitle,
      moduleTheme: newModule.moduleTheme,
    });
  }, [items, updateItems]);

  const handleSaveAll = useCallback(async () => {
    if (!onSave) return;
    await onSave(items);
    setIsDirty(false);
  }, [items, onSave]);

  const moduleIds = useMemo(() => items.map((item) => item.moduleId), [items]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Layers className="h-5 w-5 text-indigo-500" />
            Course Modules
          </h2>
          <p className="text-sm text-slate-500">
            {items.length} module{items.length !== 1 ? "s" : ""} • Drag to reorder • Click to expand
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly ? (
            <>
              <button
                type="button"
                onClick={handleAddModule}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200/50"
              >
                <Plus className="h-4 w-4" />
                Add Module
              </button>

              {isSaving ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {isDirty && !isReadOnly ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>You have unsaved module changes.</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save all modules
          </button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState onAddModule={handleAddModule} isReadOnly={isReadOnly} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((module, index) => (
                <SortableModuleItem
                  key={module.moduleId}
                  module={module}
                  index={index}
                  totalModules={items.length}
                  isActive={expandedId === module.moduleId}
                  isDragging={isDragging}
                  onToggleExpand={handleToggleExpand}
                  onTogglePublish={handleTogglePublish}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onEdit={handleEdit}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  isEditing={editingId === module.moduleId}
                  editedData={editedData}
                  setEditedData={setEditedData}
                  isSaving={isSaving}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="rounded-2xl border-2 border-indigo-400 bg-white p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Move className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-slate-900">
                    {items.find((m) => m.moduleId === activeId)?.moduleTitle || "Module"}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {items.length > 0 && !isReadOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw className="h-4 w-4" />
            <span>
              {items.filter((m) => m.status === "published").length} of {items.length} modules published
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm("Publish all draft modules?");
                if (!confirmed) return;

                const updatedItems = items.map((item) => ({
                  ...item,
                  status: item.status === "draft" ? "published" : item.status,
                }));

                updateItems(updatedItems);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Publish All Drafts
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

StatPill.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

ActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

SortableModuleItem.propTypes = {
  module: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  totalModules: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onTogglePublish: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  editedData: PropTypes.object,
  setEditedData: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

EmptyState.propTypes = {
  onAddModule: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
};

CourseModulesEditor.propTypes = {
  courseId: PropTypes.string,
  modules: PropTypes.array,
  onModulesChange: PropTypes.func,
  onSave: PropTypes.func,
  isSaving: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  className: PropTypes.string,
};

CourseModulesEditor.defaultProps = {
  courseId: null,
  modules: [],
  onModulesChange: undefined,
  onSave: undefined,
  isSaving: false,
  isReadOnly: false,
  className: "",
};

export default CourseModulesEditor;
function getModuleCount(modules) {
  return Array.isArray(modules) ? modules.length : 0;
}

function getLessonCount(modules) {
  if (!Array.isArray(modules)) return 0;

  return modules.reduce((total, moduleItem) => {
    if (Array.isArray(moduleItem?.lessons)) return total + moduleItem.lessons.length;
    if (Array.isArray(moduleItem?.items)) return total + moduleItem.items.length;
    return total;
  }, 0);
}

export function mapCourseRow(row) {
  const modules = Array.isArray(row.modules) ? row.modules : [];

  return {
    id: row.id,
    title: row.title || "Untitled course",
    description: row.description || "",
    category: "General",
    status: "published",
    visibility: "public",
    price: 0,
    modules,
    moduleCount: getModuleCount(modules),
    lessonCount: getLessonCount(modules),
    duration: modules.length > 0 ? `${modules.length} module${modules.length > 1 ? "s" : ""}` : "—",
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

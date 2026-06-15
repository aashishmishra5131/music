"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlus, IconPencil, IconTrash, IconLoader2,
  IconBook, IconX, IconCheck, IconStar,
  IconEye, IconEyeOff, IconSearch,
} from "@tabler/icons-react";

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  duration: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

const emptyForm: {
  title: string; description: string; price: number; instructor: string;
  image: string; level: "Beginner" | "Intermediate" | "Advanced";
  category: string; duration: string; isFeatured: boolean; isPublished: boolean;
} = {
  title: "", description: "", price: 0, instructor: "",
  image: "", level: "Beginner", category: "Music",
  duration: "", isFeatured: false, isPublished: true,
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/admin/courses");
      setCourses(res.data.courses);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title, description: course.description,
      price: course.price, instructor: course.instructor,
      image: course.image, level: course.level,
      category: course.category, duration: course.duration,
      isFeatured: course.isFeatured, isPublished: course.isPublished,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.instructor.trim()) {
      setFormError("Title and Instructor are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingCourse) {
        await axios.put(`/api/admin/courses/${editingCourse._id}`, form);
      } else {
        await axios.post("/api/admin/courses", form);
      }
      setShowModal(false);
      await fetchCourses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Error saving course");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch { } finally { setDeletingId(null); }
  };

  const togglePublish = async (course: Course) => {
    try {
      await axios.put(`/api/admin/courses/${course._id}`, { isPublished: !course.isPublished });
      setCourses((prev) => prev.map((c) => c._id === course._id ? { ...c, isPublished: !c.isPublished } : c));
    } catch { }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <IconLoader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-neutral-500 text-sm mt-1">{courses.length} courses total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
          <IconPlus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-neutral-900 rounded-xl px-4 py-3 border border-neutral-800 focus-within:border-purple-500/40 transition-all mb-6 max-w-md">
        <IconSearch className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-neutral-600" />
      </div>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center">
            <IconBook className="w-8 h-8 text-neutral-700" />
          </div>
          <p className="text-neutral-500">{search ? "No courses match your search" : "No courses yet. Add your first course!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course, i) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-600 transition-all duration-200">
              {/* Image */}
              <div className="relative h-40 bg-neutral-800 overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconBook className="w-12 h-12 text-neutral-700" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  {course.isFeatured && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-semibold">
                      <IconStar className="w-2.5 h-2.5" />Featured
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${LEVEL_COLORS[course.level]}`}>
                    {course.level}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${course.isPublished ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-neutral-700 text-neutral-400 border-neutral-600"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{course.title}</h3>
                <p className="text-neutral-500 text-xs mb-1">by {course.instructor}</p>
                <p className="text-neutral-400 text-xs line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-bold text-sm">₹{course.price}</span>
                  {course.duration && <span className="text-neutral-600 text-xs">{course.duration}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center gap-2">
                <button onClick={() => openEdit(course)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors">
                  <IconPencil className="w-3.5 h-3.5" />Edit
                </button>
                <button onClick={() => togglePublish(course)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${course.isPublished ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400" : "bg-green-500/10 hover:bg-green-500/20 text-green-400"}`}
                  title={course.isPublished ? "Unpublish" : "Publish"}>
                  {course.isPublished ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => handleDelete(course._id)} disabled={deletingId === course._id}
                  className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50">
                  {deletingId === course._id ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : <IconTrash className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-x-4 top-8 bottom-8 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 flex flex-col bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-shrink-0">
                <h2 className="text-white font-bold text-lg">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />{formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Course Title *">
                      <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Guitar Fundamentals" required className="input-field" />
                    </Field>
                    <Field label="Instructor *">
                      <input type="text" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                        placeholder="Instructor name" required className="input-field" />
                    </Field>
                    <Field label="Price (₹)">
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        min={0} className="input-field" />
                    </Field>
                    <Field label="Level">
                      <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as any })} className="input-field">
                        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label="Category">
                      <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. Music, Guitar" className="input-field" />
                    </Field>
                    <Field label="Duration">
                      <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        placeholder="e.g. 4 weeks, 20 hours" className="input-field" />
                    </Field>
                  </div>

                  <Field label="Image URL">
                    <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://..." className="input-field" />
                  </Field>

                  <Field label="Description">
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Course description..." rows={3}
                      className="w-full bg-neutral-800 text-white text-sm rounded-xl px-4 py-3 border border-neutral-700 focus:border-purple-500/50 outline-none resize-none placeholder-neutral-600" />
                  </Field>

                  {/* Toggles */}
                  <div className="flex gap-4">
                    <Toggle label="Featured" value={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
                    <Toggle label="Published" value={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20">
                    {saving ? <><IconLoader2 className="w-4 h-4 animate-spin" />Saving...</> : <><IconCheck className="w-4 h-4" />{editingCourse ? "Save Changes" : "Add Course"}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgb(38 38 38);
          color: white;
          font-size: 0.875rem;
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          border: 1px solid rgb(64 64 64);
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: rgba(168,85,247,0.5); }
        .input-field::placeholder { color: rgb(82 82 82); }
        select.input-field option { background: rgb(23 23 23); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${value ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-neutral-800 border-neutral-700 text-neutral-500"}`}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${value ? "border-purple-400 bg-purple-400" : "border-neutral-600"}`}>
        {value && <IconCheck className="w-2.5 h-2.5 text-white" />}
      </div>
      {label}
    </button>
  );
}

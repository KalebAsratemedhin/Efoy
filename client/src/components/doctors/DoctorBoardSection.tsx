import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FaBookOpen,
  FaPlus,
  FaPen,
  FaTrash,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import {
  useCreateDoctorPostMutation,
  useDeleteDoctorPostMutation,
  useListDoctorPostsQuery,
  useUpdateDoctorPostMutation,
} from "../../redux/api/doctorBoardAPI";
import {
  DoctorPost,
  PostCategory,
  PostStatus,
} from "../../types/DoctorBoard";
import { InlineSpinner, Skeleton } from "../utils/Spinner";
import { extractErrorMessage } from "../../utils/errorHandler";
import ReactionBar from "./ReactionBar";
import InfiniteScrollContainer from "../utils/InfiniteScrollContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const PAGE_SIZE = 8;

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "education", label: "Education" },
  { value: "awareness", label: "Awareness" },
  { value: "tips", label: "Tips" },
  { value: "general", label: "General" },
];

const BODY_PREVIEW_CHARS = 160;

interface DoctorBoardSectionProps {
  doctorUserId: string;
  isOwner: boolean;
  /** When true, omit outer card + title (parent provides tabs/chrome). */
  embedded?: boolean;
}

const emptyForm = {
  title: "",
  body: "",
  category: "education" as PostCategory,
  status: "published" as PostStatus,
};

const DoctorBoardSection = ({ doctorUserId, isOwner, embedded = false }: DoctorBoardSectionProps) => {
  const [statusFilter, setStatusFilter] = useState<"" | PostStatus>("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<DoctorPost[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewing, setViewing] = useState<DoctorPost | null>(null);

  const { data, isLoading, isFetching, isError } = useListDoctorPostsQuery({
    doctorUserId,
    params: {
      page,
      limit: PAGE_SIZE,
      status: isOwner && statusFilter ? statusFilter : undefined,
    },
  });

  const [createPost, { isLoading: creating }] = useCreateDoctorPostMutation();
  const [updatePost, { isLoading: updating }] = useUpdateDoctorPostMutation();
  const [deletePost, { isLoading: deleting }] = useDeleteDoctorPostMutation();

  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [doctorUserId, statusFilter]);

  useEffect(() => {
    if (!data?.items) return;
    setPosts((prev) => {
      if (page === 1) return data.items;
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const item of data.items) byId.set(item.id, item);
      const updated = prev.map((p) => byId.get(p.id) ?? p);
      const existing = new Set(prev.map((p) => p.id));
      return [...updated, ...data.items.filter((p) => !existing.has(p.id))];
    });
  }, [data, page]);

  useEffect(() => {
    setViewing((prev) => {
      if (!prev) return prev;
      const fresh = posts.find((p) => p.id === prev.id);
      return fresh ?? prev;
    });
  }, [posts]);

  const hasMore = Boolean(data?.has_next);
  const saving = creating || updating;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (post: DoctorPost) => {
    setViewing(null);
    setEditing(post);
    setForm({
      title: post.title,
      body: post.body,
      category: (post.category as PostCategory) || "general",
      status: (post.status as PostStatus) || "published",
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    try {
      if (editing) {
        await updatePost({
          id: editing.id,
          update: {
            title: form.title.trim(),
            body: form.body.trim(),
            category: form.category,
            status: form.status,
          },
        }).unwrap();
        toast.success("Post updated.");
      } else {
        await createPost({
          title: form.title.trim(),
          body: form.body.trim(),
          category: form.category,
          status: form.status,
        }).unwrap();
        toast.success("Post published.");
      }
      setPage(1);
      closeEditor();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onDelete = async (post: DoctorPost) => {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    try {
      await deletePost(post.id).unwrap();
      toast.success("Post deleted.");
      if (viewing?.id === post.id) setViewing(null);
      setPage(1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const previewBody = (body: string) => {
    if (body.length <= BODY_PREVIEW_CHARS) return body;
    return `${body.slice(0, BODY_PREVIEW_CHARS).trimEnd()}…`;
  };

  return (
    <div
      className={
        embedded
          ? ""
          : "bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-4">
        {embedded ? (
          <p className="text-sm text-slate-500 min-w-0 flex-1">
            Notes and awareness posts from this doctor.
          </p>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FaBookOpen className="text-accent" />
              <h2 className="text-lg font-semibold text-ink">Posts</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Notes and awareness posts from this doctor.
            </p>
          </div>
        )}
        {isOwner && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | PostStatus)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
            >
              <FaPlus className="w-3 h-3" />
              New post
            </button>
          </div>
        )}
      </div>

      {isLoading && page === 1 && posts.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-600 py-6 text-center">Couldn’t load board posts.</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <p className="text-slate-600 text-sm">
            {isOwner ? "No posts yet. Share your first tip." : "No posts from this doctor yet."}
          </p>
        </div>
      ) : (
        <InfiniteScrollContainer
          hasMore={hasMore}
          isFetching={isFetching}
          onLoadMore={() => {
            if (!isFetching && hasMore) setPage((p) => p + 1);
          }}
          maxHeightClassName="max-h-[28rem]"
        >
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-slate-300 hover:bg-white">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setViewing(post)}
                      className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-lg"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink">{post.title}</h3>
                        {post.category && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-slate-200 text-slate-600 capitalize">
                            {post.category}
                          </span>
                        )}
                        {isOwner && post.status === "draft" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            Draft
                          </span>
                        )}
                      </div>
                      {post.created_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                        {previewBody(post.body)}
                      </p>
                      {post.body.length > BODY_PREVIEW_CHARS && (
                        <span className="mt-2 inline-block text-xs font-medium text-accent">
                          Read more
                        </span>
                      )}
                    </button>

                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                            aria-label="Post actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaEllipsisV className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => openEdit(post)}
                            className="gap-2 cursor-pointer"
                          >
                            <FaPen className="w-3 h-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(post)}
                            disabled={deleting}
                            className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <FaTrash className="w-3 h-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {post.status !== "draft" && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <ReactionBar
                        className="mt-3"
                        targetType="post"
                        targetId={post.id}
                        likeCount={post.likeCount}
                        dislikeCount={post.dislikeCount}
                        myReaction={post.myReaction}
                        disabled={isOwner}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </InfiniteScrollContainer>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={() => setViewing(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-post-title"
        >
          <div
            className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id="view-post-title" className="text-lg font-semibold text-ink">
                    {viewing.title}
                  </h3>
                  {viewing.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 capitalize">
                      {viewing.category}
                    </span>
                  )}
                  {isOwner && viewing.status === "draft" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                      Draft
                    </span>
                  )}
                </div>
                {viewing.created_at && (
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(viewing.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-2 rounded-xl text-slate-500 hover:text-ink hover:bg-slate-100"
                        aria-label="Post actions"
                      >
                        <FaEllipsisV className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => openEdit(viewing)}
                        className="gap-2 cursor-pointer"
                      >
                        <FaPen className="w-3 h-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(viewing)}
                        disabled={deleting}
                        className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                  aria-label="Close"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {viewing.body}
              </p>
              {viewing.status !== "draft" && (
                <ReactionBar
                  className="mt-5 pt-4 border-t border-slate-100"
                  targetType="post"
                  targetId={viewing.id}
                  likeCount={viewing.likeCount}
                  dislikeCount={viewing.dislikeCount}
                  myReaction={viewing.myReaction}
                  disabled={isOwner}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4"
          onClick={closeEditor}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-ink">
                {editing ? "Edit post" : "New post"}
              </h3>
              <button
                type="button"
                onClick={closeEditor}
                className="p-2 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100"
                aria-label="Close"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  maxLength={120}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as PostCategory }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as PostStatus }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Body</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-70"
              >
                {saving && <InlineSpinner className="text-white" />}
                {editing ? "Save changes" : "Save post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorBoardSection;

import { useEffect, useMemo, useState } from "react";
import { useFindAllCommentsQuery } from "../../redux/api/commentAPI";
import { useGetDoctorRatingsQuery } from "../../redux/api/ratingAPI";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import CommentCard from "./CommentCard";
import { Skeleton } from "../utils/Spinner";
import Error from "../utils/Error";
import InfiniteScrollContainer from "../utils/InfiniteScrollContainer";
import { CommentPopulated } from "../../types/Comment";

const PAGE_SIZE = 8;

const CommentList = ({ doctorId }: { doctorId: string }) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CommentPopulated[]>([]);

  const { data, isLoading, isFetching, isError, error, refetch } = useFindAllCommentsQuery({
    doctorId,
    page,
    limit: PAGE_SIZE,
  });
  const { data: ratingsData } = useGetDoctorRatingsQuery({
    doctorId,
    page: 1,
    limit: 100,
  });
  const { data: user } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem("accessToken"),
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [doctorId]);

  useEffect(() => {
    if (!data?.items) return;
    setItems((prev) => {
      if (page === 1) return data.items;
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const item of data.items) byId.set(item.id, item);
      const updated = prev.map((c) => byId.get(c.id) ?? c);
      const existing = new Set(prev.map((c) => c.id));
      return [...updated, ...data.items.filter((c) => !existing.has(c.id))];
    });
  }, [data, page]);

  const ratingByRater = useMemo(() => {
    const map = new Map<string, number>();
    const ratings = Array.isArray(ratingsData?.items) ? ratingsData.items : [];
    for (const rating of ratings) {
      const rater =
        typeof rating.raterId === "string"
          ? rating.raterId
          : (rating.raterId as { id?: string } | undefined)?.id;
      if (rater && rating.value != null) map.set(rater, Number(rating.value));
    }
    return map;
  }, [ratingsData]);

  const hasMore = Boolean(data?.has_next);
  const showInitialLoading = isLoading && page === 1 && items.length === 0;

  if (showInitialLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  if (isError) return <Error error={error} />;

  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
        <p className="text-slate-600 text-sm">No reviews yet.</p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      hasMore={hasMore}
      isFetching={isFetching}
      onLoadMore={() => {
        if (!isFetching && hasMore) setPage((p) => p + 1);
      }}
      maxHeightClassName="max-h-[28rem]"
      empty={items.length === 0}
    >
      <div className="space-y-3">
        {items.map((comment) => {
          const commenter =
            comment.commenterId && typeof comment.commenterId === "object"
              ? comment.commenterId
              : null;
          const commenterId =
            commenter?.id ??
            (typeof comment.commenterId === "string" ? comment.commenterId : undefined);

          return (
            <CommentCard
              key={comment.id}
              isEditable={!!user?.id && user.id === commenterId}
              comment={{
                id: comment.id,
                commenterId,
                commenterName: comment.commenterName ?? commenter?.fullName,
                commenterPic: comment.commenterPic ?? commenter?.profilePic,
                content: comment.content,
                doctorId:
                  typeof comment.doctorId === "string"
                    ? comment.doctorId
                    : comment.doctorId?.id ?? doctorId,
                rating: commenterId ? ratingByRater.get(commenterId) : undefined,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
              }}
              refetch={() => {
                setPage(1);
                refetch();
              }}
            />
          );
        })}
      </div>
    </InfiniteScrollContainer>
  );
};

export default CommentList;

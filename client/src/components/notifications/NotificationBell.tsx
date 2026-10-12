import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../../redux/api/notificationAPI";
import { getNotificationHref } from "../../lib/notificationNav";
import { NotificationOut } from "../../types/Notification";
import { Skeleton } from "../utils/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: unread } = useGetUnreadCountQuery();
  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    { page: 1, limit: 20, unread_only: false },
    { skip: !open }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const count = unread?.count ?? 0;
  const items = data?.items ?? [];

  const onItemClick = async (n: NotificationOut) => {
    setOpen(false);
    const href = getNotificationHref(n);
    if (!n.isRead) {
      try {
        await markRead(n.id).unwrap();
      } catch {
        /* still navigate */
      }
    }
    navigate(href);
  };

  const onMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      /* ignore */
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-ink hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
          aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
        >
          <FaBell className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-ink">Notifications</p>
          <button
            type="button"
            onClick={onMarkAll}
            disabled={markingAll || count === 0}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaCheckDouble className="w-3 h-3" />
            Mark all read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {(isLoading || isFetching) && items.length === 0 ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              No notifications yet.
            </p>
          ) : (
            <ul className="py-1">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                      !n.isRead ? "bg-accent/[0.04]" : ""
                    }`}
                  >
                    <div className="flex gap-2.5">
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                      )}
                      <div className={!n.isRead ? "min-w-0" : "min-w-0 pl-4"}>
                        <p className="text-sm font-medium text-ink line-clamp-1">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        {n.created_at && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="rounded-none justify-center py-2.5 cursor-pointer">
          <Link to="/appointments" className="text-sm font-medium text-accent">
            View appointments
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { buildEffectiveFeed, EXPLORATION_SIZE, LIKE_GOAL } from '../lib/feed';
import { photosOf } from '../lib/item';
import type { DiscoveryItem, DragState, LeavingDirection, SaveState, SwipeEntry } from '../types';

/** Horizontal drag distance (px) past which releasing the card swipes it. */
const SWIPE_THRESHOLD = 110;
const IDLE_DRAG: DragState = { x: 0, y: 0, active: false };

/**
 * Swipe deck state: the feed (re-ranked after the exploration phase), likes and skips,
 * card dragging, keyboard shortcuts, the detail sheet and the final recommendation.
 */
export function useDiscoveryDeck(tripId: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const feedQuery = useQuery(trpc.discovery.feed.queryOptions());
  const feed = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);

  const [cursor, setCursor] = useState(0);
  const [likes, setLikes] = useState(0);
  const [skips, setSkips] = useState(0);
  const [history, setHistory] = useState<SwipeEntry[]>([]);
  const [drag, setDrag] = useState<DragState>(IDLE_DRAG);
  const [leaving, setLeaving] = useState<null | LeavingDirection>(null);
  const [detail, setDetail] = useState<DiscoveryItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Swipes are tracked client-side; the recommendation runs over them on demand.
  const recommendationQuery = useQuery({
    ...trpc.discovery.recommendation.queryOptions({ swipes: history, topN: 3 }),
    enabled: showResult,
  });

  // After the exploration phase (EXPLORATION_SIZE swipes), rank cities by algo score
  // so the remaining cards are sorted by preference rather than round-robin order.
  const explorationComplete = history.length >= EXPLORATION_SIZE;
  const rankCitiesQuery = useQuery({
    ...trpc.discovery.rankCities.queryOptions({ swipes: history }),
    enabled: explorationComplete,
  });

  const swipedIds = useMemo(() => new Set(history.map((s) => s.id)), [history]);

  const effectiveFeed = useMemo(
    () => (explorationComplete ? buildEffectiveFeed(feed, rankCitiesQuery.data, swipedIds) : feed),
    [feed, explorationComplete, rankCitiesQuery.data, swipedIds],
  );

  // Persisting the recommended trip to the database (on explicit click).
  const saveTrip = useMutation(
    trpc.discovery.saveTrip.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.group.getMyGroupTrips.queryKey(),
        });
        navigate({ to: '/trip/configure', search: { tripId: data.tripId ?? tripId } });
      },
    }),
  );

  const shownAtRef = useRef<number>(0);
  useEffect(() => {
    shownAtRef.current = Date.now();
  }, [cursor]);

  const topItem = effectiveFeed.at(cursor);
  const stack = useMemo(() => effectiveFeed.slice(cursor, cursor + 3), [effectiveFeed, cursor]);

  const triggerResult = useCallback(() => setShowResult(true), []);

  const commitSwipe = useCallback(
    (liked: boolean) => {
      if (!topItem || leaving) return;
      const viewDurationMs = Date.now() - shownAtRef.current;

      setHistory((h) => [...h, { id: topItem.id, liked, viewDurationMs }]);

      const nextLikes = liked ? likes + 1 : likes;
      if (liked) setLikes(nextLikes);
      else setSkips((s) => s + 1);

      setLeaving(liked ? 'like' : 'skip');
      window.setTimeout(() => {
        setLeaving(null);
        setDrag(IDLE_DRAG);
        setPhotoIndex(0);
        setCursor((c) => c + 1);
        if (liked && nextLikes === LIKE_GOAL) {
          window.setTimeout(triggerResult, 250);
        }
      }, 300);
    },
    [topItem, leaving, likes, triggerResult],
  );

  // ── Keyboard ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (detail) {
        if (e.key === 'Escape') setDetail(null);
        return;
      }
      if (showResult) {
        if (e.key === 'Escape') setShowResult(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'l') commitSwipe(true);
      if (e.key === 'ArrowLeft' || e.key === 's') commitSwipe(false);
      if (e.key === ' ') {
        e.preventDefault();
        triggerResult();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commitSwipe, triggerResult, detail, showResult]);

  // ── Pointer drag on top card ──
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (leaving) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    const x = e.clientX - dragStart.current.x;
    const y = e.clientY - dragStart.current.y;
    if (Math.abs(x) > 6 || Math.abs(y) > 6) moved.current = true;
    if (moved.current) setDrag({ x, y, active: true });
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    dragStart.current = null;

    // A tap (no drag): left/right edges browse the photos, the rest opens the details.
    if (!moved.current) {
      if (!topItem) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const photoCount = photosOf(topItem).length;
      if (photoCount > 1 && ratio < 0.3) setPhotoIndex((i) => Math.max(0, i - 1));
      else if (photoCount > 1 && ratio > 0.7) setPhotoIndex((i) => Math.min(photoCount - 1, i + 1));
      else setDetail(topItem);
      return;
    }

    if (drag.x > SWIPE_THRESHOLD) commitSwipe(true);
    else if (drag.x < -SWIPE_THRESHOLD) commitSwipe(false);
    else setDrag(IDLE_DRAG);
  }
  function onPointerCancel() {
    dragStart.current = null;
    setDrag(IDLE_DRAG);
  }

  function restart() {
    setCursor(0);
    setLikes(0);
    setSkips(0);
    setHistory([]);
    setPhotoIndex(0);
    setShowResult(false);
    setDetail(null);
    saveTrip.reset();
  }

  const saveState: SaveState = {
    isPending: saveTrip.isPending,
    isSuccess: saveTrip.isSuccess,
    isError: saveTrip.isError,
    data: saveTrip.data,
  };

  return {
    feedQuery,
    stack,
    topItem,
    photoIndex,
    drag,
    leaving,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    likes,
    skips,
    goalReached: likes >= LIKE_GOAL,
    noMoreCards: !feedQuery.isLoading && !feedQuery.isError && cursor >= effectiveFeed.length,
    likeStamp: drag.x > 20 ? Math.min(drag.x / SWIPE_THRESHOLD, 1) : 0,
    skipStamp: drag.x < -20 ? Math.min(-drag.x / SWIPE_THRESHOLD, 1) : 0,
    commitSwipe,
    restart,
    detail,
    openDetail: setDetail,
    closeDetail: () => setDetail(null),
    showResult,
    triggerResult,
    closeResult: () => setShowResult(false),
    recommendationQuery,
    saveTrip: () => saveTrip.mutate({ tripId, swipes: history }),
    saveState,
  };
}

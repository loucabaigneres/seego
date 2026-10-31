import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { DeckEnd } from '@/features/discovery/components/DeckEnd'
import { DetailSheet } from '@/features/discovery/components/DetailSheet'
import { DiscoveryCard } from '@/features/discovery/components/DiscoveryCard'
import { FeedError } from '@/features/discovery/components/FeedError'
import { LikeProgress } from '@/features/discovery/components/LikeProgress'
import { ResultOverlay } from '@/features/discovery/components/ResultOverlay'
import { SkeletonCard } from '@/features/discovery/components/SkeletonCard'
import { SwipeActions } from '@/features/discovery/components/SwipeActions'
import { useDiscoveryDeck } from '@/features/discovery/hooks/useDiscoveryDeck'

const discoverySearchSchema = z.object({
  tripId: z.string().optional(),
})

export const Route = createFileRoute('/discovery')({
  validateSearch: (search: Record<string, unknown>) => discoverySearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (!search.tripId) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: DiscoveryPage,
})

function DiscoveryPage() {
  const { tripId } = Route.useSearch()
  const deck = useDiscoveryDeck(tripId)

  return (
    <div className="flex h-[calc(100dvh-61px)] w-full justify-center overflow-hidden bg-[#F2EDE8] px-4 pb-4 pt-3 md:pb-6 md:pt-5">
      <div className="flex h-full w-full max-w-105 flex-col">
        <LikeProgress likes={deck.likes} goalReached={deck.goalReached} onShowResult={deck.triggerResult} />

        {/* ── Card stack ── */}
        <div className="relative mt-4 min-h-0 flex-1">
          {deck.feedQuery.isLoading && <SkeletonCard />}
          {deck.feedQuery.isError && <FeedError onRetry={() => deck.feedQuery.refetch()} />}
          {deck.noMoreCards && (
            <DeckEnd
              canShowResult={deck.likes > 0}
              onShowResult={deck.triggerResult}
              onRestart={deck.restart}
            />
          )}

          {deck.stack
            .map((item, i) => (
              <DiscoveryCard
                key={item.id}
                item={item}
                index={i}
                photoIndex={deck.photoIndex}
                drag={deck.drag}
                leaving={deck.leaving}
                pointerHandlers={deck.pointerHandlers}
              />
            ))
            .reverse()}
        </div>

        <SwipeActions
          disabled={!deck.topItem || !!deck.leaving}
          skipStamp={deck.skipStamp}
          likeStamp={deck.likeStamp}
          onSkip={() => deck.commitSwipe(false)}
          onDetails={() => deck.topItem && deck.openDetail(deck.topItem)}
          onLike={() => deck.commitSwipe(true)}
        />
      </div>

      {deck.detail && (
        <DetailSheet
          item={deck.detail}
          onClose={deck.closeDetail}
          onLike={() => {
            deck.closeDetail()
            deck.commitSwipe(true)
          }}
          onSkip={() => {
            deck.closeDetail()
            deck.commitSwipe(false)
          }}
        />
      )}
      {deck.showResult && (
        <ResultOverlay
          query={deck.recommendationQuery}
          likes={deck.likes}
          skips={deck.skips}
          onClose={deck.closeResult}
          onRestart={deck.restart}
          onSave={deck.saveTrip}
          saveState={deck.saveState}
        />
      )}
    </div>
  )
}

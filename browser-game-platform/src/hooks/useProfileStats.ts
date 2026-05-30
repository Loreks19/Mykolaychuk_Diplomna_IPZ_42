import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function useProfileStats(userId: string | null) {
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [ratedGameCount, setRatedGameCount] = useState<number | null>(null)

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!userId) {
        setCommentCount(null)
        setRatedGameCount(null)
        return
      }

      setCommentCount(null)
      setRatedGameCount(null)

      const [
        { count: nextCommentCount },
        { count: nextRatedGameCount },
      ] = await Promise.all([
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('ratings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ])

      setCommentCount(nextCommentCount ?? 0)
      setRatedGameCount(nextRatedGameCount ?? 0)
    }

    void loadProfileStats()
  }, [userId])

  return {
    commentCount,
    ratedGameCount,
  }
}

export default useProfileStats

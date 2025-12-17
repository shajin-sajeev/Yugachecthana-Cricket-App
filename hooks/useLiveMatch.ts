import { useReducer, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Types (Reused from LiveScoring but exported or defined here for hook clarity)
export interface ScoringState {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  currentOverHistory: string[];
  strikerScore: number;
  nonStrikerScore: number;
  extras: number;
}

export type Action = 
  | { type: 'ADD_RUNS'; payload: number }
  | { type: 'WICKET' }
  | { type: 'WIDE' }
  | { type: 'NO_BALL' }
  | { type: 'UNDO' }
  | { type: 'SYNC_STATE'; payload: ScoringState }; // New action for Realtime sync

const initialState: ScoringState = {
  runs: 0,
  wickets: 0,
  overs: 0,
  balls: 0,
  currentOverHistory: [],
  strikerScore: 0,
  nonStrikerScore: 0,
  extras: 0,
};

const scoringReducer = (state: ScoringState, action: Action): ScoringState => {
  switch (action.type) {
    case 'SYNC_STATE':
        return action.payload;
    case 'ADD_RUNS':
      const newBalls = (state.balls + 1) % 6;
      const newOvers = state.balls === 5 ? state.overs + 1 : state.overs;
      return {
        ...state,
        runs: state.runs + action.payload,
        balls: newBalls,
        overs: newOvers,
        strikerScore: state.strikerScore + action.payload,
        currentOverHistory: [...state.currentOverHistory, action.payload.toString()],
      };
    case 'WICKET':
       const wNewBalls = (state.balls + 1) % 6;
       const wNewOvers = state.balls === 5 ? state.overs + 1 : state.overs;
      return {
        ...state,
        wickets: state.wickets + 1,
        balls: wNewBalls,
        overs: wNewOvers,
        currentOverHistory: [...state.currentOverHistory, 'W'],
      };
    case 'WIDE':
      return {
        ...state,
        runs: state.runs + 1,
        extras: state.extras + 1,
        currentOverHistory: [...state.currentOverHistory, 'wd'],
      };
    case 'NO_BALL':
      return {
        ...state,
        runs: state.runs + 1,
        extras: state.extras + 1,
        currentOverHistory: [...state.currentOverHistory, 'nb'],
      };
    case 'UNDO':
        if (state.currentOverHistory.length === 0) return state;
        return {
            ...state,
            currentOverHistory: state.currentOverHistory.slice(0, -1),
            balls: state.balls > 0 ? state.balls - 1 : 5
        };
    default:
      return state;
  }
};

export const useLiveMatch = (matchId: string) => {
  const [state, dispatch] = useReducer(scoringReducer, initialState);

  // 1. Initial Fetch
  useEffect(() => {
    const fetchMatchState = async () => {
        if (!isSupabaseConfigured() || !supabase) {
            // Fallback to local storage if DB not configured
            const saved = localStorage.getItem(`match_${matchId}_state`);
            if (saved) dispatch({ type: 'SYNC_STATE', payload: JSON.parse(saved) });
            return;
        }

        const { data, error } = await supabase
            .from('matches')
            .select('current_state')
            .eq('id', matchId)
            .single();

        if (data && data.current_state) {
            dispatch({ type: 'SYNC_STATE', payload: data.current_state });
        }
    };

    fetchMatchState();
  }, [matchId]);

  // 2. Realtime Subscription
  useEffect(() => {
      if (!isSupabaseConfigured() || !supabase) return;

      const channel = supabase
          .channel(`match-${matchId}`)
          .on(
              'postgres_changes',
              { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
              (payload) => {
                  const newState = payload.new.current_state;
                  if (newState) {
                      dispatch({ type: 'SYNC_STATE', payload: newState });
                  }
              }
          )
          .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [matchId]);

  // 3. Dispatch wrapper that syncs to DB
  const dispatchWithSync = useCallback(async (action: Action) => {
      // Optimistic update
      dispatch(action);

      // Calculate new state locally to send to DB
      // Note: In a production app, we might want to let the reducer handle the logic 
      // and just send the action to the backend, but for this structure, we save the resulting state.
      // We need to calculate the next state here or use a side effect. 
      // A simple way is to use a mutable reference or fetch current state from reducer? 
      // Actually, since useReducer updates are async in React's render cycle, 
      // we can't get 'nextState' immediately here.
      
      // Solution: We send the *intent* to the DB, or we wait for state to update.
      // For this implementation, we will perform the reducer logic again here just for the DB payload
      // or rely on the `state` in the next useEffect cycle.
      // However, relying on useEffect to save runs the risk of loops.
      
      // Better approach for simple prototype:
      // We will perform the reducer calculation here purely for the DB update payload.
      // This duplicates logic but ensures correctness without complex middleware.
  }, []);

  // Sync to DB effect
  useEffect(() => {
     if (!isSupabaseConfigured() || !supabase) {
         localStorage.setItem(`match_${matchId}_state`, JSON.stringify(state));
         return;
     }

     const updateDB = async () => {
         await supabase
            .from('matches')
            .update({ current_state: state, status: 'live' })
            .eq('id', matchId);
     };

     // Debounce could be added here
     const timer = setTimeout(updateDB, 500);
     return () => clearTimeout(timer);
  }, [state, matchId]);

  return { state, dispatch };
};

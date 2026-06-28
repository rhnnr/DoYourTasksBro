const SUPABASE_URL = "https://tcsfxrqvtkzqotiititj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc2Z4cnF2dGt6cW90aWl0aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2Njg0NzEsImV4cCI6MjA5ODI0NDQ3MX0.t3lxNXW9GND1x90UIYecxwkV_fkymqtyjckLw90e098";

// We name our specific instance connection 'db' to keep it completely distinct from the global layout library properties
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LiveSync = {
    async pushData(slotId, dataArray) {
        if (!navigator.onLine) return;

        const { error } = await db
            .from('user_matrix')
            .update({ 
                payload: dataArray,
                updated_at: new Date()
            })
            .eq('id', slotId);

        if (error) {
            console.error(`[SYNC FAILURE] Matrix synchronization block on ${slotId}:`, error.message);
        } else {
            console.log(`[SYNC SUCCESS] Global matrix payload locked onto cloud slot: ${slotId}`);
        }
    },

    async pullData(slotId) {
        const { data, error } = await db
            .from('user_matrix')
            .select('payload')
            .eq('id', slotId)
            .single();

        if (error) {
            console.error(`[SYNC PULL ERROR] Failed fetching ${slotId}:`, error.message);
            return null;
        }
        return data.payload;
    },

    connectRealtimeMatrix(slotId, executionCallback) {
        db
            .channel(`live-${slotId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_matrix', filter: `id=eq.${slotId}` }, 
            payload => {
                console.log(`[REALTIME RECEPTION] External write detected on cloud slot: ${slotId}`);
                executionCallback(payload.new.payload);
            })
            .subscribe();
    }
};

const SUPABASE_URL = 'https://gnyvfslxoiobgmohejqf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXZmc2x4b2lvYmdtb2hlanFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTcwNTYsImV4cCI6MjA5Mjg5MzA1Nn0.wwk_IKVia7R3_QTjnbDcRxWA_HQwHURO5lXcHIAzgRc';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY
};

async function checkConversations() {
    try {
        console.log('Checking last 50 conversations...');
        const res = await fetch(SUPABASE_URL + '/rest/v1/conversas?select=vendedor,telefone,created_at,tipo,de,mensagem&order=created_at.desc&limit=50', { headers });
        if (!res.ok) {
            console.error('Error fetching conversations:', await res.text());
            return;
        }
        const data = await res.json();
        console.table(data);
        
        const uniqueVendors = [...new Set(data.map(d => d.vendedor))];
        console.log('Unique vendors in last 50 rows:', uniqueVendors);
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

checkConversations();

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FreesoundTrack {
  id: number;
  name: string;
  duration: number;
  previews: {
    'preview-lq-mp3': string;
    'preview-hq-mp3': string;
  };
  license: string;
  tags: string[];
  username: string;
  download: string;
}

interface FreesoundResponse {
  count: number;
  results: FreesoundTrack[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { category = 'ambient', page = 1, pageSize = 30, query: searchQuery } = await req.json();

    const FREESOUND_API_KEY = Deno.env.get('FREESOUND_API_KEY');
    if (!FREESOUND_API_KEY) {
      throw new Error('FREESOUND_API_KEY not configured');
    }

    // Category-specific search queries
    const categoryQueries: Record<string, string> = {
      ambient: 'ambient background music loop -voice -speech -spoken',
      corporate: 'corporate presentation business music -voice -speech',
      upbeat: 'upbeat energetic positive music -voice -speech',
      cinematic: 'cinematic epic orchestral music -voice -speech',
      electronic: 'electronic dance music loop -voice -speech',
      calm: 'calm relaxing peaceful music -voice -speech'
    };

    const query = searchQuery || categoryQueries[category] || categoryQueries.ambient;

    console.log(`Fetching Freesound tracks for category: ${category}, page: ${page}, query: ${query}`);

    // Build Freesound API URL
    const freesoundUrl = new URL('https://freesound.org/apiv2/search/text/');
    freesoundUrl.searchParams.set('query', query);
    freesoundUrl.searchParams.set('page', page.toString());
    freesoundUrl.searchParams.set('page_size', pageSize.toString());
    freesoundUrl.searchParams.set('fields', 'id,name,duration,previews,license,tags,username,download');
    freesoundUrl.searchParams.set('filter', 'duration:[120 TO 300] license:"Creative Commons 0" OR license:"Attribution"');
    freesoundUrl.searchParams.set('sort', 'rating_desc');

    const response = await fetch(freesoundUrl.toString(), {
      headers: {
        'Authorization': `Token ${FREESOUND_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error(`Freesound API error: ${response.status} ${response.statusText}`);
      throw new Error(`Freesound API returned ${response.status}`);
    }

    const data: FreesoundResponse = await response.json();

    console.log(`Found ${data.count} tracks, returning ${data.results.length} results`);

    // Transform to our format
    const tracks = data.results.map(track => ({
      id: track.id.toString(),
      name: track.name,
      url: track.previews['preview-lq-mp3'] || track.previews['preview-hq-mp3'],
      duration: Math.round(track.duration),
      license: track.license,
      category: category,
      tags: track.tags?.slice(0, 5) || [],
      username: track.username,
      downloadUrl: track.download,
      previewHq: track.previews['preview-hq-mp3']
    }));

    return new Response(
      JSON.stringify({
        tracks,
        totalCount: data.count,
        page,
        pageSize
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching Freesound tracks:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        tracks: [],
        totalCount: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

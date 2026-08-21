export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    if (!imageUrl) return new Response('No URL', { status: 400 })

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://www.amazon.com/',
        'sec-fetch-dest':  'image',
        'sec-fetch-mode':  'no-cors',
      }
    })

    if (!res.ok) return new Response('Image fetch failed', { status: 502 })

    const buffer      = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':                contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':               'public, max-age=86400',
      }
    })
  } catch(e) {
    return new Response('Error: ' + e.message, { status: 500 })
  }
}

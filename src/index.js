function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
  });
}
function isAdmin(request, env){
  const got = request.headers.get('x-admin-password') || '';
  return !!env.ADMIN_PASSWORD && got === env.ADMIN_PASSWORD;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/auth' && request.method === 'POST') {
      return isAdmin(request, env) ? json({ok:true}) : json({ok:false}, 401);
    }

    if (url.pathname === '/api/items' && request.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT item_key, payload, deleted, updated_at FROM trip_changes ORDER BY updated_at ASC'
      ).all();
      return json(results || []);
    }

    if (url.pathname === '/api/items' && request.method === 'POST') {
      if (!isAdmin(request, env)) return json({error:'unauthorized'}, 401);
      const body = await request.json();
      if (!body.item_key || typeof body.payload !== 'object') return json({error:'bad request'}, 400);
      await env.DB.prepare(`
        INSERT INTO trip_changes (item_key, payload, deleted, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(item_key) DO UPDATE SET
          payload=excluded.payload,
          deleted=excluded.deleted,
          updated_at=CURRENT_TIMESTAMP
      `).bind(body.item_key, JSON.stringify(body.payload), body.deleted ? 1 : 0).run();
      return json({ok:true});
    }

    return env.ASSETS.fetch(request);
  }
};

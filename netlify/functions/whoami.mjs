function isEboard(context) {
  const roles = context.clientContext?.user?.app_metadata?.roles || [];
  return roles.includes('eboard');
}
export default async (req, context) => {
  if (!context.clientContext?.user) {
    return new Response(JSON.stringify({ ok:false, error:'no user in clientContext' }), { status: 401 });
  }
  if (!isEboard(context)) {
    return new Response(JSON.stringify({ ok:false, error:'forbidden: eboard only' }), { status: 403 });
  }
  const { user, identity } = context.clientContext;
  return new Response(JSON.stringify({
    ok:true,
    user: { email: user.email, roles: user.app_metadata?.roles || [] },
    identityAvailable: !!identity,
    identityUrl: identity?.url ? true : false,
    hasAdminToken: identity?.token ? true : false
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

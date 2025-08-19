(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();}
  ready(()=>{
    const id = window.netlifyIdentity;
    const login = document.getElementById('identity-login');
    const logout = document.getElementById('identity-logout');
    function setUI(){
      const authed = !!(id && id.currentUser());
      if (login) login.hidden = authed;
      if (logout) logout.hidden = !authed;
    }
    if (!id) return;
    setUI();
    if (login) login.addEventListener('click', ()=>id.open());
    if (logout) logout.addEventListener('click', ()=>id.logout());
    id.on('login', ()=>{ setUI(); id.close(); });
    id.on('logout', setUI);
  });
})();

(async function(){
  const mount = document.getElementById('navbar');
  if (!mount) return;
  try{
    const res = await fetch('partials/nav.html', {cache:'no-store'});
    if (!res.ok) throw new Error(res.status+' '+res.statusText);
    mount.innerHTML = await res.text();

    const toggle = document.querySelector('.nav-toggle');
    const siteNav = document.getElementById('site-nav');
    if (toggle && siteNav){
      toggle.addEventListener('click', ()=>{
        const open = siteNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open?'true':'false');
      });
    }

    // Determine active tab by filename (works in subfolders like /nafme-site/)
    let file = location.pathname.split('/').pop();
    if (!file) file = 'index.html';
    const fileMap = {
      'index.html':'home',
      'events.html':'events',
      'convention.html':'convention',
      'eboard.html':'eboard',
      'resources.html':'resources'
    };
    const key = fileMap[file] || null;
    if (key){
      const link = document.querySelector(`[data-nav="${key}"]`);
      if (link){ link.classList.add('active'); link.setAttribute('aria-current','page'); }
    }

    // Footer
    const footMount = document.getElementById('footer');
    if (footMount){
      const fres = await fetch('partials/footer.html', {cache:'no-store'});
      if (fres.ok) {
        footMount.innerHTML = await fres.text();
        const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
      }
    }
  }catch(err){
    // Helpful hint if opened via file://
    const hint = document.createElement('div');
    hint.style.padding = '8px';
    hint.style.background = '#fff4e5';
    hint.style.border = '1px solid #f7c873';
    hint.style.borderRadius = '8px';
    hint.style.margin = '10px';
    hint.innerHTML = 'Navigation failed to load. If you are opening the HTML directly (file://), please run a local server.<br/><code>python -m http.server 8000</code>';
    mount.replaceWith(hint);
    console.warn('Navbar load failed', err);
  }
})();

(async function(){
  const mount = document.getElementById('navbar');
  if (!mount) return;
  const res = await fetch('partials/nav.html', {cache:'no-store'});
  const html = await res.text();
  mount.innerHTML = html;

  const toggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (toggle && siteNav){
    toggle.addEventListener('click', ()=>{
      const open = siteNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open?'true':'false');
    });
  }
  const map = {'/':'home','/index.html':'home','/events.html':'events','/convention.html':'convention','/eboard.html':'eboard','/resources.html':'resources'};
  const path = location.pathname.replace(/\/+$/,'')||'/';
  const key = map[path]||null;
  if (key){
    const link = document.querySelector(`[data-nav="${key}"]`);
    if (link){ link.classList.add('active'); link.setAttribute('aria-current','page'); }
  }
  const footMount = document.getElementById('footer');
  if (footMount){
    const fres = await fetch('partials/footer.html', {cache:'no-store'});
    footMount.innerHTML = await fres.text();
    const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  }
})();

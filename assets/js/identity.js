// Minimal Netlify Identity wiring (Option A: recovery via login modal)
(function(){
  if (!window.netlifyIdentity) return;
  const ni = window.netlifyIdentity;
  const statusEl = document.getElementById("ni-status");
  const loginBtn = document.getElementById("ni-login");
  const logoutBtn = document.getElementById("ni-logout");
  const message = document.getElementById("account-message");
  const fullName = document.getElementById("full-name");
  const email = document.getElementById("email");
  const avatarUrl = document.getElementById("avatar-url");
  const avatarPreview = document.getElementById("avatar-preview");
  const accountForm = document.getElementById("account-form");
  const passwordForm = document.getElementById("password-form");
  const newPassword = document.getElementById("new-password");
  const recoveryBtn = document.getElementById("password-recovery");
  function setMsg(t){ if(message) message.textContent=t; }
  function render(){
    const user=ni.currentUser();
    if(!statusEl) return;
    if(!user){
      statusEl.textContent="Not signed in";
      if(loginBtn) loginBtn.hidden=false;
      if(logoutBtn) logoutBtn.hidden=true;
      if(accountForm) accountForm.style.display="none";
      if(passwordForm) passwordForm.style.display="none";
      if(avatarPreview){avatarPreview.style.display="none";avatarPreview.src="";}
      return;
    }
    statusEl.textContent=`Signed in as ${user.email}`;
    if(loginBtn) loginBtn.hidden=true;
    if(logoutBtn) logoutBtn.hidden=false;
    if(accountForm) accountForm.style.display="block";
    if(passwordForm) passwordForm.style.display="block";
    const meta=user.user_metadata||{};
    if(fullName) fullName.value=meta.full_name||"";
    if(email) email.value=user.email||"";
    if(avatarUrl) avatarUrl.value=meta.avatar_url||"";
    if(avatarPreview){const src=meta.avatar_url||"";avatarPreview.src=src;avatarPreview.style.display=src?"block":"none";}
  }
  ni.on("init",render);
  ni.on("login",()=>{render();setMsg("Logged in.");});
  ni.on("logout",()=>{render();setMsg("Logged out.");});
  if(loginBtn) loginBtn.addEventListener("click",()=>ni.open("login"));
  if(logoutBtn) logoutBtn.addEventListener("click",()=>ni.logout());
  if(accountForm){accountForm.addEventListener("submit",async e=>{
    e.preventDefault();const user=ni.currentUser();if(!user)return;
    const updates={email:(email&&email.value)||user.email,data:{full_name:(fullName&&fullName.value)||"",avatar_url:(avatarUrl&&avatarUrl.value)||""}};
    try{setMsg("Saving profile…");await user.update(updates);setMsg("Profile saved.");render();}
    catch(err){console.error(err);setMsg("Error saving profile.");}});}
  if(passwordForm){passwordForm.addEventListener("submit",async e=>{
    e.preventDefault();const user=ni.currentUser();if(!user)return;
    const pw=(newPassword&&newPassword.value)||"";if(!pw){setMsg("Enter a new password first.");return;}
    try{setMsg("Updating password…");await user.update({password:pw});newPassword.value="";setMsg("Password updated.");}
    catch(err){console.error(err);setMsg("Error updating password. Try recovery instead.");}});}
  if(recoveryBtn){recoveryBtn.addEventListener("click",()=>{ni.open("login");setMsg('Click "Forgot password?" in the login window.');});}
  ni.init();
})();
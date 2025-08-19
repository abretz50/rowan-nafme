export function fmtDateRange(s,e){
  try{const S=new Date(s),E=new Date(e);
    const f=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'});
    return f.format(S)+' – '+f.format(E);
  }catch(_){return ''}
}

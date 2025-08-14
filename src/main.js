const isProd = process.env.NODE_ENV === "production";
const enableExtraScript = false;

(async () => {
  if (process.env.NODE_ENV == 'development' || !enableExtraScript) {
    import('./config/index.js').then((res) => {
      if (typeof window !== 'undefined') {
        window.EZ_CONFIG = res.config || res;
      }
    });
  }
  
  await import('./appInit.js');
})();

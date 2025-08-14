import disableDevtool from "disable-devtool";

const isProd = process.env.NODE_ENV === "production";
const enableConfigJS = process.env.VUE_APP_CONFIGJS == "true";
const enableAntiDebugging = process.env.VUE_APP_DEBUGGING == "true";

(async () => {
  if (!isProd || !enableConfigJS) {
    import('./config/index.js').then((res) => {
      if (typeof window !== 'undefined') {
        window.EZ_CONFIG = res.config || res;
      }
    });
  }
  
  // 打包后开启反调试逻辑
  if(isProd && enableAntiDebugging) {
    disableDevtool()
  }
  
  await import('./appInit.js');
})();

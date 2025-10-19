

import request from './request';





export function getUserInfo() {

  return request({

    url: '/user/info',

    method: 'get'

  });

}





export function getIpLocationInfo() {

  return request({

    url: 'https://ipwho.is/',

    method: 'get',

    baseURL: '' 
  });

}





export function redeemGiftCard(giftcard) {

  return request({

    url: '/user/redeemgiftcard',

    method: 'post',

    data: { giftcard }

  });

}





export function changePassword(data) {

  return request({

    url: '/user/changePassword',

    method: 'post',

    data

  });

}





export function resetSecurity() {

  return request({

    url: '/user/resetSecurity',

    method: 'get'

  });

}





export function updateRemindSettings(data) {

  return request({

    url: '/user/update',

    method: 'post',

    data

  });

}





export function getActiveSession() {

  return request({

    url: '/user/getActiveSession',

    method: 'get'

  });

}





export function getCommConfig() {

  return request({

    url: '/user/comm/config',

    method: 'get'

  });

}





export function getTelegramBotInfo() {

  return request({

    url: '/user/telegram/getBotInfo',

    method: 'get'

  });

}





export function getUserSubscribe() {

  return request({

    url: '/user/getSubscribe',

    method: 'get'

  });

} 



// 从 auth.js 里复用的获取 token 逻辑
const getAuthData = () => {
  let authData = localStorage.getItem('auth_data');
  if (!authData) {
    const cookieAuthData = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_data='));
    if (cookieAuthData) {
      try {
        const decodedValue = decodeURIComponent(cookieAuthData.split('=')[1]);
        const parsedValue = JSON.parse(decodedValue);
        if (parsedValue && parsedValue.site === window.SITE_CONFIG?.siteName) {
          authData = parsedValue.value;
        } else {
          authData = decodedValue;
        }
      } catch (e) {
        authData = cookieAuthData.split('=')[1];
      }
    }
  }

  if (!authData && window.authDataInStorage) {
    authData = window.authDataInStorage;
  }

  return authData;
};

export const getRecentSessions = async () => {
  try {
    const token = getAuthData();
    console.log('getRecentSessions token:', token);

    const response = await request.get('/user/recent-sessions', {
      headers: {
        Authorization: token
      }
    });

    console.log('getRecentSessions response:', response);

    return response;
  } catch (err) {
    console.error('getRecentSessions error:', err);
    throw err;
  }
};
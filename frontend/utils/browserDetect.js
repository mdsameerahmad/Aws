/**
 * Browser and device detection utility
 * This module provides functions to detect browser types and capabilities
 * for better cross-browser compatibility.
 */

/**
 * Detects browser and device information
 * @returns {Object} Browser and device information
 */
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { type: 'server', needsSpecialHeaders: false };
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isIE = /msie|trident/.test(userAgent);
  const isSamsung = /samsungbrowser/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !isEdge;
  
  // Determine browser/device type
  let type = "unknown";
  if (isIOS) type = "iOS";
  else if (isAndroid) type = "Android";
  else if (isSafari) type = "Safari";
  else if (isFirefox) type = "Firefox";
  else if (isEdge) type = "Edge";
  else if (isIE) type = "Internet Explorer";
  else if (isSamsung) type = "Samsung Browser";
  else if (isChrome) type = "Chrome";
  
  // Determine if browser needs special cache headers
  // Safari, iOS, and some mobile browsers need special cache control headers
  const needsSpecialHeaders = isSafari || isIOS || isAndroid || isSamsung || isIE;
  
  // Check for private browsing mode
  let isPrivateMode = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    isPrivateMode = true;
    console.log('Private browsing mode detected');
  }
  
  return { 
    type, 
    needsSpecialHeaders,
    isSafari,
    isIOS,
    isAndroid,
    isFirefox,
    isEdge,
    isIE,
    isSamsung,
    isChrome,
    isPrivateMode,
    isMobile: isIOS || isAndroid || isSamsung
  };
};

/**
 * Checks if the browser is Safari or iOS
 * @returns {boolean} True if Safari or iOS
 */
export const isSafariOrIOS = () => {
  const { isSafari, isIOS } = getBrowserInfo();
  return isSafari || isIOS;
};

/**
 * Checks if the browser is mobile
 * @returns {boolean} True if mobile browser
 */
export const isMobileBrowser = () => {
  const { isMobile } = getBrowserInfo();
  return isMobile;
};

/**
 * Checks if the browser is in private browsing mode
 * @returns {boolean} True if in private browsing mode
 */
export const isPrivateBrowsing = () => {
  const { isPrivateMode } = getBrowserInfo();
  return isPrivateMode;
};

/**
 * Gets appropriate cache control headers based on browser type
 * @returns {Object} Headers object
 */
export const getCacheControlHeaders = () => {
  const { needsSpecialHeaders } = getBrowserInfo();
  
  if (needsSpecialHeaders) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }
  
  return {};
};

/**
 * Gets appropriate request headers based on browser type
 * @returns {Object} Headers object
 */
export const getRequestHeaders = () => {
  const browserInfo = getBrowserInfo();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Add cache control headers if needed
  if (browserInfo.needsSpecialHeaders) {
    Object.assign(headers, getCacheControlHeaders());
  }
  
  // Add Safari/iOS specific headers
  if (browserInfo.isSafari || browserInfo.isIOS) {
    headers['Accept'] = 'application/json, text/plain, */*';
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  // Add IE specific headers
  if (browserInfo.isIE) {
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  // For mobile browsers, optimize for bandwidth
  if (browserInfo.isMobile) {
    headers['Accept-Encoding'] = 'gzip, deflate';
  }
  
  return headers;
};

export default {
  getBrowserInfo,
  isSafariOrIOS,
  isMobileBrowser,
  isPrivateBrowsing,
  getCacheControlHeaders,
  getRequestHeaders
};
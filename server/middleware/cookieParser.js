const parseCookies = (req, res, next) => {
  // console.log('parseCookies request body', req.body);
  // console.log('parseCookies request headers', req.headers);
  // console.log('parseCookies request headers cookie', req.headers.cookie);
  //console.log('parseCookies request cookies before parse', req.cookies);
  // access the cookie
  var cookies = req.headers.cookie;

  // 3 parts:
  // retrieve cookir from req headers
  // transter cookie to an object;
  // assign the object to req.cookis

  if (cookies === undefined) {
    req.cookies = {};
  } else {
    var cookiesObj = {};
    // split into array , iterate through the array
    cookies.split('; ').forEach((cookie) => {
      var key = cookie.split('=')[0];
      var value = cookie.split('=')[1];
      cookiesObj[key] = value;
    });
    //console.log('our cookieObj', cookiesObj);
    req.cookies = cookiesObj;
  }
  // req.cookies = cookiesObj;
  // console.log('parseCookies request cookies after parse', req.cookies);
  next();
};

module.exports = parseCookies;
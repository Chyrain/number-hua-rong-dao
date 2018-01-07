#!/usr/bin/env node
var express = require('express');
var path = require('path');
var fs = require('fs');
var URL = require('url');
// var favicon = require('serve-favicon');
var logger = require('morgan');

var app = express();

// view engine setup 模板
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
var options = {
  dotfiles: 'ignore', // 是否对外输出文件名以点（.）开头的文件。可选值为 'allow'、'deny' 和 'ignore'
  etag: false,  // 是否启用 etag 生成
  extensions: ['htm', 'html'], // 设置文件扩展名备份选项
  index: 'index.html', // 发送目录索引文件，设置为 false 禁用目录索引(index.html)
  maxAge: '1d', // 设置 Cache-Control 头的 max-age 属性
  redirect: true, // 当路径为目录时，重定向至 “/”
  setHeaders: function (res, path, stat) { // 设置 HTTP 头
    res.set('x-timestamp', Date.now());
  }
}
app.use(express.static(path.join(__dirname, '../dist'), options));

// 静态文件没找到就跳到404 catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log('404 not found');
  var params = URL.parse(req.url, true).path;
  // 获取请求文件的路径
  var filePath = path.join(__dirname, '../dist' + params);
  fs.stat(filePath, (err, stats) => {
    if (err) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
      return;
    }
    // 如果路径是目录，列车整个目录的文件
    if (!err && stats.isDirectory()) {
      var html = "<head><meta charset = 'utf-8'/></head><body><ul>";
      //读取该路径下文件
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.log("读取路径失败！");
          next(err);
        } else {
          //做成一个链接表，方便用户访问
          var flag = false;
          for (var file of files) {
            html += `<li><a href='${file}'>${file}</a></li>`;
          }
          html += '</ul></body>';
          res.writeHead(200, { "content-type": "text/html" });
          res.end(html);
        }
        return;
      });
      return;
    } else {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    }
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Module dependencies.
 */

// var app = require('../app');
var debug = require('debug')('myexpressapp:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log('listening: http://localhost:' + port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

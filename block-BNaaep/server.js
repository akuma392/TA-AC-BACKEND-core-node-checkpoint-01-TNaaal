var http = require('http');
var path = require('path');
let fs = require('fs');
let qs = require('querystring');
let url = require('url');
const userDir = __dirname + '/contacts/';

function handleRequest(req, res) {
  let store = '';
  var extension = req.url.split('.').pop();
  var parsedUrl = url.parse(req.url, true);
  console.log(parsedUrl);
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && req.url === '/contact') {
      res.writeHead(201, { 'content-type': 'text/html' });
      fs.createReadStream('./form.html').pipe(res);
    } else if (req.method === 'POST' && req.url === '/form') {
      let parsedData = qs.parse(store);
      // console.log(store);
      // console.log(parsedData);
      let username = parsedData.username;
      console.log(username);
      let stringifyData = JSON.stringify(parsedData);
      console.log(stringifyData);
      let jsonData = JSON.parse(stringifyData);
      console.log(jsonData);
      fs.open(userDir + username + '.json', 'wx', (err, fd) => {
        if (err) return console.log(err);

        fs.writeFile(fd, stringifyData, (err) => {
          if (err) return console.log(err);

          fs.close(fd, () => {
            res.end(`${username} has created`);
          });
        });
      });
    } else if (parsedUrl.pathname === '/users' && req.method == 'GET') {
      if (parsedUrl.path == '/users') {
        var files = fs.readdirSync(userDir);
        files.forEach((file) => {
          var stringData = fs.readFileSync(userDir + file);
          var content = JSON.parse(stringData);
          console.log(content, 'conte4nt');
          console.log(stringData, 'stringdata');
          res.write(`<p>${content.name}</p>`);
        });
        res.end();
      } else {
        let username = parsedUrl.query.username;
        fs.readFile(userDir + username + '.json', (err, content) => {
          res.setHeader('Content-Type', 'text/html');
          let parsedCont = JSON.parse(content);
          res.write(`<h2>Name:${parsedCont.name}</h2>`);
          res.write(`<h4>Email:${parsedCont.email}</h4>`);
          res.write(`<h4>Username:${parsedCont.username}</h4>`);
          res.write(`<h4>Age:${parsedCont.age}</h4>`);
          res.write(`<h4>Bio:${parsedCont.bio}</h4>`);
          res.end();
        });
      }
    }

    // else if (parsedUrl.path === '/users' && req.method == 'GET') {
    //   fs.readdir(userDir, (err, files) => {
    //     if (err) console.log(err);
    //     else {
    //       files.forEach((elm) => console.log(elm));
    //     }
    //   });
    // }
    else {
      res.end('Page not found');
    }
  });
}

let server = http.createServer(handleRequest);

server.listen(5090, () => {
  console.log('Server is running on 5090');
});

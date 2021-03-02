writeCode

#### Core Node Project

Create a http server which should run on port 5000 and handle following routes:-

1. GET request on index path (`/`) should render html template resembling index.png from assets directory which is attached

2. GET request on `/about` path should render html template resembling about.png from assets directory which is attached

3. Use seperate routes to handle requests for stylesheets and images

##### Note:-

Make sure to put all stylesheets and images in assets directory. You don't have to place exact image in the templates, you can use any of your choice.

```js
var http = require('http');
var path = require('path');
let fs = require('fs');

function handleRequest(req, res) {
  var extension = req.url.split('.').pop();
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(201, { 'content-type': 'text/html' });
      fs.createReadStream('./index.html').pipe(res);
    }
    if (req.method === 'GET' && req.url === '/about') {
      res.writeHead(201, { 'content-type': 'text/html' });
      fs.createReadStream('./about.html').pipe(res);
    }
    if (['png', 'jpg', 'jpeg', 'svg'].includes(extension)) {
      res.setHeader('Content-Type', 'images/' + extension);
      fs.createReadStream('./assets/' + req.url).pipe(res);
    }
    if (req.url === '/style.css') {
      res.setHeader('Content-Type', 'text/css');
      fs.createReadStream('./stylesheet' + req.url).pipe(res);
    }
  });
}

let server = http.createServer(handleRequest);

server.listen(5000, () => {
  console.log('Server is running on 5000');
});
```

4. Handle GET request on `/contact` path which should render a HTML form with following inputs:-

- Name
- Email
- Username(unique)
- Age
- Bio

```js
var http = require('http');
var path = require('path');
let fs = require('fs');

function handleRequest(req, res) {
  var extension = req.url.split('.').pop();
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && req.url === '/contact') {
      res.writeHead(201, { 'content-type': 'text/html' });
      fs.createReadStream('./form.html').pipe(res);
    }
  });
}

let server = http.createServer(handleRequest);

server.listen(5080, () => {
  console.log('Server is running on 5000');
});
```

5. Handle a POST request on `/form` path which should capture about data from above form and save it inside contacts directory provided at the root of the project.

Follow below steps to save data:-

- capture form data from contacts
- create a filename inside contacts using username available from form like `username1.json`
- if that username already exists in contacts, it should throw an error saying `username taken`
- save contacts data inside above created file(A sample file is present inside contacts)
- send a HTML response saying `contacts saved`

##### Note:-

Use fs module for above operations. Make sure to save users who have unique usernames, ensure unique username by using appropriate flags with fs.open()

```js
var http = require('http');
var path = require('path');
let fs = require('fs');
let qs = require('querystring');
const userDir = __dirname + '/contacts/';

function handleRequest(req, res) {
  let store = '';
  var extension = req.url.split('.').pop();
  req.on('data', (chunk) => {
    store += chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && req.url === '/contact') {
      res.writeHead(201, { 'content-type': 'text/html' });
      fs.createReadStream('./form.html').pipe(res);
    }
    if (req.method === 'POST' && req.url === '/form') {
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
    }
  });
}

let server = http.createServer(handleRequest);

server.listen(5080, () => {
  console.log('Server is running on 5080');
});
```

6. handle GET request on `/users?username=ANY_USERNAME_FROM_CONTACTS` which should

- fetch that specific user information based on username from contacts
- return HTML response with all user data

```js
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
  });
}

let server = http.createServer(handleRequest);

server.listen(5080, () => {
  console.log('Server is running on 5080');
});
```

#### Bonus

7. handle GET request on "/users" which should list all contacts into a webpage

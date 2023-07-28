const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
// open the signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

//app.post
app.post('/signup', (req, res) => {
  // req body { username: 'Samantha', password: 'Samantha' }
  // console.log('req body', req.body);
  models.Users.create(req.body)
    .then((success) => {
      res.location('/');
      res.render('index');
    })
    .catch((error) => {
      res.location('/signup'); // .../signup
      res.render('signup'); // render signup page
    });
});

// res.location:

// res.location(url): This method is used to set the HTTP response header "Location" to the specified URL. It is typically used to indicate a redirection URL to the client.

// res.render:

// res.render(view [, locals] [, callback]): This method is used to render an HTML view and send it as the response to the client. It is typically used to generate HTML pages dynamically using a view template engine (such as EJS, Pug, Handlebars, etc.).


//----------------------LOGIN---------------------------//
app.post('/login', (req, res) => {
  // login req body { username: 'Samantha', password: 'Samantha' }
  // console.log('login req body', req.body);
  var options = {};
  options['username'] = req.body.username;

  // var password = req.body.password;
  // var salt = utils.createHash(password);
  // console.log('salt', salt);
  models.Users.get(options)
    .then((success) => {
      var attempted = req.body.password;
      console.log('success', success);
      var password = success.password;
      var salt = success.salt;

      // console.log(password);
      if (models.Users.compare(attempted, password, salt)) {
        // enter the right password
        res.location('/');
        res.render('index');
      } else {
        res.location('/login');
        res.render('login');
      }
    })
    .catch((error) => {
      res.location('/login');
      res.render('login');

    });

});




/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;

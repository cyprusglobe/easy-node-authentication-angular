# Converting easy-node-authentication to Angular

I want to give a huge thanks to Chris Sevilleja from Scotch.io for publishing the wonderful Node Passport Tutorial.

http://scotch.io/tutorials/javascript/easy-node-authentication-linking-all-accounts-together

Please read through his tutorials to learn how to easily use Passport with Node.

## Moving to Angular

This article will use the framework from http://scotch.io/tutorials/javascript/easy-node-authentication-linking-all-accounts-together

There are going to be a few structural changes that will have to happen, as well as modifying some of the routes provided.

## Things to Account For

* __Routes__: To best use Angular, __all__ routes that can be made via AJAX will be updated to be made via AJAX
* __Passport__: With the modification of some routes, we will need to modify a few passport strategies to have a custom callback so we can send JSON data instead of a whole HTML page
* __Passport Errors__: With the changes above, errors will now be handled client-side via Angular, so Passport's __flash__ module will no longer work. So we will create an error scheme for our JSON data, using __Growl__ to display our errors.
* __Angular Routes__: Angular takes ```<a href="...">``` and doesn't make a server GET request, instead it is handled inside of Angular's $routeProvider. Sometimes we will need to have an ```<a href="...">``` actually hit the server, so we will have to create a directive that lets us pick and choose which we want.


## Structural changes

The current structure for the easy-node-authenciation breaks up the server-side app from the client-side views. With the Angular setup, we are going to expose a static directory, which we will call public. Inside of the public directory are some controllers, directives, factories, and modules already built. 

### Current Structure

```
/app
/config
/public
    /controllers
    /directives
    /factories
    /modules
/views
server.js
package.json
```

First step, expose our /public directory to the client.

```javascript
// server.js
...
var flash    = require('connect-flash');
var path     = require('path'); //Add path into our required list
...
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(path.join(__dirname, '/public'))); //Expose /public
...
```

Now that we have the public folder being staticly exposed, lets move our `/views` folder into `/public`

### New Structure

```
/app
/config
/public
    ...
    /views
server.js
package.json
```

## Updating view files to Angular

First, start off by renaming all of the `.ejs` files to `.html`, and remove the following code from `server.js`

```javascript
app.set('view engine', 'ejs'); // set up ejs for templating -- DELETE THIS
```

For the Angular system, we want one file `index.html` which will contain the header information and a div to render our views onto. We are going to gut out `index.html` (Formerly `index.ejs`) and make the other `.html` files into views. First, create a file called `landing.html` in the `/public/views/` directory, and then copy the contents of the `<div class="container">` below into that file. 

```html
<!doctype html>
    <html>
        <head>
            <title>Node Authentication</title>
            <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
            <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">
        <style>
            body { padding-top:80px; }
        </style>
    </head>
    <body>
        <div class="container">

            <div class="jumbotron text-center">
                <h1><span class="fa fa-lock"></span> Node Authentication</h1>

                <p>Login or Register with:</p>

                <a href="/login" class="btn btn-default"><span class="fa fa-user"></span> Local Login</a>
                <a href="/signup" class="btn btn-default"><span class="fa fa-user"></span> Local Signup</a>
                <a href="/auth/facebook" class="btn btn-primary"><span class="fa fa-facebook"></span> Facebook</a>
                <a href="/auth/twitter" class="btn btn-info"><span class="fa fa-twitter"></span> Twitter</a>
                <a href="/auth/google" class="btn btn-danger"><span class="fa fa-google-plus"></span> Google+</a>
            </div>

        	<div class="text-center">
                <p>Angular conversion by <a href="http://brandonmcquarie.com/">Brandon</a> and <a href="http://chrisheninger.com/">Chris</a>. Visit the <a href="https://github.com/brandonmcquarie/easy-node-authentication-angular">Github Repo</a>.</p>
                <p>Original Node/Express demo by <a href="http://scotch.io">Scotch</a>. Visit the <a href="http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local">tutorial</a>.</p>
        	</div>

        </div>
    </body>
</html>
```

Our `landing.html` file should contain the following

```html
<div class="jumbotron text-center">
    <h1><span class="fa fa-lock"></span> Node Authentication</h1>

    <p>Login or Register with:</p>

    <a href="/login" class="btn btn-default"><span class="fa fa-user"></span> Local Login</a>
    <a href="/signup" class="btn btn-default"><span class="fa fa-user"></span> Local Signup</a>
    <a href="/auth/facebook" class="btn btn-primary"><span class="fa fa-facebook"></span> Facebook</a>
    <a href="/auth/twitter" class="btn btn-info"><span class="fa fa-twitter"></span> Twitter</a>
    <a href="/auth/google" class="btn btn-danger"><span class="fa fa-google-plus"></span> Google+</a>
</div>

<div class="text-center">
    <p>Angular conversion by <a href="http://brandonmcquarie.com/">Brandon</a> and <a href="http://chrisheninger.com/">Chris</a>. Visit the <a href="https://github.com/brandonmcquarie/easy-node-authentication-angular">Github Repo</a>.</p>
    <p>Original Node/Express demo by <a href="http://scotch.io">Scotch</a>. Visit the <a href="http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local">tutorial</a>.</p>
</div>
```

Now, go into `index.html` and remove the contents of `<div class="container">`. We also need to add ng-view to the container and ng-app to html, winding up with...

```html
<!doctype html>
<html ng-app="app">
    <head>
        <title>Node Authentication</title>
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">
        <style>
            body { padding-top:80px; }
        </style>
    </head>
    <body>
        <div class="container" ng-view>

        </div>
    </body>
</html>
```

Now we need to add in our javascript includes for Angular. For the purpose of this tutorial, there will be three new includes.
1. jQuery
2. Angular
3. Angular-Route

Also we will include all of the Angular files inside the /public directory.

```html
...
<title>Node Authentication</title>
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-route.min.js"></script>
   
    <script src="/factories/httpInterceptor.js"></script>
    <script src="/directives/common.js"></script>
    <script src="/controllers/profile.js"></script>
    <script src="/controllers/login.js"></script>
    <script src="/modules/growl.js"></script>
    <script src="/modules/core.js"></script>
...
```

Now you can test the changes by starting the server with `node server.js`.

Go to `http://localhost:8080` you will get an error saying `Failed to lookup view "index.ejs"`. So now it is time to update some of our routes.

Open `/app/routes.js`. The route we are dealing with is the very first one on the list. `app.get('/', ...)` lets update this from `res.render('index.ejs');` to `res.sendfile('./public/views/index.html');` as we no longer are doing server side templating.

Now go ahead and start up the server, and you should see the Node Authentication landing page.

### Updating all of the template files
Go ahead and go into all of the view files that we haven't touched __connect-local.html__, __login.html__, __profile.html__, __signup.html__ and delete all of the code except for what is __inside__ of `<div class="container">...</div>`

As an example, __login.html__ turns into...

```html
<div class="col-sm-6 col-sm-offset-3">

    <h1><span class="fa fa-sign-in"></span> Login</h1>

    <% if (message.length > 0) { %>
        <div class="alert alert-danger"><%= message %></div>
    <% } %>

   <!-- LOGIN FORM -->
    <form action="/login" method="post">
        <div class="form-group">
            <label>Email</label>
            <input type="text" class="form-control" name="email">
        </div>
        <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" name="password">
        </div>

        <button type="submit" class="btn btn-warning btn-lg">Login</button>
    </form>

    <hr>

    <p>Need an account? <a href="/signup">Signup</a></p>
    <p>Or go <a href="/">home</a>.</p>

    <div class="text-center">
        <p>Angular conversion by <a href="http://brandonmcquarie.com/">Brandon</a> and <a href="http://chrisheninger.com/">Chris</a>. Visit the <a href="https://github.com/brandonmcquarie/easy-node-authentication-angular">Github Repo</a>.</p>
        <p>Original Node/Express demo by <a href="http://scotch.io">Scotch</a>. Visit the <a href="http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local">tutorial</a>.</p>
    </div>

</div>
```

## Updating templates to use Angular syntax

If you click on Login or Signup, you will see that there are <%= %> all over the place.

Update all `<%= .. %>` to `{{ .. }}` in every `.html` file in the `/public/views` directory

Then, replace the below code with `<div growl></div>` in preparation for the new error system.

```html
<% if (message.length > 0) { %>
    <div class="alert alert-danger"><%= message %></div>
<% } %>
```

One other conditional that Angular doesn't have, is that `if (user.facebook.token)`, so change this to `ng-show` and `ng-hide`

```html
<% if (user.facebook.token) { %>
    <p>
        <strong>id</strong>: {{ user.facebook.id }}<br>
        <strong>token</strong>: {{ user.facebook.token }}<br>
        <strong>email</strong>: {{ user.facebook.email }}<br>
        <strong>name</strong>: {{ user.facebook.name }}<br>
    </p>

    <a href="/unlink/facebook" class="btn btn-primary">Unlink</a>
<% } else { %>
    <a href="/connect/facebook" class="btn btn-primary">Connect Facebook</a>
<% } %>
```

We are going to wrap it in an arbitrary `<container>`

```html
<container ng-show="user.facebook.token">
    <p>
        <strong>id</strong>: {{ user.facebook.id }}<br>
        <strong>token</strong>: {{ user.facebook.token }}<br>
        <strong>email</strong>: {{ user.facebook.email }}<br>
        <strong>name</strong>: {{ user.facebook.name }}<br>
    </p>

    <a href="/unlink/facebook" class="btn btn-primary">Unlink</a>
</container>
<container ng-hide="user.facebook.token">
    <a href="/connect/facebook" class="btn btn-primary">Connect Facebook</a>
</container>
```

Great, now our templates are setup! Let's move over to the routing system again. If you go to the login page `'http://localhost:8080/login` you will get that familar .ejs error we had before.

## Updating additional Routes

Go ahead and delete all routes containing `.ejs` in the `/app/routes.js` file, for now we will leave restricting page access to Angular with its $routeProvider.

Now that we have removed all references to `.ejs` files in our route, you need to update the routes to send the index.html file if no previous routes are caught. So our first route needs to be moved to the very bottom, and updated as a __catchall__. 

```javascript
// show the home page (will also have our login links)
app.get('/', function(req, res) {
    res.sendfile('./public/views/index.html');
});
```

We are going to move it down to the bottom, and update it to `'*'` route.

```javascript
...

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
            });
    });


    // show the home page (will also have our login links)
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html');
    });
};
...
```

Now we are able to click around between __Login__ and __Signup__, but Facebook, Twitter and Google aren't working! This is because when we click on those buttons, Angular is grabbing the `<a href="...">` and updating the route, and we never make a request to the server. So we need to update our social login buttons to ignore Angular's internal routing, and to actually go and make a real GET request from the server. If you open the `/public/directives/common.js` file you will see a `redir` directive restricted to 'A' (Attribute), that makes a Javascript `window.location` redirect, and prevents the default redirect. We are going to utilize this feature on those buttons.

In our `landing.html` file lets add `redir` to the `<a>` tag
```html
<a redir href="/auth/facebook" class="btn btn-primary"><span class="fa fa-facebook"></span> Facebook</a>
<a redir href="/auth/twitter" class="btn btn-info"><span class="fa fa-twitter"></span> Twitter</a>
<a redir href="/auth/google" class="btn btn-danger"><span class="fa fa-google-plus"></span> Google+</a>
```

While we are at it, we need to update the `Connect` and `Unlink` buttons for those three social logins on the `profile.html` page.

```html
...
    <a redir href="/unlink/google" class="btn btn-danger">Unlink</a>
</container>
<container ng-hide="user.google.token">
    <a redir href="/connect/google" class="btn btn-danger">Connect Google</a>
</container>
...
```

Great, now we should be able to login with everything __except Local login__. You will notice however, the profile isn't showing any accounts linked.

We are making an AJAX request to `/api/userData` in our `/public/controllers/profile.js`, but we do not have that route created yet. So lets go into our `/app/routes.js` file. We want to return JSON, so lets setup a new Middleware and name it `function isLoggedInAjax`. We will have the following code after doing so.

```javascript
...
// route middleware to ensure user is logged in - ajax get
function isLoggedInAjax(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.json( { redirect: '/login' } );
    } else {
        next();
    }
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
...
```

Now lets add a route `/api/userData` that will check if the user is logged in, and if they are, return the user object. 

```javascript
...
    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/api/userData', isLoggedInAjax, function(req, res) {
        return res.json(req.user);
    });

    // show the home page (will also have our login links)
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html');
    });
};
...
```

We cannot do `res.redirect()` in our AJAX call, since we already have header information and we aren't making a whole new HTML request to our server. If the user is logged in, we `return res.json(req.user)`, or else we return `{ redirect: '/login' }`. Angular allows for us to write __factories__, which there is one inside the `/public/factories/` directory, that listens for a response, checks if `.redirect` exists in the return, if it does, redirects before we get to the controller that made the AJAX call.

## Dealing with logging in to Local or creating a new Local account

Okay, so social networks are able to be linked/unlinked now, so lets move over to our Local account. If you go to sign in as local, it is probably just redirecting you back to the login screen, unless of course you are logging in with previous credentials already in your MongoDB. So now, we are trying to login locally, we aren't going to an external webpage, so we want to setup this form to post through AJAX so we do not have a page reload.

To setup our Login form, go into the `/public/views/login.html` file and lets update how our form submits. 

```html
<form action="/login" method="post">
    <div class="form-group">
        <label>Email</label>
        <input type="text" class="form-control" name="email">
    </div>
    <div class="form-group">
        <label>Password</label>
        <input type="password" class="form-control" name="password">
    </div>

    <button type="submit" class="btn btn-warning btn-lg">Login</button>
</form>
```

Inside of our `Login` module we have a `LoginForm` controller, which will handle the AJAX call, so lets modify our HTML to use that controller. We need to remove the form's `action` and `method` attributes, and add `ng-model` to our inputs that we want access to. Make these changes to the `Signup` form as well in `/public/views/signup.html`, using the `SignupForm` controller and `signup()` function.

```html
<form ng-submit="login()" ng-controller="LoginForm">
    <div class="form-group">
        <label>Email</label>
        <input type="text" class="form-control" ng-model="email">
    </div>
    <div class="form-group">
        <label>Password</label>
        <input type="password" class="form-control" ng-model="password">
    </div>

    <button type="submit" class="btn btn-warning btn-lg">Login</button>
</form>
```

If you go and test logging in and have a dev console open, you will see an HTML page getting logged out. Lets go check out or `/app/routes.js` to see why.

```javascript
...
// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
...
```

On success or error, we try to redirect, which will send our `index.html` file back to the client. This won't work, we need to be sending JSON back with our AJAX request. Thankfully, passport has the ability to have a custom callback where we can handle authenticating differently.

Lets open up `/config/passport.js` and update the `local-login` and `local-signup` strategies to what is below
```javascript
...
// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
},
function(req, email, password, done) {
    if (email)
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    // asynchronous
    process.nextTick(function() {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, { error: 'No user found. ' });

            if (!user.validPassword(password))
                return done(null, { error: 'Oops! Wrong password.' });

            // all is well, return user
            else
                return done(null, user);
        });
    });
}));

// =========================================================================
// LOCAL SIGNUP =============================================================
// =========================================================================
passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
},
function(req, email, password, done) {
    if (email)
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    // asynchronous
    process.nextTick(function() {
        // if the user is not already logged in:
        if (!req.user) {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                console.log(user);
                // check to see if theres already a user with that email
                if (user) {
                    return done(null, { error: 'That email is already taken.' });
                } else {

                    // create the user
                    var newUser            = new User();

                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser);
                    });
                }

            });
        // if the user is logged in but has no local account...
        } else if ( !req.user.local.email ) {
            // ...presumably they're trying to connect a local account
            var user            = req.user;
                user.local.email    = email;
            user.local.password = user.generateHash(password);
            user.save(function(err) {
                if (err)
                    throw err;
                return done(null, user);
            });
        } else {
            // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
            return done(null, req.user);
        }

    });

}));
...
```
Now open `/app/routes.js`
```javascript
...

// LOGIN ===============================

// process the login form
app.post('/login', function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.json({ error: 'Email and Password required' });
    }
    passport.authenticate('local-login', function(err, user, info) {
        if (err) { 
            return res.json(err);
        }
        if (user.error) {
            return res.json({ error: user.error });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.json(err);
            }
            return res.json({ redirect: '/profile' });
        });
    })(req, res);
});

// SIGNUP =================================

// process the signup form
app.post('/signup', function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.json({ error: 'Email and Password required' });
    }
    passport.authenticate('local-signup', function(err, user, info) {
        if (err) { 
            return res.json(err);
        }
        if (user.error) {
            return res.json({ error: user.error });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.json(err);
            }
            return res.json({ redirect: '/profile' });
        });
    })(req, res);
});
...
```

We are now ready to start testing logging in as a Local account! If you log in, you may have noticed you have a hard time logging out... this is because we are again using Angular to route us to `/logout`, and we aren't communicating with the server to actually log out. For this, we have another directive we can use. Add `logout` to the Logout button in `public/views/profile.html` and update our `/app/routes.js` accordingly (From GET to POST)

```html
<a logout href="/logout" class="btn btn-default btn-sm">Logout</a>
```

Update the `app.get('/logout'...')` to what is below.
```javascript
//routes.js
...
// LOGOUT ==============================
app.post('/logout', function(req, res) {
   req.logout();
   res.json({ redirect: '/logout' });
});
...
```

Lastly, we need to fix linking/unlinking a Local account. For unlinking, we can add `redir` to the `<a>` tag in `/public/views/profile.html` so we can hit the server to unlink the account.

```html
<a redir href="/unlink/local" class="btn btn-default">Unlink</a>
```

As for linking an account, thats very similar to logging into an account. So lets go and update the form on `/public/views/connect-local.html` to use `LocalForm` and instead of `login()` use `connect()`.

```html
<form ng-controller="LoginForm" ng-submit="connect()">
    <div class="form-group">
        <label>Email</label>
        <input type="text" class="form-control" ng-model="email">
    </div>
    <div class="form-group">
        <label>Password</label>
        <input type="password" class="form-control" ng-model="password">
    </div>

    <button type="submit" class="btn btn-warning btn-lg">Add Local</button>
</form>
```

Lastly, go and update the route `/connect/local` inside `/app/routes.js`, we need to make the same changes as we did to the `/login` route.

```javascript
app.post('/connect/local', function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.json({ error: 'Email and Password required' });
    }
    passport.authenticate('local-signup', function(err, user, info) {
        if (err) { 
            return res.json(err);
        }
        if (user.error) {
            return res.json({ error: user.error });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.json(err);
            }
            return res.json({ redirect: '/profile' });
        });
    })(req, res);
});
```

Now you can go and test all the features of the page!

Also, we are no longer using the `flash` module, so you can remove it from the `package.json` file, and the references to it in `server.js`. The final finished project is in /public-final, with all of the files and server files so you can start up the node server to test in there.

## Summary

Hopefully you were able to convert the Easy-Node-Authentication-Tutorial into an Angular application. There is a number of other things you can do with this, like making it so social accounts can only be linked to at most one Local account, requiring a local account by redirecting new Social logins to the Link Local landing page. Also, if you are wanting more than just a `/profile` landing page, you will want to update your Middleware to validate that a user is checked in for all pages except `/`, `/login`, and `/signup`.

We are working on a project which uses a spinoff of this tutorial. If you are interested in a more advanced login system, feel free to contact us with your questions/ideas.

* Tweet us: [@brandonmcquarie](https://twitter.com/brandonmcquarie) or [@chrisheninger](https://twitter.com/chrisheninger)
* Email us: brandon.mcquarie@gmail.com or chris@igravitydesign.com

Non-Angular Node Authentication Tutorial From Scotch.io

http://scotch.io/tutorials/javascript/easy-node-authentication-linking-all-accounts-together

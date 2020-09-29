const passport = require('passport');
const bcrypt = require('bcryptjs');
const moment = require('moment');

require('dotenv').config();

const { check, body, validationResult } = require('express-validator');

const User = require('../models/user');
const Message = require('../models/message');

// GET request for message list and message form
exports.index = (req, res, next) => {
  Message.find({})
    .populate('user')
    .exec((err, list_message) => {
      if (err) {
        return next(err);
      } else {
        res.render('index', {
          title: 'Members Only',
          user: req.user,
          message_list: list_message,
        });
      }
    });
};

// POST request for message form on index
exports.index_post = [
  // validate
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('A title is required')
    .isLength({ max: 50 })
    .withMessage('The title is too long. Max 50 characters'),
  body('text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('A message is required')
    .isLength({ max: 300 })
    .withMessage('The message is too long. Max 300 characters'),

  // sanitize
  body('*').escape(),

  (req, res, next) => {
    // extract the validation errors from a request
    const errors = validationResult(req);

    const message = new Message({
      user: req.user.id,
      title: req.body.title,
      text: req.body.text,
      added: moment().format('MM/DD/YY, h:mm:ss'),
    });

    if (!errors.isEmpty()) {
      // there are errors. render again with filled in fields
      res.render('index', {
        title: 'Members Only',
        message: {
          title: req.body.title,
          text: req.body.text,
        },
        errors: errors.array(),
      });
      return;
    } else {
      message.save((err) => {
        if (err) return next(err);
        Message.find({})
          .populate('user')
          .exec((err, list_message) => {
            if (err) {
              return next(err);
            } else {
              res.render('index', {
                title: 'Members Only',
                user: req.user,
                message_list: list_message,
              });
            }
          });
      });
      return;
    }
  },
];

// GET request for sign up form
exports.sign_up_get = (req, res, next) => {
  res.render('sign_up_form', { title: 'Sign Up' });
};

// POST request for sign up form
exports.sign_up_post = [
  // validate
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty')
    .isAlpha()
    .withMessage('Last name must contain only alphabetical characters'),

  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must not be empty')
    .isAlpha()
    .withMessage('Last Name may only contain alphabetical charaters'),

  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must not be empty')
    .custom((value) => {
      return User.findOne({ username: value }).then((user) => {
        if (user) {
          return Promise.reject('Username already taken');
        }
      });
    }),

  body('password').exists(),

  check(
    'confirm_password',
    'Confirm Password field must have the same value as the Password field'
  )
    .exists()
    .custom((value, { req }) => value === req.body.password),

  // sanitize
  body('*').escape(),

  (req, res, next) => {
    // extract the validation errors from a request
    const errors = validationResult(req);

    // capitalize first letter in first name
    const firstname =
      req.body.first_name.charAt(0).toUpperCase() +
      req.body.first_name.slice(1);
    // capitalize first letter in last name
    const familyname =
      req.body.family_name.charAt(0).toUpperCase() +
      req.body.family_name.slice(1);
    const password = req.body.password;

    // encrypt password and make user
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return next(err);
      const user = new User({
        first_name: firstname,
        family_name: familyname,
        username: req.body.username,
        password: hash,
        membership: 'Non-Member',
        member_since: moment().format('MMMM Do YYYY'),
      });

      if (!errors.isEmpty()) {
        // there are errors. render again with filled in fields
        res.render('sign_up_form', {
          title: 'Sign Up',
          user: {
            first_name: firstname,
            family_name: familyname,
            username: req.body.username,
          },
          errors: errors.array(),
        });
        return;
      } else {
        user.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/code');
        });
        return;
      }
    });
  },
];

// GET request to secret code form
exports.code_get = (req, res, next) => {
  res.render('code', { title: 'Secret Code' });
};

// POST request for secret code form
exports.code_post = (req, res, next) => {
  const code = process.env.SECRET_CODE;
  const input = req.body.code;

  if (code === input) {
    User.findByIdAndUpdate(
      req.user,
      { $set: { membership: 'Member' } },
      (err, results) => {
        if (err) return next(err);

        Message.find({})
          .populate('user')
          .exec((err, list_message) => {
            if (err) {
              return next(err);
            } else {
              res.render('index', {
                title: 'Members Only',
                user: req.user,
                message_list: list_message,
              });
            }
          });
      }
    );
  } else {
    res.render('code', {
      input: input,
      msg: 'Sorry that was not the secret code',
    });
  }
};

// GET request for log in form
exports.login_get = (req, res, next) => {
  res.render('login_form', { title: 'Log In' });
};

// POST request for log in form
exports.login_post = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.render('login_form', {
        title: 'Log In',
        msg: 'Incorrect username or password',
      });
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

// GET request for log out
exports.logout_get = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

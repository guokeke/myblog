/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import { verify } from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import { auth as config, host, machineName } from '../config';

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: config.facebook.id,
  clientSecret: config.facebook.secret,
  callbackURL: '/login/facebook/return',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  /* eslint-disable no-underscore-dangle */
  const loginName = 'facebook';
  const claimType = 'urn:facebook:access_token';
  const fooBar = async () => {
    if (req.user) {
      const userLogin = await UserLogin.findOne({
        attributes: ['name', 'key'],
        where: { name: loginName, key: profile.id },
      });
      if (userLogin) {
        // There is already a Facebook account that belongs to you.
        // Sign in with that account or delete it, then link it with your current account.
        done();
      } else {
        const user = await User.create({
          id: req.user.id,
          email: profile._json.email,
          logins: [
            { name: loginName, key: profile.id },
          ],
          claims: [
            { type: claimType, value: profile.id },
          ],
          profile: {
            displayName: profile.displayName,
            gender: profile._json.gender,
            picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
          },
        }, {
          include: [
            { model: UserLogin, as: 'logins' },
            { model: UserClaim, as: 'claims' },
            { model: UserProfile, as: 'profile' },
          ],
        });
        done(null, {
          id: user.id,
          email: user.email,
        });
      }
    } else {
      const users = await User.findAll({
        attributes: ['id', 'email'],
        where: { '$logins.name$': loginName, '$logins.key$': profile.id },
        include: [
          {
            attributes: ['name', 'key'],
            model: UserLogin,
            as: 'logins',
            required: true,
          },
        ],
      });
      if (users.length) {
        done(null, users[0]);
      } else {
        let user = await User.findOne({ where: { email: profile._json.email } });
        if (user) {
          // There is already an account using this email address. Sign in to
          // that account and link it with Facebook manually from Account Settings.
          done(null);
        } else {
          user = await User.create({
            email: profile._json.email,
            emailConfirmed: true,
            logins: [
              { name: loginName, key: profile.id },
            ],
            claims: [
              { type: claimType, value: accessToken },
            ],
            profile: {
              displayName: profile.displayName,
              gender: profile._json.gender,
              picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
            },
          }, {
            include: [
              { model: UserLogin, as: 'logins' },
              { model: UserClaim, as: 'claims' },
              { model: UserProfile, as: 'profile' },
            ],
          });
          done(null, {
            id: user.id,
            email: user.email,
          });
        }
      }
    }
  };

  fooBar().catch(done);
}));

passport.use(new BearerStrategy({
  passReqToCallback: true,
}, async (req, token, done) => {
  const name = 'local:token';
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'profile.displayName'],
      where: {
        '$logins.name$': name,
        '$logins.key$': token,
      },
      include: [{
        attributes: ['name', 'key'],
        model: UserLogin,
        as: 'logins',
        required: true,
      }, {
        attributes: ['displayName'],
        model: UserProfile,
        as: 'profile',
      }],
    });
    if (!users.length) return done(null, false);
    verify(token, config.jwt.secret);
    const lastLoginIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    users[0].update({
      lastLoginIp,
      lastLoginTime: `${new Date()}`,
    });
    return done(null, {
      email: users[0].get('email'),
      hostname: machineName || host,
      username: users[0].get('displayName') || users[0].get('email').split('@')[0],
      path: users[0].get('path'),
    }, { scope: 'read' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return done(null, false);
    if (err.name === 'TokenExpiredError') return done(null, false);
    console.log(err); // eslint-disable-line no-console
    return done(null, err);
  }
},
));

export default passport;

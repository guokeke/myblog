/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import MarkdownIt from 'markdown-it';
import fm from 'front-matter';
import Layout from '../../components/Layout';
import Page from '../../components/Page';
import fetch from '../../core/fetch';

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

export default {

  path: '/read/:articleId',

  async action({ params }) {
    try {
      const { articleId } = params;
      if (!articleId) return { redirct: './notFound' };
      const res = await fetch(`/article/${articleId}`)
        .catch(err => console.error(err)); // eslint-disable-line
      let json = null;

      json = await res.json();

      if (!json.content) {
        return {
          redirect: '/notFound',
        };
      }

      const frontmatter = fm(json.content || '');
      frontmatter.attributes.html = md.render(frontmatter.body);

      if (!frontmatter.attributes.title) {
        frontmatter.attributes.title = frontmatter.body.substring(0, 10);
      }

      return {
        title: frontmatter.attributes.title,
        chunk: 'article',
        component: <Layout><Page {...frontmatter.attributes}> { null } </Page></Layout>,
      };
    } catch (err) {
      throw err;
    }
  },

};
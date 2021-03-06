/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Screen from '../../components/Screen';
import NotFound from './NotFound';

const title = 'T=T';

export default {

  path: '*',

  action() {
    return {
      title,
      component: <Screen><NotFound title={title} /></Screen>,
      status: 404,
    };
  },

};

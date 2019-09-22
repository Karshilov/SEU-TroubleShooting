/* eslint valid-jsdoc: "off" */

'use strict';

const yaml = require('yaml')
const fs = require('fs')
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/


  let configYaml = yaml.parse(fs.readFileSync(path.join(appInfo.baseDir, 'SEU-TroubleShooting.yml'), 'utf8'))

  const config = exports = {
    security: {
      csrf: {
        enable: false
      },
    },
    cluster: {
      listen: {
        port: configYaml.port ? +configYaml.port : 7942,
        hostname: configYaml.hostname
      }
    },
    mongoose: {
      client: {
        url: configYaml.mongodbURL,
        options: {},
        // mongoose global plugins, expected a function or an array of function and options
        plugins: [],
      },
    },
    wechat: {
      appID: configYaml.appID,
      appsecret: configYaml.appsecret,
      token: configYaml.token,
      userTemplateId:configYaml.userTemplateId,
      staffTemplateId:configYaml.staffTemplateId
    },
    redirectURL: configYaml.redirectURL,
    serverURL: configYaml.serverURL
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1567152122001_1182';

  // add your middleware config here
  config.middleware = ['responseFormatter', 'identity'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};

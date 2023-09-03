const path = require('path');

module.exports = function override(config, env) {
  // 添加 resolve.fallback 配置
  config.resolve.fallback = {
    http: require.resolve('stream-http'),
  };

  // 返回修改后的配置
  return config;
};

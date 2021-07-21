const { networkInterfaces} = require('os')
const Mustache = require('mustache');
const fs = require('fs');
const path = require("path");

const getIpAddress = () => {
  const nets = networkInterfaces();
  const results = Object.create({});
  
  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          if (net.family === 'IPv4' && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
  }

  return results["en0"][0];
};

const view = { ip: getIpAddress()}
const template = `server {
  listen 80;
  listen [::]:80;

  server_name local-xinhxinh.live;
  # FRONTEND LOCAL
  location    /             {     proxy_pass http://{{ip}}:3000;  }
  # BACKEND DEVELOPMENT
  location    /api/v1             {     proxy_pass https://dev.xinhxinh.live/api/v1;  }

  # BACKEND LOCAL
  location    /api/v1/marketing             {     proxy_pass http://{{ip}}:18900;  }
}`

const output = Mustache.render(template, { ip: getIpAddress()});

fs.writeFile(path.join(__dirname, "../nginx/default.conf"), output, (error) => {
  if (error) {
    console.log(error);
  };
})

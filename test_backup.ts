import http from "http";

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/admin/database/backup',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', d => {
    data += d;
  });
  res.on('end', () => {
    console.log(data.substring(0, 100)); // print first 100 char
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();

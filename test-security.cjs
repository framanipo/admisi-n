const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/registrations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Create:', data));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({
  names: 'Test', paternalSurname: 'Test', maternalSurname: 'Test',
  dni: '99999999', career: 'Civil', modality: 'Ordinario'
}));
req.end();

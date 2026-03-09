const http = require('http');

const data = JSON.stringify({
    amount: 100,
    currency: "brl",
    orderId: "sub_combined_123",
    userId: "usr_123",
    email: "test@example.com",
    maintenancePlan: { name: "Basic", price: 100 },
    mainPlan: { name: "Setup", price: "R$ 1.500" }
});

const options = {
    hostname: 'localhost',
    port: 4002,
    path: '/api/payments/create-maintenance-subscription',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(`Error: ${e.message}`));
req.write(data);
req.end();

const express = require('express');
const { WebSocketServer } = require('ws'); // ใช้ WebSocket
const http = require('http');

const app = express();
const port = 3000;

// สร้าง HTTP Server
const server = http.createServer(app);

// ตัวแปรเก็บข้อมูลอุณหภูมิ
let temperatureData = [];

// สร้าง WebSocket Server
const wss = new WebSocketServer({ server });

// Broadcast ข้อมูลไปยังทุก Client ที่เชื่อมต่อ
function broadcastData(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // ตรวจสอบว่า WebSocket ยังเปิดอยู่
      client.send(JSON.stringify(data));
    }
  });
}

// เมื่อมีการเชื่อมต่อ WebSocket
wss.on('connection', ws => {
  console.log('New client connected');
  ws.send(JSON.stringify({ type: 'init', data: temperatureData })); // ส่งข้อมูลเริ่มต้นให้ Client

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Endpoint สำหรับรับข้อมูลจาก ESP8266
app.get('/upload', (req, res) => {
  const { celsius, fahrenheit, kelvin } = req.query;

  if (celsius && fahrenheit && kelvin) {
    const newData = {
      celsius,
      fahrenheit,
      kelvin,
      timestamp: new Date().toLocaleString()
    };
    temperatureData.push(newData);

    // Broadcast ข้อมูลใหม่ให้ทุก Client
    broadcastData({ type: 'new', data: newData });

    res.json({ status: 'success', message: 'Data received successfully' });
  } else {
    res.status(400).json({ status: 'error', message: 'Missing parameters' });
  }
});

// หน้าแรกแสดงตาราง HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Real-Time Temperature Data</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        table {
          width: 80%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          text-align: center;
          padding: 8px;
        }
        th {
          background-color: #f4f4f4;
        }
        button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #d32f2f;
        }
      </style>
    </head>
    <body>
      <h1>Real-Time Temperature Data</h1>
      <table id="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Celsius</th>
            <th>Fahrenheit</th>
            <th>Kelvin</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <!-- ข้อมูลจะถูกเติมที่นี่แบบเรียลไทม์ -->
        </tbody>
      </table>
      <button onclick="clearData()">Clear Data</button>
      <script>
        const tableBody = document.querySelector('#data-table tbody');
        const ws = new WebSocket('ws://' + location.host);

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);

          if (message.type === 'init') {
            // ล้างตารางและเติมข้อมูลเริ่มต้น
            tableBody.innerHTML = '';
            message.data.forEach((item, index) => {
              addRow(index + 1, item);
            });
          } else if (message.type === 'new') {
            // เพิ่มข้อมูลใหม่ในตาราง
            addRow(tableBody.rows.length + 1, message.data);
          }
        };

        function addRow(index, data) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index}</td>
            <td>${data.celsius} °C</td>
            <td>${data.fahrenheit} °F</td>
            <td>${data.kelvin} K</td>
            <td>${data.timestamp}</td>
          `;
          tableBody.appendChild(row);
        }

        function clearData() {
          if (confirm('Are you sure you want to clear all data?')) {
            fetch('/clear', { method: 'POST' })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success') {
                  alert('Data cleared successfully!');
                  tableBody.innerHTML = ''; // ล้างตาราง
                } else {
                  alert('Failed to clear data.');
                }
              });
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Endpoint สำหรับล้างข้อมูล
app.post('/clear', (req, res) => {
  temperatureData = [];
  broadcastData({ type: 'clear' }); // แจ้งให้ทุก Client ล้างข้อมูล
  res.json({ status: 'success', message: 'Data cleared successfully' });
});

// เริ่มเซิร์ฟเวอร์
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

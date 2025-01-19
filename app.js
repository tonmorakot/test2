const express = require('express');
const app = express();
const port = 3000;

// ตัวแปรเก็บข้อมูลอุณหภูมิ
let temperatureData = [];

// Middleware: รองรับ JSON และ URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint สำหรับรับข้อมูลจาก ESP8266
app.get('/upload', (req, res) => {
  const { celsius, fahrenheit, kelvin } = req.query;

  if (celsius && fahrenheit && kelvin) {
    // เพิ่มข้อมูลใหม่ใน temperatureData
    const newData = {
      celsius,
      fahrenheit,
      kelvin,
      timestamp: new Date().toLocaleString()
    };
    temperatureData.push(newData);
  }

  res.json({ status: 'success', message: 'Data received successfully' });
});

// Endpoint แสดงหน้าแสดงผล
app.get('/', (req, res) => {
  // สร้างตาราง HTML
  const tableRows = temperatureData.map((data, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${data.celsius} °C</td>
      <td>${data.fahrenheit} °F</td>
      <td>${data.kelvin} K</td>
      <td>${data.timestamp}</td>
    </tr>
  `).join('');

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
      <script>
        // ตั้งให้หน้าเว็บรีเฟรชตัวเองทุก 5 วินาที
        setInterval(() => {
          location.reload();
        }, 5000);
      </script>
    </head>
    <body>
      <h1>Real-Time Temperature Data</h1>
      <table>
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
          ${tableRows || '<tr><td colspan="5">No data available</td></tr>'}
        </tbody>
      </table>
      <button onclick="clearData()">Clear Data</button>
      <script>
        function clearData() {
          if (confirm('Are you sure you want to clear all data?')) {
            fetch('/clear', { method: 'POST' })
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success') {
                  alert('Data cleared successfully!');
                  location.reload(); // โหลดหน้าใหม่
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

// Endpoint ล้างข้อมูล
app.post('/clear', (req, res) => {
  temperatureData = []; // ล้างข้อมูลใน temperatureData
  res.json({ status: 'success', message: 'Data cleared successfully' });
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const app = express();
const port = 3000;

// ตัวแปรเก็บข้อมูลอุณหภูมิ
let temperatureData = [];

// Middleware: เพื่อรองรับ JSON และ URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint สำหรับรับข้อมูลจาก ESP8266
app.get('/upload', (req, res) => {
  const { celsius, fahrenheit, kelvin } = req.query;

  if (celsius && fahrenheit && kelvin) {
    // เพิ่มข้อมูลใน temperatureData
    const newData = {
      celsius,
      fahrenheit,
      kelvin,
      timestamp: new Date().toLocaleString()
    };
    temperatureData.push(newData);
  }

  // ส่งข้อความยืนยันกลับ ESP8266
  res.json({ status: 'success', message: 'Data received successfully' });
});

// หน้าแรกแสดงข้อมูลที่ถูกส่งมา
app.get('/', (req, res) => {
  // สร้างตาราง HTML
  let tableRows = temperatureData.map((data, index) => `
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
      <title>Temperature Data</title>
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
      <h1>Temperature Data Logger</h1>
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
                  location.reload(); // Reload page to refresh data
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
  temperatureData = []; // ล้างข้อมูลทั้งหมด
  res.json({ status: 'success', message: 'Data cleared successfully' });
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

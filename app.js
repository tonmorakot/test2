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
  // ดึงค่าพารามิเตอร์จาก URL
  const { celsius, fahrenheit, kelvin } = req.query;

  // ตรวจสอบว่าข้อมูลครบถ้วน
  if (celsius && fahrenheit && kelvin) {
    // เก็บข้อมูลในตัวแปร temperatureData
    const newData = {
      celsius,
      fahrenheit,
      kelvin,
      timestamp: new Date().toLocaleString() // เพิ่มเวลาที่บันทึกข้อมูล
    };
    temperatureData.push(newData);

    // ตอบกลับเป็นตาราง HTML
    let tableRows = temperatureData
      .map((data, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${data.celsius} °C</td>
            <td>${data.fahrenheit} °F</td>
            <td>${data.kelvin} K</td>
            <td>${data.timestamp}</td>
          </tr>
        `;
      })
      .join('');

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
        </style>
      </head>
      <body>
        <h1>Temperature Data Received</h1>
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
            ${tableRows}
          </tbody>
        </table>
        <p>Total Records: ${temperatureData.length}</p>
      </body>
      </html>
    `);
  } else {
    res.status(400).send(`
      <h1>Error: Missing parameters</h1>
      <p>Please provide celsius, fahrenheit, and kelvin values.</p>
    `);
  }
});

// หน้าแรกสำหรับตรวจสอบข้อมูล
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to ESP8266 Temperature Logger</h1>
    <p>Use <code>/upload?celsius=VALUE&fahrenheit=VALUE&kelvin=VALUE</code> to send data.</p>
  `);
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

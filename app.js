const express = require('express');
const app = express();
const port = 3000; // พอร์ตที่ใช้ในการรันเซิร์ฟเวอร์

// Middleware: เพื่อรองรับ JSON และ URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint สำหรับรับค่าจาก ESP8266
app.get('/upload', (req, res) => {
  // ดึงค่าพารามิเตอร์จาก URL
  const { celsius, fahrenheit, kelvin } = req.query;

  // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
  if (celsius && fahrenheit && kelvin) {
    console.log(`Received data: Celsius: ${celsius}, Fahrenheit: ${fahrenheit}, Kelvin: ${kelvin}`);

    // ตอบกลับ ESP8266
    // res.json({
    //   status: 'success',
    //   message: 'Data received successfully',
    //   data: {
    //     celsius,
    //     fahrenheit,
    //     kelvin
    //   }
    // });
    // ตอบกลับ ESP8266 เป็นตาราง HTML
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
        width: 50%;
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
          <th>Type</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Celsius</td>
          <td>${celsius} °C</td>
        </tr>
        <tr>
          <td>Fahrenheit</td>
          <td>${fahrenheit} °F</td>
        </tr>
        <tr>
          <td>Kelvin</td>
          <td>${kelvin} K</td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>
`);

  } else {
    res.status(400).json({
      status: 'error',
      message: 'Missing parameters. Please send celsius, fahrenheit, and kelvin.'
    });
  }
});

// หน้าแรกสำหรับทดสอบ
app.get('/', (req, res) => {
  res.send('ESP8266 Backend Server is running!');
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

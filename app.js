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
    res.json({
      status: 'success',
      message: 'Data received successfully',
      data: {
        celsius,
        fahrenheit,
        kelvin
      }
    });
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

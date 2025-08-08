const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to generate AI email
app.post('/generate-email', async (req, res) => {
    const { prompt } = req.body;

    try {
        const aiResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const generatedEmail = aiResponse.data.choices[0].message.content;
        res.json({ email: generatedEmail });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Error generating email" });
    }
});

// Route to send email
app.post('/send-email', async (req, res) => {
    const { recipients, subject, content } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipients, // can be array or comma-separated string
            subject: subject,
            text: content
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending email" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

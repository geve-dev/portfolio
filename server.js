const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 3000;

// Configuração do Express para aceitar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Permite que seu frontend se conecte (CORS) - **IMPORTANTE PARA TESTE**
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Mude '*' para o seu domínio em produção
    res.header('Access-Control-Allow-Methods', 'POST, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Configuração do Transportador SMTP (Mantenha suas credenciais aqui)
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Variável de ambiente para o email
        pass: process.env.EMAIL_PASS  // Variável de ambiente para a senha
    }
});


// Rota POST para receber os dados do formulário
app.post('/send-email', (req, res) => {
    // Os dados do formulário estão em req.body
    const { name, email, mensagem } = req.body;

    // 1. Validar e-mails (Obrigatório)
    if (!email || !mensagem) {
        return res.status(400).send('Nome, Email e Mensagem são obrigatórios.');
    }

    // 2. Montar as opções do e-mail
    let mailOptions = {
        from: `"${name}" <mr.boceta333@gmail.com>`, // precisa ser a conta autenticada no Gmail
        to: 'gabrielviniciusdecs@gmail.com', // **SEU EMAIL (Onde você quer receber a mensagem)**
        replyTo: email, // responderá para o e-mail informado pelo usuário
        subject: `Nova mensagem de contato de: ${name}`,
        text: `Remetente: ${email}\n\nMensagem:\n${mensagem}`
    };

    // 3. Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Erro ao enviar email:', error.message);
            res.status(500).send('Erro ao enviar o email. Tente novamente mais tarde.');
        } else {
            console.log('✅ Email enviado para o servidor SMTP:', info.response);
            res.status(200).send('Mensagem enviada com sucesso! Obrigado.');
        }
    });
});

// Exporta o app para a Vercel
module.exports = app;
// api/send-email.js
const nodemailer = require('nodemailer');

// Exporta a função que a Vercel vai executar
module.exports = async (req, res) => {
    // 1. Configurar CORS
    // Essencial para o seu front-end (index.html) se comunicar com esta API
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente a requisições OPTIONS (pré-voo do CORS)
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Garante que só aceitamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        // req.body já está disponível em Serverless Functions da Vercel
        // O body deve ser um objeto, mas seu script.js envia URL-encoded.
        // É melhor adaptar o script.js para enviar JSON, mas vamos manter
        // a compatibilidade com o formato que o seu front-end envia.
        
        // Na Serverless Function Node "puro", `req.body` pode vir como string
        // ou buffer se não houver um middleware. Para URL-encoded, a Vercel 
        // normalmente já faz o parse para JSON se você usar o Content-Type correto
        // no seu frontend. Vamos extrair diretamente do body, assumindo que
        // a Vercel consegue fazer o parse do application/x-www-form-urlencoded.
        
        // Pelo seu script.js, os campos são 'name', 'email' e 'mensagem' (após renomear).
        const { name, email, mensagem } = req.body;

        // Validação básica
        if (!name || !email || !mensagem) {
            return res.status(400).json({ error: 'Nome, Email e Mensagem são obrigatórios.' });
        }

        // 2. Configuração do Nodemailer com Variáveis de Ambiente
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // ** IMPORTANTE: SUBSTITUÍDO POR VARIÁVEIS DE AMBIENTE **
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS 
            }
        });

        // 3. Montar as opções do e-mail
        let mailOptions = {
            // from: deve ser o e-mail autenticado (process.env.SMTP_USER)
            from: `"${name}" <${process.env.SMTP_USER}>`, 
            
            // to: SEUS e-mails de recebimento (Use process.env.EMAIL_TO ou bcc)
            // Se preferir o bcc: 'bowlcampos@gmail.com, valdeciosmarinodarosa@gmail.com, geizilima@icloud.com',
            to: process.env.EMAIL_TO || 'seu-email-principal-aqui@exemplo.com', 
            
            replyTo: email, 
            subject: `Nova mensagem de contato de: ${name}`,
            text: `Remetente: ${email}\n\nMensagem:\n${mensagem}`
        };

        // 4. Enviar o e-mail
        await transporter.sendMail(mailOptions);
        
        // 5. Resposta de sucesso (JSON)
        res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso! Obrigado.' });
        
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error.message);
        // 6. Resposta de erro (JSON)
        res.status(500).json({ success: false, error: 'Erro ao enviar o email. Tente novamente mais tarde.' });
    }
};
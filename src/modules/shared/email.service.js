function buildHtml({ header, body, footer }) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${header}</h2>
      <div>${body}</div>
      <hr />
      <p style="color: #888; font-size: 12px;">${footer}</p>
    </div>
  `;
}

function getFromAddress() {
  const configured = process.env.EMAIL_FROM;
  if (configured) return configured;
  const name = process.env.EMAIL_FROM_NAME || "EasyFood";
  return `${name} <onboarding@resend.dev>`;
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
  if (!to || !subject || !header || body === undefined || footer === undefined) {
    throw new Error("Destinatário e conteúdo do e-mail são obrigatórios");
  }

  const html = buildHtml({ header, body, footer });
  const apiKey = process.env.EMAIL_API_KEY;

  // Permite executar a atividade localmente sem expor ou inventar uma credencial.
  if (!apiKey) {
    console.warn(`[EMAIL] modo local: envio simulado para ${to} - "${subject}"`);
    return { simulated: true, to, toName, subject };
  }

  const apiUrl = process.env.EMAIL_API_URL || "https://api.resend.com/emails";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      html,
      text: `${header}\n\n${String(body).replace(/<[^>]+>/g, "")}\n\n${footer}`
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`API de e-mail respondeu ${response.status}: ${details}`);
  }

  const result = await response.json();
  console.log(`[EMAIL] enviado para ${to} - "${subject}"`);
  return result;
}

module.exports = { buildHtml, sendEmail };

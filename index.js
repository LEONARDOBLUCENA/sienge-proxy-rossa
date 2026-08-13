const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Credenciais vêm de variáveis de ambiente (configure no Railway em Settings → Variables).
// Nunca cole credenciais reais neste arquivo nem em chat.
const SIENGE_USER = process.env.SIENGE_USER;
const SIENGE_PASS = process.env.SIENGE_PASS;
const SIENGE_SUBDOMAIN = process.env.SIENGE_SUBDOMAIN; // ex: rossa
const SIENGE_BASE = `https://api.sienge.com.br/${SIENGE_SUBDOMAIN}/public/api/bulk-data/v1`;

if (!SIENGE_USER || !SIENGE_PASS || !SIENGE_SUBDOMAIN) {
  console.error('⚠️  Faltam variáveis de ambiente: SIENGE_USER, SIENGE_PASS, SIENGE_SUBDOMAIN');
}

const CREDS = Buffer.from(`${SIENGE_USER}:${SIENGE_PASS}`).toString('base64');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', configured: Boolean(SIENGE_USER && SIENGE_PASS && SIENGE_SUBDOMAIN) });
});

// Contas Pagas — /outcome
// selectionType=P (data de pagamento), correctionIndexerId=0 (sem correção monetária)
app.get('/sienge/outcome', async (req, res) => {
  try {
    const { start, end } = req.query;
    const url = `${SIENGE_BASE}/outcome?startDate=${start}&endDate=${end}&selectionType=P&correctionIndexerId=0&correctionDate=${end}`;
    const resp = await fetch(url, { headers: { 'Authorization': `Basic ${CREDS}` } });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Contas a Receber — /income
// selectionType=D (data de vencimento), retorna parcelas sem baixa
app.get('/sienge/income', async (req, res) => {
  try {
    const { start, end } = req.query;
    const url = `${SIENGE_BASE}/income?startDate=${start}&endDate=${end}&selectionType=D&correctionIndexerId=0&correctionDate=${end}`;
    const resp = await fetch(url, { headers: { 'Authorization': `Basic ${CREDS}` } });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy rodando na porta ${PORT}`));

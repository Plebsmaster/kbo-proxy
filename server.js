// server.js
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

app.post("/lookup", async (req, res) => {
  const { ondernemingsnummer } = req.body;

  if (!ondernemingsnummer) {
    return res.status(400).json({ error: "ondernemingsnummer is required" });
  }

  const soapEnvelope = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:kbo="http://economie.fgov.be/kbo">
    <soapenv:Header/>
    <soapenv:Body>
      <kbo:getOnderneming>
        <kbo:ondernemingsnummer>${ondernemingsnummer}</kbo:ondernemingsnummer>
      </kbo:getOnderneming>
    </soapenv:Body>
  </soapenv:Envelope>`;

  const auth = Buffer.from("wsot0761:vbV5pKuFMFL7nTTpwC4KhPvV").toString("base64");

  try {
    const response = await axios.post("https://kbopub.economie.fgov.be/kbopubwebservice/kbo/KBOService", soapEnvelope, {
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "Authorization": `Basic ${auth}`,
      },
    });

    res.send({ xml: response.data });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`KBO proxy running on port ${port}`));
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// CORS toevoegen om aanroepen vanuit Google Apps Script toe te staan
app.use(cors());
app.use(bodyParser.json());

app.post("/lookup", async (req, res) => {
  const { ondernemingsnummer } = req.body;
  
  if (!ondernemingsnummer) {
    return res.status(400).json({ error: "ondernemingsnummer is required" });
  }
  
  // Correcte SOAP envelope formatteren
  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:kbo="http://economie.fgov.be/kbopub">
  <soapenv:Header/>
  <soapenv:Body>
    <kbo:getEnterpriseByEnterpriseNumber>
      <kbo:enterpriseNumber>${ondernemingsnummer}</kbo:enterpriseNumber>
    </kbo:getEnterpriseByEnterpriseNumber>
  </soapenv:Body>
</soapenv:Envelope>`;

  const auth = Buffer.from("wsot0761:vbV5pKuFMFL7nTTpwC4KhPvV").toString("base64");
  
  try {
    const response = await axios.post(
      "https://kbopub.economie.fgov.be/kbopubwebservice/kbo/KBOService",
      soapEnvelope,
      {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          "SOAPAction": "",
          "Authorization": `Basic ${auth}`,
        },
      }
    );
    
    res.send({ xml: response.data });
  } catch (error) {
    console.error("KBO API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    res.status(500).send({ 
      error: error.toString(),
      details: error.response ? error.response.data : null
    });
  }
});

// Voeg een eenvoudige test-endpoint toe
app.get("/", (req, res) => {
  res.send("KBO proxy server is running!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`KBO proxy running on port ${port}`));
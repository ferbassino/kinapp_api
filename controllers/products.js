require("dotenv").config();
const { response } = require("express");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const client = new MercadoPagoConfig({
  accessToken: `${ACCESS_TOKEN}`,
});

exports.createPreference = async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://kinappweb.vercel.app",
        failure: "https://kinappweb.vercel.app",
        pending: "https://kinappweb.vercel.app",
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.json({
      result: result.id,
    });
  } catch (error) {
    res.status(500).json({
      error: "error al crear preferencia",
    });
  }
};
exports.getPayments = async (req, res) => {
  const { topic, id } = req.query;
  console.log("request", req.query);
  res.json({ success: true });
};

export default async function handler(req, res) {

  try {

    const SHOP = process.env.SHOPIFY_SHOP;

    const response = await fetch(
      `https://${SHOP}.myshopify.com/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.SHOPIFY_CLIENT_ID,
          client_secret: process.env.SHOPIFY_CLIENT_SECRET
        })
      }
    );

    const text = await response.text();

    return res.status(200).send({
      status: response.status,
      response: text
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}

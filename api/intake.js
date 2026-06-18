export default async function handler(req, res) {

  return res.status(200).json({
    SHOPIFY_STORE: process.env.SHOPIFY_STORE || null,
    SHOPIFY_SHOP: process.env.SHOPIFY_SHOP || null
  });

}

export default async function handler(req, res) {

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://www.chefcalvinskitchen.com'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { phone } = req.body;

    const tokenResponse = await fetch(
      `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/oauth/access_token`,
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

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    const searchResponse = await fetch(
      `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2025-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({
          query: `
            query ($query: String!) {
              customers(first: 5, query: $query) {
                edges {
                  node {
                    id
                    phone
                  }
                }
              }
            }
          `,
          variables: {
            query: \`phone:${phone}\`
          }
        })
      }
    );

    const searchData = await searchResponse.json();

    const exists =
      searchData?.data?.customers?.edges?.some(
        edge => edge.node.phone === phone
      );

    return res.status(200).json({
      exists
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}

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

const {
  first_name,
  last_name,
  email,
  preferred_name,
  date_of_birth,
  membership_plan,
  delivery_window,
  delivery_access_notes,
  household_size,
  household_ages
} = req.body;

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
        query ($email: String!) {
          customers(first: 1, query: $email) {
            edges {
              node {
                id
                email
              }
            }
          }
        }
      `,
      variables: {
        email: `email:${email}`
      }
    })
  }
);

const searchData = await searchResponse.json();

console.log(
  "SEARCH RESULT:",
  JSON.stringify(searchData, null, 2)
);

let customerId = null;

if (
  searchData.data.customers.edges.length > 0
) {
  customerId =
    searchData.data.customers.edges[0].node.id;
}

console.log(
  "FOUND CUSTOMER:",
  customerId
);
    

if (!customerId) {

  const customerResponse = await fetch(
    `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({
        query: `
          mutation customerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            firstName: first_name,
            lastName: last_name,
            email: email
          }
        }
      })
    }
  );

  const customerData =
    await customerResponse.json();

  customerId =
    customerData.data.customerCreate.customer.id;
}
    

await fetch(
  `https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2025-01/graphql.json`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({
      query: `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        metafields: [
          {
            ownerId: customerId,
            namespace: "custom",
            key: "preferred_name",
            type: "single_line_text_field",
            value: preferred_name || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "date_of_birth",
            type: "date",
            value: date_of_birth || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "membership_plan_selected",
            type: "single_line_text_field",
            value: membership_plan || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "delivery_window",
            type: "single_line_text_field",
            value: delivery_window || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "delivery_access_notes",
            type: "multi_line_text_field",
            value: delivery_access_notes || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "household_size",
            type: "number_integer",
            value: household_size || "0"
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "household_ages",
            type: "multi_line_text_field",
            value: household_ages || ""
          }
        ]
      }
    })
  }
);

return res.status(200).json({
  success: true,
  customerId
});

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}

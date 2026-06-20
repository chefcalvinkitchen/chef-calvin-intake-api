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
  household_ages,
  meals_needed,
  favorite_cuisines,
  excluded_cuisines,
  dietary_restrictions,
  allergies,
  intolerances,
  excluded_ingredients,
  favorite_ingredients,
  health_goals,
  clinical_recommendations,
  protein_importance,
  gut_health_importance,
  calorie_management_importance,
  spice_level,
  texture_preferences,
  preferred_proteins,
  excluded_proteins,
  additional_notes
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
    

const metafieldResponse = await fetch(
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
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "meals_needed",
            type: "multi_line_text_field",
            value: Array.isArray(meals_needed)
              ? meals_needed.join(", ")
              : meals_needed || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "favorite_cuisines",
            type: "multi_line_text_field",
            value: Array.isArray(favorite_cuisines)
              ? favorite_cuisines.join(", ")
              : favorite_cuisines || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "excluded_cuisines",
            type: "multi_line_text_field",
            value: Array.isArray(excluded_cuisines)
              ? excluded_cuisines.join(", ")
              : excluded_cuisines || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "dietary_restrictions",
            type: "multi_line_text_field",
            value: Array.isArray(dietary_restrictions)
              ? dietary_restrictions.join(", ")
              : dietary_restrictions || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "allergies",
            type: "multi_line_text_field",
            value: allergies || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "intolerances",
            type: "multi_line_text_field",
            value: intolerances || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "excluded_ingredients",
            type: "multi_line_text_field",
            value: excluded_ingredients || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "favorite_ingredients",
            type: "multi_line_text_field",
            value: favorite_ingredients || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "health_goals",
            type: "multi_line_text_field",
            value: Array.isArray(health_goals)
              ? health_goals.join(", ")
              : health_goals || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "clinical_recommendations",
            type: "multi_line_text_field",
            value: clinical_recommendations || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "protein_importance",
            type: "number_integer",
            value: String(protein_importance || 0)
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "gut_health_importance",
            type: "number_integer",
            value: String(gut_health_importance || 0)
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "calorie_management_importance",
            type: "number_integer",
            value: String(calorie_management_importance || 0)
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "spice_level",
            type: "single_line_text_field",
            value: spice_level || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "texture_preferences",
            type: "multi_line_text_field",
            value: Array.isArray(texture_preferences)
              ? texture_preferences.join(", ")
              : texture_preferences || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "preferred_proteins",
            type: "multi_line_text_field",
            value: Array.isArray(preferred_proteins)
              ? preferred_proteins.join(", ")
              : preferred_proteins || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "excluded_proteins",
            type: "multi_line_text_field",
            value: Array.isArray(excluded_proteins)
              ? excluded_proteins.join(", ")
              : excluded_proteins || ""
          },
          {
            ownerId: customerId,
            namespace: "custom",
            key: "additional_notes",
            type: "multi_line_text_field",
            value: additional_notes || ""
          }
        ]
      }
    })
  }
);

const metafieldData =
  await metafieldResponse.json();

console.log(
  "METAFIELD RESULT:",
  JSON.stringify(metafieldData, null, 2)
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

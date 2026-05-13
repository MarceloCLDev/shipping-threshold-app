import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const enabled = formData.get("enabled") === "true";

  // 1. Get shop ID
  const shopResponse = await admin.graphql(`
    #graphql
    query {
      shop {
        id
      }
    }
  `);

  const shopData = await shopResponse.json();

  const shopId = shopData.data.shop.id;

  // 2. Config to save
  const config = {
    enabled,
    optionA: "Standard U.S.",
    optionAPrice: "$59.00",
    optionB: "Free Standard U.S. Shipping",
    optionBPrice: "$69.00",
  };

  // 3. Save metafield
  const response = await admin.graphql(
    `#graphql
    mutation SaveSplitTestConfig($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
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
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "shipping_threshold_split_test",
            key: "config",
            type: "json",
            value: JSON.stringify(config),
          },
        ],
      },
    },
  );

  const data = await response.json();

  const errors = data.data.metafieldsSet.userErrors;

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    message: enabled ? "A/B test activated" : "A/B test disabled",
    config,
  };
}